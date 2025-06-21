import axios from 'axios';
import fs from 'fs';

const LOCAL_COMMANDS_PATH = './cmdpalette.json'; // Make sure this matches your whole project
const REMOTE_COMMANDS_URL = 'https://raw.githubusercontent.com/annuk123/cmdease/main/.cmdpalette.json'; // Replace if needed

export async function fetchRemoteCommands() {
  try {
    const response = await axios.get(REMOTE_COMMANDS_URL);
    fs.writeFileSync(LOCAL_COMMANDS_PATH, JSON.stringify(response.data, null, 2));
    console.log('✅ Commands updated from remote source.');
    return response.data;
  } catch (error) {
    console.log('⚠️ Failed to fetch remote commands. Using local cache.');
    return loadLocalCommands(); // fallback
  }
}

export function loadLocalCommands() {
  if (fs.existsSync(LOCAL_COMMANDS_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(LOCAL_COMMANDS_PATH, 'utf-8'));
    } catch (error) {
      console.error('❌ Failed to parse local .cmdpalette.json:', error);
      return {}; // Empty fallback to prevent crash
    }
  }
  console.log('⚠️ No local commands found. Starting with empty command set.');
  return {}; // fallback structure
}
