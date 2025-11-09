"use client"

import { Button } from "@/components/ui/button";
import { NavBar } from "./components/NavBar";
import { SearchBar } from "./components/SearchBar";
import { useRouter } from "next/navigation";

export const ClientHeader = () => {
  const router = useRouter();
  
  return (
    <>
      <div className="container mx-auto flex justify-between items-center my-[27px]">
        <div className="w-[220px] overflow-hidden">
          <img
            src="/logo.png"
            className="w-full h-full object-cover"
          />
        </div>
        <NavBar />
        <div className="flex items-center gap-2.5">
          <SearchBar />
          <Button onClick={() => router.push("/account/login")} className="bg-[var(--main-client-color)] hover:bg-[var(--main-client-hover)]">
            Đăng nhập
          </Button>
        </div>
      </div>
    </>
  );
}