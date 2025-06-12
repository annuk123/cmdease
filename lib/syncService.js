import ora from 'ora';
import convex from './convexClient.js';
import { api } from '../convex/_generated/api.js';
import { historyCache, favoritesCache } from './localCache.js';

class SyncService {
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
    const localHistory = historyCache.load();

    for (const entry of localHistory) {
      await convex.mutation(api.history.addHistory, {
        cmdName: entry.cmdName,
        category: entry.category,
        user: entry.user || 'default',
      });
    }

    historyCache.save([]); // Clear local cache after sync
  }

  async syncFavorites() {
    const localFavorites = favoritesCache.load();

    for (const entry of localFavorites) {
      await convex.mutation(api.favorites.addFavorite, {
        cmdName: entry.cmdName,
        category: entry.category,
        user: entry.user || 'default',
      });
    }

    favoritesCache.save([]); // Clear local cache after sync
  }
}

const syncService = new SyncService();
export default syncService;
