import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "@/app/lib/db";
import { MongoClient, ObjectId } from "mongodb";

export const authOptions = {
  adapter: MongoDBAdapter(clientPromise, {
    collections: {
      Users: "Users",
      Accounts: "accounts",
      Sessions: "sessions",
      VerificationTokens: "verification_tokens",
    },
  }),

  pages: {
    signIn: "/signin",
  },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "consent select_account",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  debug: true, // Enable debug messages in Vercel logs

  callbacks: {
    async jwt({ token, user }) {
      console.log("🔐 [NextAuth] JWT Callback:", {
        hasUser: !!user,
        tokenId: token.id,
      });
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("🔐 [NextAuth] Session Callback Start", {
        email: session?.user?.email,
        tokenId: token?.id,
      });
      if (!session?.user) return session;

      try {
        const client = await clientPromise;
        if (!process.env.DB_NAME) {
          console.error("❌ [NextAuth] DB_NAME env variable is missing!");
        }
        const db = client.db(process.env.DB_NAME);

        const dbUser = await db.collection("Users").findOne({
          email: session.user.email,
        });

        console.log("🔐 [NextAuth] DB User Found:", !!dbUser);

        if (dbUser) {
          session.user.id = dbUser._id.toString();
          session.user.firstName = dbUser.firstName;
          session.user.lastName = dbUser.lastName;
          session.user.username = dbUser.username;
          session.user.profileImage = dbUser.profileImage;
        }
      } catch (error) {
        console.error("❌ [NextAuth] Session Callback Error:", error);
      }

      return session;
    },
  },

  events: {
    async createUser({ user }) {
      console.log("👤 [NextAuth] Creating New User:", user.email);
      try {
        const client = await clientPromise;
        const db = client.db(process.env.DB_NAME);

        // Convert "Karna Mahesh" -> "karna_mahesh"
        const usernameSlug = user.name?.toLowerCase().replace(/\s+/g, "_");

        await db.collection("Users").updateOne(
          { _id: new ObjectId(user.id) },
          {
            $set: {
              firstName: user.name, // set full name as firstName
              lastName: "", // empty
              username: usernameSlug, // karna_mahesh
              profileImage: "/p1.png",
            },
          },
        );

        console.log("✅ [NextAuth] Custom fields added to new user");
      } catch (error) {
        console.error("❌ [NextAuth] Error updating user fields:", error);
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
