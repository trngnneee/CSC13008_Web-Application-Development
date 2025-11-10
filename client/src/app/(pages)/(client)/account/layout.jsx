import { Breadcrumb } from "../components/Breadcrumb";

export default function ClientLayout({ children }) {
  return (
    <>
      <Breadcrumb title={"Become a Bidder"} />
      <div className="my-[50px]">
        <div className="container mx-auto flex justify-center items-center gap-20">
          <div className="w-1/2">
            {children}
          </div>
        </div>
      </div>
    </>
  )
}