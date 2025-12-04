"use client"

import { Button } from "@/components/ui/button";
import { NavBar } from "./components/NavBar";
import { SearchBar } from "./components/SearchBar";
import { useRouter } from "next/navigation";
import { useClientAuthContext } from "@/provider/clientAuthProvider";
import { User } from "lucide-react";

export const ClientHeader = () => {
  const router = useRouter();
  const { isLogin } = useClientAuthContext();

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
          <div className="w-[260px] flex justify-end">
            <SearchBar />
          </div>
          {!isLogin ? (
            <Button onClick={() => router.push("/account/login")} className="bg-[var(--main-client-color)] hover:bg-[var(--main-client-hover)]">
              Đăng nhập
            </Button>
          ) : (
            <Button className="bg-[var(--main-client-color)] hover:bg-[var(--main-client-hover)] rounded-full w-10 h-10 p-0 flex items-center justify-center">
              <User />
            </Button>
          )}
        </div>
      </div>
    </>
  );
}