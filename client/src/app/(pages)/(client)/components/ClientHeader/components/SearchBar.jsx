"use client"

import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export const SearchBar = () => {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    const keyword = e.target[0].value;
    router.push(`/search?keyword=${encodeURIComponent(keyword)}`);
  }

  return (
    <div
      className={`
        flex items-center h-10 rounded-full
        bg-[var(--main-client-color)]
        transition-all duration-300 ease-in-out
        overflow-hidden
        ${open ? "w-[260px] pl-3 gap-2" : "w-10 justify-center"}
      `}
    >
      <form onSubmit={handleSubmit}>
        <input
          autoFocus={open}
          onBlur={() => setOpen(false)}
          placeholder="Search..."
          className={`
          text-white outline-none border-none bg-transparent
          transition-all duration-300 ease-in-out
          ${open ? "opacity-100 w-[200px]" : "opacity-0 w-0"}
        `}
        />
      </form>

      <Button
        onClick={() => setOpen(!open)}
        className="bg-[var(--main-client-color)] hover:bg-[var(--main-client-hover)] rounded-full w-10 h-10 p-0 flex items-center justify-center transition-all"
      >
        <Search strokeWidth={2} />
      </Button>
    </div>
  )
}