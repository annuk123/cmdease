import convex from './convexClient.js';
import { api } from '../convex/_generated/api.js';
import { loadLocalFavorites, saveLocalFavorites } from './localCache.js';
import { isOnline } from './connection.js';

export async function toggleFavorite(cmd, online = true) {
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
    console.log('Offline - Saving favorite change locally.');

    const localFavorites = loadLocalFavorites();

    // If already in local favorites, remove it
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
}

export async function getFavorites() {
  try {
    return await convex.query(api.favorites.getAllFavorites, {});
  } catch (error) {
    console.log('Offline - Loading favorites from local cache');
    return loadLocalFavorites();
  }
}


export async function syncLocalFavorites() {
  try {
    const localFavorites = loadLocalFavorites();

    if (localFavorites.length === 0) return;

    console.log(`🔄 Syncing ${localFavorites.length} local favorite(s) to Convex...`);

    for (const entry of localFavorites) {
      await convex.mutation(api.favorites.addFavorite, {
        cmdName: entry.cmdName,
        category: entry.category,
        user: entry.user || 'default',
      });
    }

    saveLocalFavorites([]);
    console.log('✅ Local favorites synced successfully!');
  } catch (err) {
    console.error('❌ Error syncing local favorites:', err);
  }
}

