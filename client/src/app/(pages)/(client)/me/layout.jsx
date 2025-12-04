import { Sider } from "./components/Sider";

export default function ClientLayout({ children }) {
  return (
    <>
      <div className="flex gap-5 container mx-auto justify-start mb-10">
        <Sider />
        <div className="flex-1">
          <div className="px-10">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
