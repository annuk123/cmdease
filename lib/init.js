import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

const LOCAL_COMMANDS_PATH = path.join(process.cwd(), 'cmdpalette.json');

export async function initializeCmdease() {
  try {
    if (fs.existsSync(LOCAL_COMMANDS_PATH)) {
      console.log(chalk.yellow('⚠️  cmdease is already initialized in this project.'));
      console.log(chalk.cyan(`📄 Existing file: ${LOCAL_COMMANDS_PATH}`));
      return;
    }

    const initialData = {
      version: '1.0.0',
      categories: []
    };

    fs.writeFileSync(LOCAL_COMMANDS_PATH, JSON.stringify(initialData, null, 2));
    console.log(chalk.green('✅ cmdease initialized successfully!'));
    console.log(chalk.cyan(`🗂️  Created: ${LOCAL_COMMANDS_PATH}`));
    console.log(chalk.blue('👉 You can now run `cmdease` to start using your command palette.'));
  } catch (error) {
    console.error(chalk.red('❌ Failed to initialize cmdease:'), error);
    process.exit(1);
  }
}
