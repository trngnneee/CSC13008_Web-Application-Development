"use client"

import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { approveBidRequest } from "@/lib/clientAPI/bid"
import { useState } from "react"

export const ApproveBidRequestButton = ({ id_request, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    if (!id_request) return;
    
    setLoading(true);
    try {
      await approveBidRequest(id_request);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      className={"bg-[var(--main-color)] hover:bg-[var(--main-hover)]"}
      onClick={handleApprove}
      disabled={loading}
    >
      <Check />
    </Button>
  )
}