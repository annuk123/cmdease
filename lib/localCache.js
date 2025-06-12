import fs from 'fs';
import path from 'path';

const cacheDir = path.resolve('./');
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
}

// Generic LocalCache class
class LocalCache {
  constructor(filePath) {
    this.filePath = filePath;
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
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(`❌ Failed to save cache at ${this.filePath}:`, error);
    }
  }
}

// Cache file paths (more reliable)
const historyCache = new LocalCache(path.resolve('./.cmdease-history.json'));
const favoritesCache = new LocalCache(path.resolve('./.cmdease-favorites.json'));

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
