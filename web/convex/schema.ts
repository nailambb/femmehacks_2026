import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
    phone: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    skills: v.optional(v.array(v.string())),
    proficiencyLevel: v.optional(v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced")
    )),
  })
  .index("email", ["email"])
  .index("phone", ["phone"]),

  generationHistory: defineTable({
    userId: v.id("users"),
    clothingType: v.string(),
    alteration: v.string(),
    generatedImageUrl: v.string(),
    uploadedImageUrl: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
});

