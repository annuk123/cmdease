import fs from 'fs';
import path from 'path';
import axios from 'axios';
import chalk from 'chalk';
import isEqual from 'lodash.isequal';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pkg = require('../package.json');

const LOCAL_COMMANDS_PATH = path.join(process.cwd(), '.cmdpalette.json');

let localCommands = null;
let remoteCommands = null;

/**
 * Loads the local commands from .cmdpalette.json (with caching)
 */
function loadLocalCommands() {
  if (localCommands) return localCommands;

  if (fs.existsSync(LOCAL_COMMANDS_PATH)) {
    try {
      localCommands = JSON.parse(fs.readFileSync(LOCAL_COMMANDS_PATH, 'utf-8'));
      return localCommands;
    } catch (err) {
      console.error('❌ Failed to parse .cmdpalette.json. Please check the file format.');
      process.exit(1);
    }
  } else {
    return null; // Allow init to create it later
  }
}

/**
 * Fetches remote commands from a given URL and updates the local cache if changed
 */
export async function fetchRemoteCommands(remoteUrl) {
  try {
    const response = await axios.get(remoteUrl);
    remoteCommands = response.data;

    // Sync version
    remoteCommands.version = pkg.version;

    console.log(chalk.cyan(`🗂️  Fetched remote commands successfully.`));
    console.log(remoteCommands);

    // Update local file if changes are found
    if (!isEqual(remoteCommands, loadLocalCommands())) {
      console.log('⚡ Updating local commands to latest version...');
      fs.writeFileSync(LOCAL_COMMANDS_PATH, JSON.stringify(remoteCommands, null, 2));
      console.log(chalk.cyan(`🗂️  Updated: ${LOCAL_COMMANDS_PATH}`));
      localCommands = loadLocalCommands();
    }
  } catch (error) {
    console.log('⚠️ Failed to fetch remote commands. Using local cache if available.');

    if (!localCommands) {
      console.log(chalk.red('❌ No local commands found. CLI may not function properly.'));
    }
  }
}

/**
 * Ensures local commands exist; if not, pulls from remote
 */
export async function ensureCommands(remoteUrl) {
  if (!loadLocalCommands() || Object.keys(localCommands).length <= 1) {
    console.log('⚡ Local commands not found or empty. Fetching from remote...');
    await fetchRemoteCommands(remoteUrl);
    if (!loadLocalCommands()) {
      console.warn('⚠️ Failed to fetch commands. CLI will continue with limited functionality.');
      localCommands = { version: '0.0.0' };
    }
  }
}

/**
 * Returns the loaded local commands
 */
export function getCommands() {
  if (!loadLocalCommands()) {
    console.log('❌ No .cmdpalette.json found. Please run `cmdease init` to initialize.');
    process.exit(1);
  }
  return localCommands;
}

/**
 * Returns the list of command categories
 */
export function getCategories() {
  try {
    const commands = getCommands();
    if (!commands || Object.keys(commands).length <= 1) {
      console.log('⚠️ No commands found.');
      return [];
    }
    return Object.keys(commands).filter(key => key !== 'version');
  } catch (error) {
    console.error('❌ Failed to get categories:', error);
    return [];
  }
}

/**
 * Checks if the CLI version has changed and pulls latest commands if needed
 */
export async function autoPullOnVersionChange(remoteUrl) {
  if (!loadLocalCommands()) {
    console.warn('⚠️ Local commands not loaded.');
    return;
  }

  const currentVersion = pkg.version;
  const localVersion = localCommands?.version || '0.0.0';

  if (localVersion !== currentVersion) {
    console.log(`🆕 CLI updated from ${localVersion} to ${currentVersion}. Pulling latest commands...`);
    await fetchRemoteCommands(remoteUrl);
  }
}
