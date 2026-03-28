import Google from "@auth/core/providers/google";
import Resend from "@auth/core/providers/resend";
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [Google, Password, Resend],
  callbacks: {
    async createOrUpdateUser(ctx, args) {
      if (args.existingUserId) {
        // Always update name/image from Google
        if (args.provider.id === "google") {
          await ctx.db.patch(args.existingUserId, {
            name: args.profile.name ?? undefined,
            image: args.profile.image ?? undefined,
          });
        }
        return args.existingUserId;
      }

      if (args.provider.id === "resend") {
        const email = args.profile.email?.trim().toLowerCase();
        if (!email) throw new Error("No email provided.");
      
        const db = ctx.db as any;
      
        // Check your users table directly — email is stored there at signup
        const existingUser = await db
          .query("users")
          .filter((q: any) => q.eq(q.field("email"), email))
          .first();
      
        if (!existingUser) {
          throw new Error("No account found with this email. Please sign up first.");
        }
      
        return existingUser._id;
      }

      // Create new user for Google or Password sign-up
      return await ctx.db.insert("users", {
        name: args.profile.name ?? undefined,
        email: args.profile.email ?? undefined,
        image: args.profile.image ?? undefined,
        phone: undefined,
        emailVerificationTime: undefined,
        phoneVerificationTime: undefined,
        isAnonymous: false,
      });
    },
  },
});