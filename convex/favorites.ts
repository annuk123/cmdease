import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const addFavorite = mutation({
  args: { cmdName: v.string(), category: v.string(), user: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.insert('favorites', {
      cmdName: args.cmdName,
      category: args.category,
      user: args.user,
    });
  },
});

export const getByName = query({
  args: { cmdName: v.string(), category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('favorites')
      .filter((q) => q.eq(q.field('cmdName'), args.cmdName))
      .filter((q) => q.eq(q.field('category'), args.category))
      .collect();
  },
});

export const deleteFavorite = mutation({
  args: { id: v.id('favorites') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const getAllFavorites = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('favorites').collect();
  },
});

