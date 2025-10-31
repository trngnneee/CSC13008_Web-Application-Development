import { DashboardFilter } from "../components/DashboardFilter/DashboardFilter";
import { DashboardAction } from "../components/DashboardAction";
import { DashboardMultipleApply } from "../components/DashboardMultipleApply";
import { DashboardSearch } from "../components/DashboardSearch";

export default function AdminCategory() {
  return (
    <>
      <div>
        <DashboardFilter
          showCategory={false}
        />
        <div className="mt-[15px] flex items-center gap-5">
          <DashboardMultipleApply />
          <DashboardSearch />
          <DashboardAction
            createLink={"/admin/category/create"}
            trashLink={"/admin/category/trash"}
          />
        </div>
      </div>
    </>
  )
}