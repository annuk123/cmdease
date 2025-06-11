#!/usr/bin/env node


import inquirer from 'inquirer';
import autocompletePrompt from 'inquirer-autocomplete-prompt';
inquirer.registerPrompt('autocomplete', autocompletePrompt);

import { fetchRemoteCommands, getCommands } from '../lib/commandLoader.js';

import chalk from 'chalk';
import shell from 'shelljs';
import fs from 'fs';
import fuzzy from 'fuzzy';

import { addToHistory, getHistory, syncLocalHistory } from '../lib/historyService.js';
import { toggleFavorite, getFavorites, syncLocalFavorites } from '../lib/favoritesService.js';
import { isOnline } from '../lib/connection.js';
import { loadLocalHistory, loadLocalFavorites } from '../lib/localCache.js';

const configPath = './.cmdpalette.json';
if (!fs.existsSync(configPath)) {
  console.log(chalk.red('❌ No .cmdpalette.json found'));
  process.exit(1);
}

let list = [];
let categories = [];

function buildCommandList() {
  const commands = getCommands();
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

buildCommandList();

async function autoRefreshCommands(remoteUrl) {
  await fetchRemoteCommands(remoteUrl);
  buildCommandList();
  console.log(chalk.yellow('🔄 Commands updated from remote.'));

  setInterval(async () => {
    await fetchRemoteCommands(remoteUrl);
    buildCommandList();
    console.log(chalk.yellow('🔄 Commands auto-refreshed from remote.'));
  }, 30000);
}

const remoteUrl = 'https://raw.githubusercontent.com/yourusername/yourrepo/main/.cmdpalette.json';
(async () => {
await autoRefreshCommands(remoteUrl);

const packageJson = require('../package.json');
if (process.argv.includes('--version')) {
  console.log(`cmdease CLI version: ${packageJson.version}`);
  process.exit(0);
}

let online = false;

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

// Graceful exit
process.on('SIGINT', () => {
  console.log(chalk.blue('\n👋 Exiting cmdease CLI. Bye!'));
  process.exit(0);
});


  online = await isOnline();

  if (online) {
    console.log(chalk.green('✅ You are Online (Convex Live)'));
    await syncLocalHistory();
    await syncLocalFavorites();
  } else {
    console.log(chalk.red('❌ You are Offline (Local Cache Active)'));
  }

  syncWhenOnline(); // Keep watching for reconnection

  const statusBadge = online ? chalk.green('Online') : chalk.red('Offline');

  // Smart category filter
  const { selectedCategory } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedCategory',
      message: `${statusBadge}  Select a category:`,
      choices: categories
    }
  ]);

  // Smart search within the category
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

  await addToHistory(selected, online);

  const { favorite } = await inquirer.prompt([
    { type: 'confirm', name: 'favorite', message: '⭐ Add/Remove this command from favorites?', default: false }
  ]);

  if (favorite) {
    await toggleFavorite(selected, online);
  }
})();
