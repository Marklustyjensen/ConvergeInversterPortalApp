import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const options = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
        }

        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
        });

        if (user && user.password === credentials.password) {
          console.log("Authorize function - database user:", user);
          const userToReturn = {
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            admin: user.admin,
          };
          console.log("Authorize function - returning user:", userToReturn);
          return userToReturn;
        }
        throw new Error("Invalid username or password");
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log("JWT callback - user from authorize:", user);
        token.id = user.id;
        token.name = user.name;
        token.username = user.username;
        token.email = user.email;
        token.admin = user.admin;
        console.log("JWT callback - token after update:", token);
      }
      return token;
    },

    async session({ session, token }) {
      console.log("Session callback - token:", token);
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.admin = token.admin;
      }
      console.log("Session callback - session after update:", session);
      return session;
    },

    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: "/",
    signOut: "/",
  },
};
