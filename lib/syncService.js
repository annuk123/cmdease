import ora from 'ora';
import convex from './convexClient.js';
import { historyCache, favoritesCache } from './localCache.js';
import path from 'path';
import fs from 'fs';
import { pathToFileURL } from 'url';
import { getConvexPath } from './globalConfig.js'; // Make sure you import your global config loader

class SyncService {
  async loadApi() {
    const convexPath = getConvexPath();

    if (!convexPath) {
      console.error('❌ No Convex project linked. Please run: cmdease link /path/to/convex');
      process.exit(1);
    }

    const apiPath = path.resolve(convexPath, '_generated/api.js');

    if (!fs.existsSync(apiPath)) {
      console.error('❌ convex/_generated/api.js not found in the linked Convex project.');
      console.error(`➡️ Expected at: ${apiPath}`);
      process.exit(1);
    }

    return await import(pathToFileURL(apiPath).href);
  }

  async syncLocalToConvex() {
    const spinner = ora('🔄 Syncing local cache to Convex...').start();

    try {
      await this.syncHistory();
      await this.syncFavorites();

      spinner.succeed('✅ Sync complete!');
    } catch (error) {
      spinner.fail('❌ Sync failed. Please check your Convex project and try again.');
      console.error(error.message);
    }
  }

  async syncHistory() {
    const { api } = await this.loadApi();
    const localHistory = historyCache.load();
    const unsynced = [];

    for (const entry of localHistory) {
      try {
        await convex.mutation(api.history.addHistory, {
          cmdName: entry.cmdName,
          category: entry.category,
          user: entry.user || 'default',
        });
      } catch (error) {
        console.error(`❌ Failed to sync history: ${entry.cmdName} (${entry.category})`);
        unsynced.push(entry);
      }
    }

    historyCache.save(unsynced);
  }

  async syncFavorites() {
    const { api } = await this.loadApi();
    const localFavorites = favoritesCache.load();
    const unsynced = [];

    for (const entry of localFavorites) {
      try {
        await convex.mutation(api.favorites.addFavorite, {
          cmdName: entry.cmdName,
          category: entry.category,
          user: entry.user || 'default',
        });
      } catch (error) {
        console.error(`❌ Failed to sync favorite: ${entry.cmdName} (${entry.category})`);
        unsynced.push(entry);
      }
    }

    favoritesCache.save(unsynced);
  }
}

const syncService = new SyncService();
export default syncService;
