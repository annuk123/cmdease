import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const addHistory = mutation({
  args: { cmdName: v.string(), category: v.string(), timestamp: v.number(), user: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.insert('history', args);
  },
});

export const getHistory = query({
  args: { user: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('history')
      .filter(q => q.eq(q.field('user'), args.user))
      .order('desc')
      .take(10);
  },
});
