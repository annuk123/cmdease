import axios from 'axios';
import fs from 'fs';

const LOCAL_COMMANDS_PATH = './.cmdpalette.json';
const REMOTE_COMMANDS_URL = 'https://your-commands-repo.com/cmdpalette.json'; // Replace with your hosted JSON file

export async function fetchRemoteCommands() {
  try {
    const response = await axios.get(REMOTE_COMMANDS_URL);
    fs.writeFileSync(LOCAL_COMMANDS_PATH, JSON.stringify(response.data, null, 2));
    console.log('✅ Commands updated from remote source.');
    return response.data;
  } catch (error) {
    console.log('⚠️ Failed to fetch remote commands, using local cache.');
    return JSON.parse(fs.readFileSync(LOCAL_COMMANDS_PATH, 'utf-8'));
  }
}

export function loadLocalCommands() {
  if (fs.existsSync(LOCAL_COMMANDS_PATH)) {
    return JSON.parse(fs.readFileSync(LOCAL_COMMANDS_PATH, 'utf-8'));
  }
  return {};
}
