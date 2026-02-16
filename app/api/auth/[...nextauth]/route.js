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

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  callbacks: {
    async session({ session, user }) {
      if (!session?.user) return session;

      const client = await clientPromise;
      const db = client.db(process.env.DB_NAME);

      const dbUser = await db.collection("Users").findOne({
        email: session.user.email,
      });

      if (dbUser) {
        session.user.id = dbUser._id.toString();
        session.user.firstName = dbUser.firstName;
        session.user.lastName = dbUser.lastName;
        session.user.username = dbUser.username;
        session.user.profileImage = dbUser.profileImage;
      }

      return session;
    },
  },

  events: {
    async createUser({ user }) {
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

        // console.log("✅ Custom fields added to new user");
      } catch (error) {
        console.error("❌ Error updating user fields:", error);
      }
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
