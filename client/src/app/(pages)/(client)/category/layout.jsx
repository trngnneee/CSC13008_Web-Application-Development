import { Breadcrumb } from "../components/Breadcrumb";


export default function CategoryLayout({ children }) {
  return (
    <>
      <Breadcrumb title={"Danh mục"} />
      <div className="my-[50px]">
        <div className="container mx-auto">
          {children}
        </div>
      </div>
    </>
  )
}