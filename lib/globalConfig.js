import fs from 'fs';
import path from 'path';

const configPath = path.resolve(process.env.HOME || process.env.USERPROFILE, '.cmdease-config.json');

export function saveConvexPath(projectPath) {
  const config = { convexPath: projectPath };
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

export function loadConvexPath() {
  if (fs.existsSync(configPath)) {
    const { convexPath } = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    return convexPath;
  }
  return null;
}
