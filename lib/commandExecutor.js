import { spawn } from 'child_process';

export function runInteractiveCommand(commandString) {
  return new Promise((resolve, reject) => {
    const [cmd, ...args] = commandString.split(' ');

    const child = spawn(cmd, args, {
      stdio: 'inherit',
      shell: true, // Important to handle complex commands
    });

    child.on('exit', (code) => {
      console.log(`\nProcess exited with code ${code}`);
      resolve(code);
    });

    child.on('error', (err) => {
      console.error('❌ Failed to run command:', err.message);
      reject(err);
    });
  });
}
