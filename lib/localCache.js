import fs from 'fs';
import path from 'path';

const cacheFolder = path.resolve('./.cmdease-cache');
if (!fs.existsSync(cacheFolder)) {
  fs.mkdirSync(cacheFolder, { recursive: true });
}

class LocalCache {
  constructor(fileName) {
    this.filePath = path.join(cacheFolder, fileName);
  }

  load() {
    if (fs.existsSync(this.filePath)) {
      try {
        return JSON.parse(fs.readFileSync(this.filePath, 'utf-8'));
      } catch (error) {
        console.error(`❌ Failed to parse cache at ${this.filePath}:`, error);
        return [];
      }
    }
    return [];
  }

  save(data) {
    try {
      const tempPath = this.filePath + '.tmp';
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2));
      fs.renameSync(tempPath, this.filePath);
    } catch (error) {
      console.error(`❌ Failed to save cache at ${this.filePath}:`, error);
    }
  }
}
