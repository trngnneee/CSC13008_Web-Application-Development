"use client"

import { useClientAuth } from "@/hooks/useClientAuth";
import { createContext, useContext } from "react";

const ClientAuthContext = createContext(null);

export const ClientAuthProvider = ({ children }) => {
  const { isLogin, userInfo } = useClientAuth();

  return (
    <ClientAuthContext.Provider value={{ isLogin, userInfo }}>
      {children}
    </ClientAuthContext.Provider>
  )
}

export const useClientAuthContext = () => {
  const context = useContext(ClientAuthContext);
  if (!context) {
    throw new Error("useClientAuthContext must be used within an AuthProvider");
  }
  return context;
}