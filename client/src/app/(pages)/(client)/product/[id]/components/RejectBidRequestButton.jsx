"use client"

import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { rejectBidRequest } from "@/lib/clientAPI/bid"
import { useState } from "react"

export const RejectBidRequestButton = ({ id_request, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleReject = async () => {
    if (!id_request) return;
    
    setLoading(true);
    try {
      await rejectBidRequest(id_request);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      variant={"destructive"}
      onClick={handleReject}
      disabled={loading}
    >
      <X />
    </Button>
  )
}