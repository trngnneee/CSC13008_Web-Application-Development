import { DashboardFilter } from "../components/DashboardFilter/DashboardFilter";
import { DashboardMultipleApply } from "../components/DashboardMultipleApply";
import { DashboardSearch } from "../components/DashboardSearch";
import ProductTable from "./components/ProductTable";

export default function AdminProduct() {
  return (
    <>
      <div className="mt-6">
        <DashboardFilter />
        <div className="mt-[15px] flex items-center gap-5">
          <DashboardMultipleApply />
          <DashboardSearch />
        </div>

        <ProductTable />
      </div>
    </>
  )
}