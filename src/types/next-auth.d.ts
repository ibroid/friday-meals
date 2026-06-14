import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: "USER" | "ADMIN";
  }

  interface Session {
    user: User & {
      id: string;
      role: "USER" | "ADMIN";
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "USER" | "ADMIN";
  }
}
