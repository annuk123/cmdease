#!/usr/bin/env node

import inquirer from 'inquirer';
import autocompletePrompt from 'inquirer-autocomplete-prompt';
inquirer.registerPrompt('autocomplete', autocompletePrompt);

import { program } from 'commander';
import chalk from 'chalk';
import shell from 'shelljs';
import fs from 'fs';
import fuzzy from 'fuzzy';
import ora from 'ora';

import { 
  fetchRemoteCommands, 
  getCommands, 
  ensureCommands, 
  autoPullOnVersionChange 
} from '../lib/commandLoader.js';

import { startConnectionMonitor } from '../lib/connectionMonitor.js';
import { addToHistory, getHistory, syncLocalHistory } from '../lib/historyService.js';
import { toggleFavorite, getFavorites, syncLocalFavorites } from '../lib/favoritesService.js';
import { isOnline } from '../lib/connection.js';
import { loadLocalHistory, loadLocalFavorites } from '../lib/localCache.js';

const remoteUrl = 'https://raw.githubusercontent.com/annuk123/cmdease/main/.cmdpalette.json';

program
  .name('cmdease')
  .description('Command Palette CLI')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize cmdease in this project')
  .action(async () => {
    const { initializeCmdease } = await import('../lib/init.js');
    await initializeCmdease();
  });

program
  .command('pull')
  .description('Manually fetch and update commands')
  .action(async () => {
    const { manualPull } = await import('../lib/commandLoader.js');
    await manualPull();
  });

program
  .action(() => {
    main(); // Call the main function
  });

program.parse(process.argv);

// ✅ Check for cmdpalette.json
if (!fs.existsSync('./.cmdpalette.json')) {
  console.log(chalk.red('❌ No .cmdpalette.json found. Please run `cmdease init`.'));
  process.exit(1);
}

// ✅ Show custom help
if (process.argv.includes('--help')) {
  console.log(`
${chalk.cyan('cmdease - Developer Command Palette CLI')}

${chalk.yellow('Usage:')}
  cmdease                Start the interactive CLI
  cmdease init           Initialize cmdease in this project
  cmdease pull           Manually sync commands
  cmdease --help         Show this help message
  cmdease --version      Show CLI version

${chalk.yellow('Features:')}
  ✔ Sync commands from GitHub
  ✔ Run categorized commands
  ✔ Favorite frequently used commands
  ✔ Auto-refresh commands every 30 seconds
  ✔ Offline support with local cache
  ✔ Auto pull on CLI version update

${chalk.yellow('Example:')}
  cmdease
  cmdease --version
  cmdease --help

Happy Coding! 🚀
`);
  process.exit(0);
}

let list = [];
let categories = [];
let online = false;

function buildCommandList() {
  const commands = getCommands() || {};
  list = [];

  for (const category in commands) {
    if (category === 'version') continue;

    for (const cmdName in commands[category]) {
      list.push({
        name: `${chalk.blue(category)} → ${chalk.green(cmdName)}`,
        value: commands[category][cmdName],
        category,
        cmdName
      });
    }
  }

  categories = [...new Set(list.map(item => item.category))];
}

async function main() {
  try {
    await ensureCommands(remoteUrl);
    await autoPullOnVersionChange(remoteUrl);
    buildCommandList();
    startConnectionMonitor();
    await autoRefreshCommands(remoteUrl);

    online = await isOnline();

    if (online) {
      console.log(chalk.green('✅ You are Online (Convex Live)'));
      await syncLocalHistory();
      await syncLocalFavorites();
    } else {
      console.log(chalk.red('❌ You are Offline (Local Cache Active)'));
    }

    syncWhenOnline();

    const spinner = ora('Fetching categories...').start();
    categories = getCategories();

    if (categories.length === 0) {
      spinner.fail('⚠️ No categories available. Try to sync now.');
      process.exit(0);
    } else {
      spinner.succeed('Categories fetched successfully!');
    }

    const { selectedCategory } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedCategory',
        message: 'Select a category:',
        choices: categories.map(cat => ({ name: cat, value: cat })),
      }
    ]);

    console.log(`👉 You selected: ${selectedCategory}`);

    const { cmd } = await inquirer.prompt([
      {
        type: 'autocomplete',
        name: 'cmd',
        message: `${online ? chalk.green('Online') : chalk.red('Offline')}  Start typing to search a command:`,
        source: (answersSoFar, input) => searchCommands(selectedCategory, input)
      }
    ]);

    const selected = list.find(item => item.value === cmd);

    console.log(chalk.blue(`\n🚀 Running: ${cmd}\n`));
    shell.exec(cmd);

    await addToHistory(selected);

    const { favorite } = await inquirer.prompt([
      { type: 'confirm', name: 'favorite', message: '⭐ Add/Remove this command from favorites?', default: false }
    ]);

    if (favorite) {
      await toggleFavorite(selected);
    }
  } catch (err) {
    console.error(chalk.red('❌ Unexpected error:'), err);
  }
}

async function autoRefreshCommands(remoteUrl) {
  try {
    await fetchRemoteCommands(remoteUrl);
    buildCommandList();
    console.log(chalk.yellow('🔄 Commands auto-refreshed from remote.'));
  } catch (err) {
    console.log(chalk.yellow('⚠️ Failed to fetch remote commands. Using local cache.'));
  }

  setInterval(async () => {
    try {
      await fetchRemoteCommands(remoteUrl);
      buildCommandList();
      console.log(chalk.yellow('🔄 Commands auto-refreshed from remote.'));
    } catch (err) {
      console.log(chalk.yellow('⚠️ Auto-refresh failed.'));
    }
  }, 30000);
}

async function buildList() {
  const history = online ? await getHistory() : loadLocalHistory();
  const favorites = online ? await getFavorites() : loadLocalFavorites();

  const favoriteList = favorites
    .map(fav => list.find(item => item.cmdName === fav.cmdName && item.category === fav.category))
    .filter(Boolean);

  const historyList = history
    .map(hist => list.find(item => item.cmdName === hist.cmdName && item.category === hist.category))
    .filter(Boolean);

  const others = list.filter(item =>
    !favorites.some(fav => fav.cmdName === item.cmdName && fav.category === item.category) &&
    !history.some(hist => hist.cmdName === item.cmdName && hist.category === item.category)
  );

  return [...favoriteList, ...historyList, ...others];
}

async function searchCommands(category, input = '') {
  const sortedList = await buildList();
  const filteredList = sortedList.filter(item => item.category === category);
  const results = fuzzy.filter(input, filteredList, { extract: el => el.name });
  return Promise.resolve(results.map(r => r.original));
}

async function syncWhenOnline() {
  setInterval(async () => {
    if (!online && await isOnline()) {
      console.log(chalk.green('\n✅ Connection restored! Auto-syncing...'));
      await syncLocalHistory();
      await syncLocalFavorites();
      online = true;
    }
  }, 5000);
}

process.on('SIGINT', () => {
  console.log(chalk.blue('\n👋 Exiting cmdease CLI. Bye!'));
  process.exit(0);
});

function getCategories() {
  const commands = getCommands() || {};
  return Object.keys(commands).filter(key => key !== 'version');
}
