import { existsSync, readFileSync, writeFileSync } from 'fs';
import fs from 'fs/promises';

class LocalCache {
  constructor(filePath) {
    this.filePath = filePath;
  }

  load() {
    if (existsSync(this.filePath)) {
      return JSON.parse(readFileSync(this.filePath, 'utf-8'));
    }
    return [];
  }

  save(data) {
    writeFileSync(this.filePath, JSON.stringify(data, null, 2));
  }

  // Optional: Async load for better performance
  async loadAsync() {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch (err) {
      return [];
    }
  }

  // Optional: Async save for better performance
  async saveAsync(data) {
    try {
      await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
    } catch (err) {
      console.error(`Error saving to ${this.filePath}:`, err);
    }
  }
}

const historyCache = new LocalCache('./.cmdease-history.json');
const favoritesCache = new LocalCache('./.cmdease-favorites.json');

export { historyCache, favoritesCache };
