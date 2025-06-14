import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pkg = require('../package.json');

// Local project path for commands
const LOCAL_COMMANDS_PATH = path.join(process.cwd(), '.cmdpalette.json');

let localCommands = null;
let remoteCommands = null;

/**
 * Loads the local commands from cmdpalette.json
 */
function loadLocalCommands() {
  if (fs.existsSync(LOCAL_COMMANDS_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(LOCAL_COMMANDS_PATH, 'utf-8'));
    } catch (err) {
      console.error('❌ Failed to parse cmdpalette.json. Please check the file format.');
      process.exit(1);
    }
  } else {
    return null; // Important: Allow init to create it later
  }
}

/**
 * Fetches remote commands from a given URL and updates the local cache
 */
export async function fetchRemoteCommands(remoteUrl) {
  try {
    const response = await axios.get(remoteUrl);
    remoteCommands = response.data;

    // Sync version
    remoteCommands.version = pkg.version;

    // Update local file if changes are found
    if (JSON.stringify(remoteCommands) !== JSON.stringify(localCommands)) {
      console.log('⚡ Updating local commands to latest version...');
      fs.writeFileSync(LOCAL_COMMANDS_PATH, JSON.stringify(initialData, null, 2));
console.log(chalk.cyan(`🗂️  Created: ${LOCAL_COMMANDS_PATH}`));
      console.log(chalk.green(`📦  Fetched remote commands:`));
      console.log(remoteCommands, null, 2);
      localCommands = loadLocalCommands();
    }
  } catch (error) {
    console.log('⚠️ Failed to fetch remote commands. Using local cache if available.');
  }
}

/**
 * Ensures local commands exist; if not, pulls from remote
 */
export async function ensureCommands(remoteUrl) {
  if (!localCommands) {
    localCommands = loadLocalCommands();
  }

  if (!localCommands || Object.keys(localCommands).length <= 1) {
    console.log('⚡ Local commands not found or empty. Fetching from remote...');
    await fetchRemoteCommands(remoteUrl);
    localCommands = loadLocalCommands();

    if (!localCommands) {
      console.warn('⚠️ Failed to fetch commands. CLI will continue with limited functionality.');
      localCommands = { version: '0.0.0' };
    }
  }
}

/**
 * Safely retrieves local commands, with validation
 */
export function getCommands() {
  if (!localCommands) {
    localCommands = loadLocalCommands();
  }

  if (!localCommands) {
    console.log('❌ No cmdpalette.json found. Please run `cmdease init` to initialize.');
    process.exit(1);
  }

  return localCommands;
}

/**
 * Retrieves all command categories except the version key
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
 * Automatically pulls remote commands if CLI version changes
 */
export async function autoPullOnVersionChange(remoteUrl) {
  if (!localCommands) {
    localCommands = loadLocalCommands();
  }

  const currentVersion = pkg.version;
  const localVersion = localCommands?.version || '0.0.0';

  if (localVersion !== currentVersion) {
    console.log(`🆕 CLI updated from ${localVersion} to ${currentVersion}. Pulling latest commands...`);
    await fetchRemoteCommands(remoteUrl);
  }
}
