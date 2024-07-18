import Navigation from "@/components/site/navigation";
import { currentUser } from "@/lib/auth";
import React, { ReactNode } from "react";
import { SessionProvider } from 'next-auth/react'
import { auth } from "@/next-auth-config/auth";

const Layout = async ({ children }: { children: ReactNode }) => {
  const session = await auth();
  const user = await currentUser();

  return (
    <SessionProvider session={session}>
    <div className="h-full">
      <Navigation user={user} />
      {children}
    </div>
    </SessionProvider>
  );
};

export default Layout;
