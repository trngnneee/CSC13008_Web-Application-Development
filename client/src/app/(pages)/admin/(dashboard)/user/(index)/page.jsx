import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import UserContent from "./components/UserContent";
import SellerContent from "./components/SellerContent";

export default function AdminUser() {
  return (
    <Tabs className="items-center" defaultValue="tab-1">
      <TabsList className="h-auto rounded-none border-b bg-transparent p-0">
        <TabsTrigger
          className="relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary"
          value="tab-1"
        >
          Danh sách người dùng
        </TabsTrigger>
        <TabsTrigger
          className="relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary"
          value="tab-2"
        >
          Danh sách Seller chờ duyệt
        </TabsTrigger>
      </TabsList>
      <TabsContent value="tab-1" className={"w-full"}>
        <UserContent />
      </TabsContent>
      <TabsContent value="tab-2" className={"w-full"}>
        <SellerContent />
      </TabsContent>
    </Tabs>
  );
}
