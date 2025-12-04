import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CategoryPagination from "../../category/[id]/components/CategoryPagination";
import { ProductItem } from "../../components/ProductItem";
import { HeaderTitle } from "../components/HeaderTitle";

export default function AuctionPage() {
  const data1 = [
    {
      image: "/product.png",
      name: "Mona Lisa",
      seller: "Leonardo Da Vinci",
      currentBid: "700",
      end: "14.9.2022 10:00:00 GMT+8"
    },
    {
      image: "/product2.png",
      name: "Plant and Pots",
      seller: "Jose Guillermo",
      currentBid: "1200",
      end: "14.9.2022 10:00:00 GMT+8"
    },
    {
      image: "/product.png",
      name: "Mona Lisa",
      seller: "Leonardo Da Vinci",
      currentBid: "700",
      end: "14.9.2022 10:00:00 GMT+8"
    }
  ]
  const data2 = [
    {
      image: "/product2.png",
      name: "Plant and Pots",
      seller: "Jose Guillermo",
      currentBid: "1200",
      end: "14.9.2022 10:00:00 GMT+8"
    },
    {
      image: "/product.png",
      name: "Mona Lisa",
      seller: "Leonardo Da Vinci",
      currentBid: "700",
      end: "14.9.2022 10:00:00 GMT+8"
    },
    {
      image: "/product.png",
      name: "Mona Lisa",
      seller: "Leonardo Da Vinci",
      currentBid: "700",
      end: "14.9.2022 10:00:00 GMT+8"
    }
  ]

  return (
    <>
      <HeaderTitle title="Danh sách sản phẩm đấu giá" />
      <Tabs className="items-center mt-5" defaultValue="auction">
        <TabsList
          className="h-auto rounded-none border-b bg-transparent p-0 justify-center"
        >
          <TabsTrigger className="relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary" value="auction">
            Sản phẩm đã đấu giá
          </TabsTrigger>
          <TabsTrigger className="relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary" value="win">
            Sản phẩm thắng đấu giá
          </TabsTrigger>
        </TabsList>

        <TabsContent value="auction" className={"w-full"}>
          <div
            className="grid grid-cols-2 gap-[30px] mb-[30px] mt-5"
          >
            {data1.map((item, index) => (
              <ProductItem
                key={index}
                item={item}
              />
            ))}
          </div>
          <CategoryPagination
            currentPage={1}
            totalPages={10}
          />
        </TabsContent>
        <TabsContent value="win" className={"w-full"}>
          <div
            className="grid grid-cols-2 gap-[30px] mb-[30px] mt-5"
          >
            {data2.map((item, index) => (
              <ProductItem
                key={index}
                item={item}
              />
            ))}
          </div>
          <CategoryPagination
            currentPage={1}
            totalPages={10}
          />
        </TabsContent>
      </Tabs>
    </>
  )
}