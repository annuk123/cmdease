#!/usr/bin/env node

import inquirer from 'inquirer';
import autocompletePrompt from 'inquirer-autocomplete-prompt';
inquirer.registerPrompt('autocomplete', autocompletePrompt);
import { startConnectionMonitor } from '../lib/connectionMonitor.js';
import { fetchRemoteCommands, getCommands } from '../lib/commandLoader.js';
import chalk from 'chalk';
import shell from 'shelljs';
import fs from 'fs';
import fuzzy from 'fuzzy';
import ora from 'ora';

import { addToHistory, getHistory, syncLocalHistory } from '../lib/historyService.js';
import { toggleFavorite, getFavorites, syncLocalFavorites } from '../lib/favoritesService.js';
import { isOnline } from '../lib/connection.js';
import { loadLocalHistory, loadLocalFavorites } from '../lib/localCache.js';

let online = false;

const configPath = './.cmdpalette.json';
if (!fs.existsSync(configPath)) {
  console.log(chalk.red('❌ No .cmdpalette.json found'));
  process.exit(1);
}

let list = [];
let categories = [];

function buildCommandList() {
  const commands = getCommands() || {};
  list = [];

  for (const category in commands) {
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

function getCategories() {
  const commands = getCommands() || {};
  return Object.keys(commands);
}

buildCommandList();
startConnectionMonitor();

async function autoRefreshCommands(remoteUrl) {
  try {
    await fetchRemoteCommands(remoteUrl);
    buildCommandList();
    console.log(chalk.yellow('🔄 Commands updated from remote.'));
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

const remoteUrl = 'https://raw.githubusercontent.com/annuk123/cmdease/main/.cmdpalette.json'; 

(async () => {
  await autoRefreshCommands(remoteUrl);

  if (process.argv.includes('--version')) {
    const packageJson = await import('../package.json', { assert: { type: 'json' } });
    console.log(`cmdease CLI version: ${packageJson.default.version}`);
    process.exit(0);
  }

  online = await isOnline();

  if (online) {
    console.log(chalk.green('✅ You are Online (Convex Live)'));
    await syncLocalHistory();
    await syncLocalFavorites();
  } else {
    console.log(chalk.red('❌ You are Offline (Local Cache Active)'));
  }

  syncWhenOnline();

  const statusBadge = online ? chalk.green('Online') : chalk.red('Offline');

  const spinner = ora('Fetching categories...').start();

  try {
    categories = getCategories();

    if (categories.length === 0) throw new Error('No categories available');

    spinner.succeed('Categories fetched successfully!');
  } catch (err) {
    spinner.fail('Failed to fetch categories.');
    console.log(chalk.yellow('⚠️ No categories available. You can try to sync now.'));
    const { syncNow } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'syncNow',
        message: 'Do you want to sync now?',
        default: true
      }
    ]);

    if (syncNow) {
      try {
        await fetchRemoteCommands(remoteUrl);
        buildCommandList();
        categories = getCategories();

        if (categories.length === 0) {
          console.log(chalk.red('❌ Still no categories available after sync. Exiting.'));
          process.exit(0);
        } else {
          console.log(chalk.green('✅ Categories fetched successfully after sync!'));
        }
      } catch (syncErr) {
        console.log(chalk.red('❌ Sync failed. Exiting.'));
        process.exit(0);
      }
    } else {
      console.log(chalk.blue('👋 Exiting cmdease CLI. Bye!'));
      process.exit(0);
    }
  }

  const { selectedCategory } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedCategory',
      message: 'Select a category:',
      choices: categories.map((cat) => ({ name: cat, value: cat })),
    },
  ]);

  console.log(`👉 You selected: ${selectedCategory}`);

  const { cmd } = await inquirer.prompt([
    {
      type: 'autocomplete',
      name: 'cmd',
      message: `${statusBadge}  Start typing to search a command:`,
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
})();

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
