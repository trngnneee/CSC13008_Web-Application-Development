"use client"

import { Button } from "@/components/ui/button";
import { NavBar } from "./components/NavBar";
import { SearchBar } from "./components/SearchBar";
import { useRouter } from "next/navigation";
import { useClientAuthContext } from "@/provider/clientAuthProvider";
import { Power, User } from "lucide-react";
import { clientLogout } from "@/lib/clientAPI/account";
import { toast } from "sonner";

export const ClientHeader = () => {
  const router = useRouter();
  const { isLogin } = useClientAuthContext();

  const handleLogout = () => {
    const promise = clientLogout();
    toast.promise(promise, {
      loading: "Đang đăng xuất...",
      success: (data) => {
        if (data.code == "success")
        {
          setTimeout(() => {
            window.location.href = "/account/login"
          }, 1000);
          return data.message;
        }
      },
      error: "Đăng xuất thất bại!"
    });
  }

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
            <>
              <Button onClick={() => router.push("/me/profile")} className="bg-[var(--main-client-color)] hover:bg-[var(--main-client-hover)] rounded-full w-10 h-10 p-0 flex items-center justify-center">
                <User />
              </Button>
              <Button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 rounded-full w-10 h-10 p-0 flex items-center justify-center">
                <Power />
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
}