import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const addFavorite = mutation({
  args: { cmdName: v.string(), category: v.string(), user: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.insert('favorites', args);
  },
});

export const removeFavorite = mutation({
  args: { cmdName: v.string(), category: v.string(), user: v.string() },
  handler: async (ctx, args) => {
    const favorites = await ctx.db
      .query('favorites')
      .filter(q => q.eq(q.field('cmdName'), args.cmdName))
      .filter(q => q.eq(q.field('category'), args.category))
      .filter(q => q.eq(q.field('user'), args.user))
      .collect();

    for (const fav of favorites) {
      await ctx.db.delete(fav._id);
    }
  },
});

export const getFavorites = query({
  args: { user: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query('favorites').filter(q => q.eq(q.field('user'), args.user)).collect();
  },
});


