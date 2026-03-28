import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const saveGeneration = mutation({
  args: {
    clothingType: v.string(),
    alteration: v.string(),
    generatedImageUrl: v.string(),
    uploadedImageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.insert("generationHistory", {
      userId,
      clothingType: args.clothingType,
      alteration: args.alteration,
      generatedImageUrl: args.generatedImageUrl,
      uploadedImageUrl: args.uploadedImageUrl,
      createdAt: Date.now(),
    });
  },
});

export const getHistory = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("generationHistory")
      .withIndex("by_user", q => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const deleteGeneration = mutation({
  args: { id: v.id("generationHistory") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const record = await ctx.db.get(args.id);
    if (!record || record.userId !== userId) throw new Error("Not found");

    await ctx.db.delete(args.id);
  },
});