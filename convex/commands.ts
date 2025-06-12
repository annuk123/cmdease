// convex/commands.ts
import { query, mutation } from './_generated/server';
import { v } from 'convex/values';


export const ping = query({
  handler: async () => {
    return 'pong';
  },
});

export const getByType = query({
  args: { type: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query('commands')
      .filter(q => q.eq(q.field('type'), args.type))
      .collect();
  },
});

export const deleteCommand = mutation({
  args: { id: v.id('commands') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
