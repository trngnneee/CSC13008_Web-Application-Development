"use client"

import Link from "next/link";
import { useEffect, useState } from "react";
import { clientCategoryTree } from "@/lib/clientAPI/category";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";

export const NavBar = () => {
  const router = useRouter();
  const [categoryList, setCategoryList] = useState([]);
  const [hoveredCategoryId, setHoveredCategoryId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const promise = await clientCategoryTree();
      if (promise.code == "success") {
        setCategoryList(promise.categoryTree);
      }
    };
    fetchData();
  }, []);

  const handleMouseEnter = (id) => {
    setHoveredCategoryId(id);
  };

  const handleMouseLeave = () => {
    setHoveredCategoryId(null);
  };

  return (
    <>
      <div className="flex items-center gap-12">
        <Link className="text-[16px] font-bold text-[#003459]" href="/">Trang chủ</Link>
        <NavigationMenu viewport={false}>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-transparent px-2 py-1.5 font-medium hover:text-primary">
                <span className="text-[16px] font-bold text-[#003459]">Danh mục</span>
              </NavigationMenuTrigger>
              <NavigationMenuContent className="z-50 p-2 shadow-lg border border-gray-200 bg-white min-w-[250px]">
                <ul className="flex flex-col">
                  {categoryList.map((parentCategory, index) => (
                    <li 
                      key={index}
                      className="relative"
                    >
                      {parentCategory.children && parentCategory.children.length > 0 ? (
                        <div
                          onMouseEnter={() => handleMouseEnter(parentCategory.id_category)}
                          onMouseLeave={handleMouseLeave}
                        >
                          <div className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-gray-100 cursor-pointer">
                            <Link 
                              href={`/category/${parentCategory.id_category}`}
                              className="text-[15px] font-medium text-[#003459] flex-1"
                            >
                              {parentCategory.name_category}
                            </Link>
                            <ChevronRight className="w-4 h-4 text-gray-500" />
                          </div>
                          {/* Submenu for children */}
                          {hoveredCategoryId == parentCategory.id_category && (
                            <div 
                              className="fixed ml-30 bg-white border border-gray-200 shadow-lg rounded-md min-w-[200px] z-[100]"
                            >
                              <ul className="p-2">
                                {parentCategory.children.map((childCategory, childIndex) => (
                                  <li key={childIndex}>
                                    <Link 
                                      href={`/category/${childCategory.id_category}`}
                                      className="block py-2 px-3 rounded-md hover:bg-gray-100 text-[14px] font-medium text-[#003459]"
                                    >
                                      {childCategory.name_category}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ) : (
                        <Link 
                          href={`/category/${parentCategory.id_category}`}
                          className="block py-2 px-3 rounded-md hover:bg-gray-100 text-[15px] font-medium text-[#003459]"
                        >
                          {parentCategory.name_category}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </>
  );
}