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
          // if (!user.active) {
          //   throw new Error("User is inactive. Please contact support.");
          // }
          return {
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            admin: user.admin,
            //Link to related properties?
            // phone: user.phone,
          };
        }
        throw new Error("Invalid username or password");
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.username = user.username;
        token.email = user.email;
        token.admin = user.admin;
        // token.phone = user.phone;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.property = token.property;
        session.user.email = token.email;
        session.user.phone = token.phone;
        session.user.propertyAddress = token.propertyAddress;
        session.user.propertyCode = token.propertyCode;
        session.user.position = token.position;
        session.user.name = token.name;
        session.user.admin = token.admin;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
};
