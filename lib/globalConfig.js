import fs from 'fs';
import path from 'path';
import os from 'os';

const CONFIG_FILE = path.join(os.homedir(), '.cmdease-config.json');

export function saveConvexPath(projectPath) {
  const config = { convexPath: projectPath };
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export function getConvexPath() {
  if (!fs.existsSync(CONFIG_FILE)) return null;

  const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
  return config.convexPath || null;
}

