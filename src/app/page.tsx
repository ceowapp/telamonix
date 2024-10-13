"use client"
import React from 'react';
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react"
import { PageLoader } from "@/components/PageLoader";
import HeaderSection from "./_components/HeaderSection";
import UserInforSection from "./_components/UserInforSection";
import ImportSection from "./_components/ImportSection";
import AISEOSection from "./_components/AISEOSection";
import { useGeneralContext } from "@/context/general-context-provider";

export default function Page() {
  const { openAISEO, selectedProduct } = useGeneralContext();

  const { data: session, status, update } = useSession({
    required: true,
    onUnauthenticated() {
    },
  })

  const user = session?.user;
  if (status === "loading") {
    return (
      <div className="min-h-screen h-full flex items-center justify-center">
        <PageLoader size="lg" />
      </div>
    );
  }

  if (status !== "authenticated") {
    return redirect("/login");
  }

  return (
    <React.Fragment>
      <HeaderSection />
      <UserInforSection user={user} />
      <ImportSection />
      {openAISEO && selectedProduct && <AISEOSection product={selectedProduct} /> }
    </React.Fragment>
  );
}

