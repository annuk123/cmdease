import ora from 'ora';
import convex from './convexClient.js';
import { historyCache, favoritesCache } from './localCache.js';
import path from 'path';
import fs from 'fs';
import { pathToFileURL } from 'url';

class SyncService {
  async loadApi() {
    const apiPath = path.resolve(process.cwd(), 'convex/_generated/api.js');

    if (!fs.existsSync(apiPath)) {
      console.error('❌ convex/_generated/api.js not found. Are you running the CLI in a valid Convex project?');
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
      spinner.fail('❌ Sync failed. Will retry later.');
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
