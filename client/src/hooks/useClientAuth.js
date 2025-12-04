import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react"

export const useClientAuth = () => {
  const router = useRouter();
  const pathName = usePathname();
  const [isLogin, setIsLogin] = useState(false);
  const [userInfo, setUserInfo] = useState();
  const publicPath = [
    "/",
    "/account/login",
    "/account/register",
    "/account/forgot-password",
    "/account/otp-password",
    "/account/initial",
    "/category/*",
    "/product/*",
    "/search"
  ];

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/account/verifyToken`, {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        if (data.code == "error") {
          if (!publicPath.some(path => pathName.startsWith(path))) {
            setIsLogin(false);
            router.push("/account/login");
          }
        }
        if (data.code == "success") {
          setIsLogin(true);
          setUserInfo(data.userInfo);
        }
      })
  }, [pathName])

  return { isLogin, userInfo };
}