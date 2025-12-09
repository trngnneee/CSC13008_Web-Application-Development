"use client"

import Link from "next/link";
import { useEffect, useState } from "react";
import { clientCategoryTree } from "@/lib/clientAPI/category";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export const NavBar = () => {
  const router = useRouter();
  const [categoryList, setCategoryList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const promise = await clientCategoryTree();
      if (promise.code == "success") {
        setCategoryList(promise.categoryTree);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <div className="flex items-center gap-12">
        <Link className="text-[16px] font-bold text-[#003459]" href="/">Trang chủ</Link>
        <Link className="text-[16px] font-bold text-[#003459]" href="/category">Danh mục</Link>
        <NavigationMenu viewport={false} className="max-md:hidden">
          <NavigationMenuList className="gap-2">
            {categoryList.map((item, index) => (
              <NavigationMenuItem key={index}>
                {item.children.length > 0 ? (
                  <>
                    <NavigationMenuTrigger className="bg-transparent px-2 py-1.5 font-medium text-muted-foreground hover:text-primary *:[svg]:-me-0.5 *:[svg]:size-3.5">
                      <NavigationMenuLink href={`/category/${item.id_category}`} className="text-[16px] font-bold text-[#003459]">{item.name_category}</NavigationMenuLink>
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="z-50 p-1 shadow-lg border border-gray-200 data-[motion=from-end]:slide-in-from-right-16! data-[motion=from-start]:slide-in-from-left-16! data-[motion=to-end]:slide-out-to-right-16! data-[motion=to-start]:slide-out-to-left-16!">
                      <ul
                        className={cn(
                          "min-w-64"
                        )}
                      >
                        {item.children.map((child, itemIndex) => (
                          <li key={itemIndex}>
                            <NavigationMenuLink
                              href={`/category/${child.id_category}`}
                              className="py-1.5"
                            >
                              {child.name_category}
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </>
                ) : (
                  <NavigationMenuLink
                    href={`/category/${item.id_category}`}
                    className="py-1.5 font-medium text-muted-foreground hover:text-primary"
                  >
                    {item.name}
                  </NavigationMenuLink>
                )}
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </>
  );
}