"use client"

import { useAdminAuth } from "@/hooks/useAdminAuth"

export default function AdminDashboard(){  
  const { isLogin } = useAdminAuth();
  
  return (
    <>
      <div>Trang tổng quan</div>
    </>
  )
}