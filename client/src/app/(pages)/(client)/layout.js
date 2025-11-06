import { ClientHeader } from "./components/ClientHeader/ClientHeader";

export default function ClientLayout({ children }) {
  return (
    <>
      <ClientHeader />
       {children}
    </>
  );
}
