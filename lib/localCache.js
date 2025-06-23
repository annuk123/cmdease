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

// Local cache for history and favorites
const historyCache = new LocalCache('history.json');
const favoritesCache = new LocalCache('favorites.json');

// History functions
export function loadLocalHistory() {
  return historyCache.load();
}

export function saveLocalHistory(data) {
  historyCache.save(data);
}

// Favorites functions
export function loadLocalFavorites() {
  return favoritesCache.load();
}

export function saveLocalFavorites(data) {
  favoritesCache.save(data);
}
