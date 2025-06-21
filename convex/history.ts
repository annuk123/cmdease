import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

// Add to history
export const addHistory = mutation({
  args: { cmdName: v.string(), category: v.string(), user: v.string() },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert('history', {
      cmdName: args.cmdName,
      category: args.category,
      user: args.user,
      timestamp: Date.now(),
    });
    return { success: true, id };
  },
});

// Get history by command name and category
export const getByName = query({
  args: { cmdName: v.string(), category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('history')
      .filter((q) => q.eq(q.field('cmdName'), args.cmdName))
      .filter((q) => q.eq(q.field('category'), args.category))
      .collect();
  },
});

// Get all history (optionally you can sort)
export const getAllHistory = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('history').collect();
  },
});
