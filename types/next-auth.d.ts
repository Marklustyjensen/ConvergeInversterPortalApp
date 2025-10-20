import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      username?: string | null;
      email?: string | null;
      image?: string | null;
      admin?: boolean;
      property?: string | null;
      phone?: string | null;
      propertyAddress?: string | null;
      propertyCode?: string | null;
      position?: string | null;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    username?: string | null;
    email?: string | null;
    admin?: boolean;
    property?: string | null;
    phone?: string | null;
    propertyAddress?: string | null;
    propertyCode?: string | null;
    position?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username?: string | null;
    admin?: boolean;
    property?: string | null;
    phone?: string | null;
    propertyAddress?: string | null;
    propertyCode?: string | null;
    position?: string | null;
  }
}
