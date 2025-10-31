import { DashboardAction } from "../components/DashboardAction";
import { DashboardFilter } from "../components/DashboardFilter/DashboardFilter";
import { DashboardMultipleApply } from "../components/DashboardMultipleApply";
import { DashboardSearch } from "../components/DashboardSearch";
import ProductTable from "./components/ProductTable";

export default function AdminProduct() {
  return (
    <>
      <div>
        <DashboardFilter />
        <div className="mt-[15px] flex items-center gap-5">
          <DashboardMultipleApply />
          <DashboardSearch />
          <DashboardAction
            createLink={"/admin/product/create"}
            trashLink={"/admin/product/trash"}
          />
        </div>

        <ProductTable />
      </div>
    </>
  )
}