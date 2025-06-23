import convex from './convexClient.js';
import { loadApi } from './loadApi.js';
import { loadLocalFavorites, saveLocalFavorites } from './localCache.js';

class FavoritesService {
  async toggle(cmd) {
    const loadedApi = await loadApi();
    if (!loadedApi || !loadedApi.api) {
      console.log('⚠️ Convex unreachable. Handling favorites locally.');
      return this.toggleLocal(cmd);
    }

    const { api } = loadedApi;

    try {
      const existing = await convex.query(api.favorites.getByName, {
        cmdName: cmd.cmdName,
        category: cmd.category,
      });

      if (existing.length > 0) {
        await convex.mutation(api.favorites.deleteFavorite, { id: existing[0]._id });
        console.log('⭐ Removed from favorites!');
        return 'removed';
      } else {
        await convex.mutation(api.favorites.addFavorite, {
          cmdName: cmd.cmdName,
          category: cmd.category,
          user: cmd.user || 'default',
        });
        console.log('⭐ Added to favorites!');
        return 'added';
      }
    } catch (error) {
      console.log('⚠️ Convex unreachable during toggle. Handling locally.');
      return this.toggleLocal(cmd);
    }
  }

  toggleLocal(cmd) {
    const localFavorites = loadLocalFavorites();
    const index = localFavorites.findIndex(fav => fav.cmdName === cmd.cmdName && fav.category === cmd.category);

    if (index > -1) {
      localFavorites.splice(index, 1);
      console.log('⭐ Removed from local favorites!');
      saveLocalFavorites(localFavorites);
      return 'removed';
    } else {
      localFavorites.push(cmd);
      console.log('⭐ Added to local favorites!');
      saveLocalFavorites(localFavorites);
      return 'added';
    }
  }

  async getAll() {
    const loadedApi = await loadApi();
    if (!loadedApi || !loadedApi.api) {
      console.log('⚠️ Convex unreachable. Loading favorites from local cache.');
      return loadLocalFavorites();
    }

    const { api } = loadedApi;

    try {
      return await convex.query(api.favorites.getAllFavorites, {});
    } catch (error) {
      console.log('⚠️ Convex unreachable during getAll. Loading favorites from local cache.');
      return loadLocalFavorites();
    }
  }

  async syncLocal() {
    const localFavorites = loadLocalFavorites();
    if (localFavorites.length === 0) return;

    const loadedApi = await loadApi();
    if (!loadedApi || !loadedApi.api) {
      console.log('⚠️ Convex not available. Cannot sync local favorites now.');
      return;
    }

    const { api } = loadedApi;

    console.log(`🔄 Syncing ${localFavorites.length} local favorite(s) to Convex...`);
    const unsynced = [];

    for (const entry of localFavorites) {
      try {
        await convex.mutation(api.favorites.addFavorite, {
          cmdName: entry.cmdName,
          category: entry.category,
          user: entry.user || 'default',
        });
      } catch (error) {
        console.error('❌ Failed to sync favorite:', entry, error);
        unsynced.push(entry);
      }
    }

    saveLocalFavorites(unsynced);

    if (unsynced.length === 0) {
      console.log('✅ All local favorites synced successfully!');
    } else {
      console.log(`⚠️ Some favorites failed to sync. ${unsynced.length} item(s) will retry later.`);
    }
  }
}

const favoritesService = new FavoritesService();

export default favoritesService;

// Public API
export const toggleFavorite = async (cmd) => {
  return await favoritesService.toggle(cmd);
};

export const getFavorites = async () => {
  return await favoritesService.getAll();
};

export const syncLocalFavorites = async () => {
  await favoritesService.syncLocal();
};
