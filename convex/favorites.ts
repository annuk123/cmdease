import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

// Add a new favorite
export const addFavorite = mutation({
  args: { cmdName: v.string(), category: v.string(), user: v.string() },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert('favorites', {
      cmdName: args.cmdName,
      category: args.category,
      user: args.user,
    });
    return { success: true, id };
  },
});

// Get favorite by command name and category
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

// Delete a favorite by ID
export const deleteFavorite = mutation({
  args: { id: v.id('favorites') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true, deletedId: args.id };
  },
});

// Get all favorites
export const getAllFavorites = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('favorites').collect();
  },
});
