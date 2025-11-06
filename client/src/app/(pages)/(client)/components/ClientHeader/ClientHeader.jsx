import { NavBar } from "./components/NavBar";

export const ClientHeader = () => {
  return (
    <>
      <div className="container mx-auto flex justify-between">
        <div className="w-[200px] h-[100px] overflow-hidden">
          <img
            src="/logo.png"
            className="w-full h-full object-cover"
          />
        </div>
        <NavBar/>
      </div>
    </>
  );
}