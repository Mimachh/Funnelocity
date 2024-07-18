import { SessionProvider } from 'next-auth/react'
import { auth } from "@/next-auth-config/auth";
import React from 'react'

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth();
  return (
    <SessionProvider session={session}>
    <div>{children}</div>
    </SessionProvider>
    
  )
}

export default Layout