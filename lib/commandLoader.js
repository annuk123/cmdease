import fs from 'fs';
import axios from 'axios';

const LOCAL_COMMANDS_PATH = './.cmdpalette.json';
let localCommands = loadLocalCommands();
let remoteCommands = null;

function loadLocalCommands() {
  if (fs.existsSync(LOCAL_COMMANDS_PATH)) {
    return JSON.parse(fs.readFileSync(LOCAL_COMMANDS_PATH, 'utf-8'));
  }
  return {}; // ✅ Return empty object if not found
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
  return localCommands; // ✅ Return the correct format
}

export function getCategories() {
  try {
    const commands = getCommands();
    if (!commands || Object.keys(commands).length === 0) {
      console.log('⚠️ No commands found.');
      return [];
    }
    return Object.keys(commands);
  } catch (error) {
    console.error('❌ Failed to get categories:', error);
    return [];
  }
}
