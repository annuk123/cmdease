import axios from 'axios';
import fs from 'fs';
import chalk from 'chalk';

const LOCAL_COMMANDS_PATH = './cmdpalette.json'; // Ensure correct path
const REMOTE_COMMANDS_URL = 'https://raw.githubusercontent.com/annuk123/cmdease/main/.cmdpalette.json'; // Update if needed

// Fetch commands from remote (GitHub)
export async function fetchRemoteCommands(showJson = false) {
  try {
    const response = await axios.get(REMOTE_COMMANDS_URL);
    fs.writeFileSync(LOCAL_COMMANDS_PATH, JSON.stringify(response.data, null, 2));

    if (showJson) {
      console.log(chalk.green('✅ Commands updated from remote source.'));
      console.log(response.data); // Only show JSON if explicitly requested
    } else {
      console.log(chalk.blue('🔄 Commands auto-refreshed from remote.'));
    }

    return response.data;
  } catch (error) {
    console.log(chalk.yellow('⚠️ Failed to fetch remote commands. Using local cache.'));
    return loadLocalCommands();
  }
}

// Load local command cache
export function loadLocalCommands() {
  if (fs.existsSync(LOCAL_COMMANDS_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(LOCAL_COMMANDS_PATH, 'utf-8'));
    } catch (error) {
      console.error(chalk.red('❌ Failed to parse local cmdpalette.json:'), error);
      return {}; // Return empty object to prevent crash
    }
  }

  console.log(chalk.yellow('⚠️ No local commands found. Starting with empty command set.'));
  return {}; // Fallback structure
}
