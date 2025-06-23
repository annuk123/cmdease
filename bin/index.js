#!/usr/bin/env node

import inquirer from 'inquirer';
import autocompletePrompt from 'inquirer-autocomplete-prompt';
import { program } from 'commander';
import chalk from 'chalk';
import fs from 'fs';
import fuzzy from 'fuzzy';
import ora from 'ora';
import path from 'path';
import os from 'os';
import { checkConvexProject } from '../lib/convexUtils.js';


import { runInteractiveCommand } from '../lib/commandExecutor.js';
import { fetchRemoteCommands, getCommands, ensureCommands, autoPullOnVersionChange } from '../lib/commandLoader.js';
import { startConnectionMonitor } from '../lib/connectionMonitor.js';
import { addToHistory, getHistory, syncLocalHistory } from '../lib/historyService.js';
import { toggleFavorite, getFavorites, syncLocalFavorites } from '../lib/favoritesService.js';
import { isOnline } from '../lib/connection.js';
import { loadLocalHistory, loadLocalFavorites } from '../lib/localCache.js';

inquirer.registerPrompt('autocomplete', autocompletePrompt);

const remoteUrl = 'https://raw.githubusercontent.com/annuk123/cmdease/main/.cmdpalette.json';

const CONFIG_FILE = path.join(os.homedir(), '.cmdease-config.json');

// 🌐 Global Config for Convex Path
export function saveConvexPath(projectPath) {
  const config = { convexPath: projectPath };
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export function getConvexPath() {
  if (!fs.existsSync(CONFIG_FILE)) return null;

  const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
  return config.convexPath || null;
}

// CLI Commands
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
.command('link <projectPath>')
  .description('Link cmdease to a Convex project')
  .action((projectPath) => {
    const absolutePath = path.resolve(projectPath); // Convert to absolute path
    saveConvexPath(absolutePath);
    console.log(chalk.green(`🔗 Successfully linked cmdease to Convex project at: ${absolutePath}`));
    process.exit(0);
  });
program
  .action(() => {
    main(); // Main CLI entry point
  });

program.parse(process.argv);

// 🛠️ Custom Help
if (process.argv.includes('--help')) {
  console.log(`
${chalk.cyan('cmdease - Developer Command Palette CLI')}

${chalk.yellow('Usage:')}
  cmdease                Start the interactive CLI
  cmdease init           Initialize cmdease in this project
  cmdease pull           Manually sync commands
  cmdease link <path>    Link to Convex project path
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
  cmdease link ~/projects/my-convex-app

Happy Coding! 🚀
`);
  process.exit(0);
}

let list = [];
let online = false;

function buildCommandList() {
  const commands = getCommands() || {};
  list = [];

  for (const category in commands) {
    if (category === 'version') continue;

    for (const cmdName in commands[category]) {
      list.push({
        name: `${chalk.blue(category)} → ${chalk.green(cmdName)}`,
        value: {
          command: commands[category][cmdName],
          category,
          cmdName
        }
      });
    }
  }
}


export async function handleConvexLinking() {
  const linkedPath = getConvexPath();

  // If no path linked or if linked path is invalid
  if (!linkedPath || !fs.existsSync(path.join(linkedPath, '_generated', 'api.js'))) {

    // If previously linked but now broken
    if (linkedPath) {
      console.log(chalk.red('⚠️ Convex project not detected at the linked path. It may have been moved or deleted.\n'));
      unlinkConvexPath();
      console.log(chalk.red('⚡ Previous Convex link removed due to invalid path.\n'));
    }

    // Check if a Convex project exists in current directory
    if (fs.existsSync('./convex')) {
      console.log(chalk.yellow('👉 Convex project detected in this directory.\n'));

      const { shouldLink } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'shouldLink',
          message: 'Do you want to link this Convex project now?',
          default: true,
        },
      ]);

      if (shouldLink) {
        const absolutePath = path.resolve('./convex');
        saveConvexPath(absolutePath);
        console.log(chalk.green(`🔗 Successfully linked Convex project to cmdease at: ${absolutePath}\n`));
      } else {
        console.log(chalk.yellow('⚡ Skipping Convex linking. Running in offline/local mode.\n'));
      }
    } else {
      console.log(chalk.yellow('⚡ No Convex project found. Running in offline/local mode.\n'));
    }
  }
}



async function main() {
  console.log(chalk.blue('👋 Welcome to cmdease CLI!'));

  // 🔗 Convex Project Linking
  await handleConvexLinking();
  const isConvexLinked = checkConvexProject();

  if (!isConvexLinked) {
    console.log(chalk.yellow('⚡ No Convex project linked. Running in offline/local mode.\n'));
  }

  // 🔍 Check if command file exists
  if (!fs.existsSync('./.cmdpalette.json')) {
    console.log(chalk.red('❌ No .cmdpalette.json found. Please run `cmdease init`.'));
    process.exit(1);
  }

  try {
    await ensureCommands(remoteUrl);
    await autoPullOnVersionChange(remoteUrl);
    startConnectionMonitor();
    await autoRefreshCommands(remoteUrl);

    online = await isOnline();

    if (online && isConvexLinked) {
      console.log(chalk.green('✅ You are Online (Convex Live)'));
      await syncLocalHistory();
      await syncLocalFavorites();

      // Sync only when Convex is linked
      syncWhenOnline();
    } else if (online && !isConvexLinked) {
      console.log(chalk.yellow('⚡ Online but no Convex project linked. Skipping sync.'));
    } else {
      console.log(chalk.red('❌ You are Offline (Local Cache Active)'));
    }

    const spinner = ora('Fetching categories...').start();
    const commands = getCommands();
    const categories = Object.keys(commands).filter(key => key !== 'version');

    if (categories.length === 0) {
      spinner.fail('⚠️ No categories available. Try to sync now.');
      process.exit(0);
    } else {
      spinner.succeed('✔ Categories fetched successfully!');
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

    await promptNavigator(commands[selectedCategory]);

  } catch (err) {
    console.error(chalk.red('❌ Unexpected error:'), err);
  }
}


async function promptNavigator(node) {
  try {
    if (typeof node === 'string') {
      console.log(chalk.blue(`\n🚀 Running: ${node}\n`));
      await runInteractiveCommand(node);
      return;
    }

    const choices = Object.keys(node);

    const { selectedKey } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedKey',
        message: 'Select an option:',
        choices: choices,
      }
    ]);

    await promptNavigator(node[selectedKey]);
  } catch (err) {
    console.error(chalk.red('❌ Unexpected error in navigator:'), err);
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
    .map(fav => list.find(item => item.value.cmdName === fav.cmdName && item.value.category === fav.category))
    .filter(Boolean);

  const historyList = history
    .map(hist => list.find(item => item.value.cmdName === hist.cmdName && item.value.category === hist.category))
    .filter(Boolean);

  const others = list.filter(item =>
    !favorites.some(fav => fav.cmdName === item.value.cmdName && fav.category === item.value.category) &&
    !history.some(hist => hist.cmdName === item.value.cmdName && hist.category === item.value.category)
  );

  return [...favoriteList, ...historyList, ...others];
}

async function searchCommands(category, input = '') {
  const sortedList = await buildList();
  const filteredList = sortedList.filter(item => item.value.category === category);
  const results = fuzzy.filter(input, filteredList, { extract: el => el.name });

  return Promise.resolve(results.map(r => ({
    name: r.original.name,
    value: r.original.value
  })));
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
