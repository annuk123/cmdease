import fs from 'fs';
import os from 'os';
import path from 'path';
import axios from 'axios';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pkg = require('../package.json');

const CONFIG_DIR = path.join(os.homedir(), '.cmdease');
if (!fs.existsSync(CONFIG_DIR)) {
  fs.mkdirSync(CONFIG_DIR);
}

const LOCAL_COMMANDS_PATH = path.join(CONFIG_DIR, 'cmdpalette.json');
let localCommands = loadLocalCommands();
let remoteCommands = null;

function loadLocalCommands() {
  if (fs.existsSync(LOCAL_COMMANDS_PATH)) {
    return JSON.parse(fs.readFileSync(LOCAL_COMMANDS_PATH, 'utf-8'));
  }
  return { version: '0.0.0' };
}

export async function fetchRemoteCommands(remoteUrl) {
  try {
    const response = await axios.get(remoteUrl);
    remoteCommands = response.data;

    remoteCommands.version = pkg.version;

    if (JSON.stringify(remoteCommands) !== JSON.stringify(localCommands)) {
      console.log('⚡ Updating local commands to latest version...');
      fs.writeFileSync(LOCAL_COMMANDS_PATH, JSON.stringify(remoteCommands, null, 2));
      localCommands = remoteCommands;
    }
  } catch (error) {
    console.log('⚠️ Failed to fetch remote commands. Using local cache.');
  }
}

export function getCommands() {
  return localCommands;
}

export function getCategories() {
  try {
    const commands = getCommands();
    if (!commands || Object.keys(commands).length === 0) {
      console.log('⚠️ No commands found.');
      return [];
    }
    return Object.keys(commands).filter(key => key !== 'version');
  } catch (error) {
    console.error('❌ Failed to get categories:', error);
    return [];
  }
}

export async function autoPullOnVersionChange(remoteUrl) {
  const currentVersion = pkg.version;
  const localVersion = localCommands.version || '0.0.0';

  if (localVersion !== currentVersion) {
    console.log(`🆕 CLI updated from ${localVersion} to ${currentVersion}. Pulling latest commands...`);
    await fetchRemoteCommands(remoteUrl);
  }
}
