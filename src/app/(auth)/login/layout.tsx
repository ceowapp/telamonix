"use client"
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'

const Layout = ({
  children
}: {
  children: React.ReactNode;
}) => {

  return ( 
    <div className="relative h-full">
      <main className="h-full">
        {children}
      </main>
    </div>
   );
}
 
export default Layout;
