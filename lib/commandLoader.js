import fs from 'fs';
import axios from 'axios';
import { createRequire } from 'module';

// ✅ Only use require once for package.json
const pkg = createRequire(import.meta.url)('../package.json');

const LOCAL_COMMANDS_PATH = './.cmdpalette.json';
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

// ✅ Clean version sync: check if remote version differs from local cache
export async function autoPullOnVersionChange(remoteUrl) {
  try {
    const response = await axios.get(remoteUrl);
    const remoteVersion = response.data.version || '0.0.0';
    const localVersion = localCommands.version || '0.0.0';

    if (remoteVersion !== localVersion) {
      console.log(`🆕 New version available: ${localVersion} → ${remoteVersion}. Pulling latest commands...`);
      await fetchRemoteCommands(remoteUrl);
    } else {
      console.log('✅ Local commands are up to date.');
    }
  } catch (error) {
    console.log('⚠️ Failed to check version update from remote.');
  }
}
