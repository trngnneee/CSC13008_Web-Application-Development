"use client"

import { Button } from "@/components/ui/button";
import { PlusIcon, TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export const DashboardAction = ({ createLink, trashLink }) => {
  const router = useRouter();

  return (
    <>
      <Button onClick={() => router.push(createLink)} variant="outline" className="aspect-square max-sm:p-0">
        <PlusIcon className="opacity-60 sm:-ms-1" size={16} aria-hidden="true" />
        <span className="max-sm:sr-only">Tạo mới</span>
      </Button>
      <Button onClick={() => router.push(trashLink)} variant="destructive">
        <TrashIcon className="-ms-1 opacity-60" size={16} aria-hidden="true" />
        Thùng rác
      </Button>
    </>
  )
}