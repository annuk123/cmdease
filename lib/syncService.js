import convex from './convexClient.js';
import { api } from '../convex/_generated/api.js';
import { historyCache, favoritesCache } from './localCache.js';

class SyncService {
  async syncLocalToConvex() {
    console.log('🔁 Syncing local cache to Convex...');

    try {
      await this.syncHistory();
      await this.syncFavorites();

      console.log('✅ Sync complete!');
    } catch (error) {
      console.log('❌ Sync failed. Will retry later.');
    }
  }

  async syncHistory() {
    const localHistory = historyCache.load();

    for (const entry of localHistory) {
      await convex.mutation(api.commands.addCommand, {
        cmdName: entry.cmdName,
        category: entry.category,
        type: 'history'
      });
    }

    historyCache.save([]); // Clear local cache after sync
  }

  async syncFavorites() {
    const localFavorites = favoritesCache.load();

    for (const entry of localFavorites) {
      await convex.mutation(api.commands.addCommand, {
        cmdName: entry.cmdName,
        category: entry.category,
        type: 'favorite'
      });
    }

    favoritesCache.save([]); // Clear local cache after sync
  }
}

const syncService = new SyncService();
export default syncService;
