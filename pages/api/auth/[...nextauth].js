import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import clientPromise from "../../../lib/mongodb";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import bcrypt from "bcryptjs";

export const authOptions = {
  adapter: MongoDBAdapter(clientPromise),
  session: { strategy: "jwt" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const client = await clientPromise;
        const db = client.db();
        const user = await db.collection("users").findOne({ email: (credentials?.email || "").toLowerCase() });
        if (!user) return null;
        const isValid = await bcrypt.compare(credentials.password || "", user.password || "");
        if (!isValid) return null;
        return { id: user._id.toString(), name: user.name || "", email: user.email };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Initialize default plans on first sign in
      const client = await clientPromise;
      const db = client.db();
      
      const planCount = await db.collection("plans").countDocuments();
      if (planCount === 0) {
        await db.collection("plans").insertMany([
          {
            name: "free",
            displayName: "Free",
            price: 0,
            linkExpiryDays: 7,
            customAliasAllowed: true,
            features: ["7-day expiry", "Custom aliases"],
            isActive: true
          },
          {
            name: "premium",
            displayName: "Premium",
            price: 5,
            linkExpiryDays: 30,
            customAliasAllowed: true,
            features: ["30-day expiry", "Custom aliases", "Priority support"],
            isActive: true
          },
          {
            name: "premium_plus",
            displayName: "Premium Plus",
            price: 15,
            linkExpiryDays: 0,
            customAliasAllowed: true,
            features: ["Lifetime links", "Custom aliases", "Priority support", "Advanced analytics"],
            isActive: true
          }
        ]);
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user?.id) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token?.id) session.user.id = token.id;
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  secret: process.env.JWT_SECRET,
};

export default NextAuth(authOptions);