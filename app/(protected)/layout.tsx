import { Navbar } from "./_components/navbar";
import { SessionProvider } from 'next-auth/react'
import { auth } from "@/next-auth-config/auth";

interface ProtectedLayoutProps {
  children: React.ReactNode;
};

const ProtectedLayout = async ({ children }: ProtectedLayoutProps) => {
  const session = await auth();
  return ( 
    <SessionProvider session={session}>
    <div className="h-full max-w-5xl mx-auto">
      <Navbar />
      {children}
    </div>
    </SessionProvider>
   );
}
 
export default ProtectedLayout;