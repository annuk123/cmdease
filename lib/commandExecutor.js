import { spawn } from 'child_process';

export function runInteractiveCommand(commandString) {
  return new Promise((resolve, reject) => {
    if (typeof commandString !== 'string') {
      return reject(new Error('❌ Command to execute must be a string.'));
    }

    const trimmedCommand = commandString.trim();
    if (trimmedCommand.length === 0) {
      return reject(new Error('❌ Command string is empty.'));
    }

    const [cmd, ...args] = trimmedCommand.split(' ');

    const child = spawn(cmd, args, {
      stdio: 'inherit',
      shell: true, // Allows complex shell commands
    });

    child.on('exit', (code) => {
      console.log(`\n✔ Process exited with code ${code}`);
      resolve(code);
    });

    child.on('error', (err) => {
      console.error('❌ Failed to run command:', err.message);
      reject(err);
    });
  });
}
