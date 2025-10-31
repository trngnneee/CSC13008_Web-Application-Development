import { DashboardFilter } from "../components/DashboardFilter/DashboardFilter";
import { DashboardAction } from "../components/DashboardAction";
import { DashboardMultipleApply } from "../components/DashboardMultipleApply";
import { DashboardSearch } from "../components/DashboardSearch";

export default function AdminUser() {
  return (
    <>
      <div>
        <DashboardFilter
          showCategory={false}
          showCreatedBy={false}
        />
        <div className="mt-[15px] flex items-center gap-5">
          <DashboardMultipleApply />
          <DashboardSearch />
          <DashboardAction
            createLink={"/admin/user/create"}
            trashLink={"/admin/user/trash"}
          />
        </div>
      </div>
    </>
  )
}