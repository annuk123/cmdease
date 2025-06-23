import fs from 'fs';
import path from 'path';
import os from 'os';
import chalk from 'chalk';

const CONFIG_FILE = path.join(os.homedir(), '.cmdease-config.json');

// Save Convex project path globally
export function saveConvexPath(projectPath) {
  try {
    const config = { convexPath: projectPath };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
    console.log(chalk.green(`Convex project path saved: ${projectPath}`));
  } catch (err) {
    console.error(chalk.red('❌ Failed to save Convex path:'), err.message);
  }
}

// Get Convex project path from global config
export function getConvexPath() {
  try {
    if (!fs.existsSync(CONFIG_FILE)) return null;

    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    return config.convexPath || null;
  } catch (err) {
    console.error(chalk.red('❌ Failed to read config file:'), err.message);
    return null;
  }
}

// Clear linked project
export function unlinkConvexPath() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      fs.unlinkSync(CONFIG_FILE);
      console.log(chalk.yellow('✔ Convex project unlinked successfully.'));
      return true;
    } else {
      console.log(chalk.red('⚠️ No linked project found.'));
      return false;
    }
  } catch (err) {
    console.error(chalk.red('❌ Failed to unlink project:'), err.message);
    return false;
  }
}
