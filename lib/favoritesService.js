import convex from './convexClient.js';
import { api } from '../convex/_generated/api.js';

class FavoritesService {
  async toggle(cmd) {
    const existing = await convex.query(api.commands.getByName, {
      cmdName: cmd.cmdName,
      category: cmd.category,
      type: 'favorite'
    });

    if (existing.length > 0) {
      await convex.mutation(api.commands.deleteCommand, { id: existing[0]._id });
      console.log('⭐ Removed from favorites!');
      return 'removed';
    } else {
      await convex.mutation(api.commands.addCommand, {
        cmdName: cmd.cmdName,
        category: cmd.category,
        type: 'favorite'
      });
      console.log('⭐ Added to favorites!');
      return 'added';
    }
  }

  async getAll() {
    return await convex.query(api.commands.getByType, { type: 'favorite' });
  }

  async isFavorite(cmd) {
    const existing = await convex.query(api.commands.getByName, {
      cmdName: cmd.cmdName,
      category: cmd.category,
      type: 'favorite'
    });
    return existing.length > 0;
  }
}

export default new FavoritesService();
