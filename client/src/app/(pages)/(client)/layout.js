import { ClientFooter } from "./components/ClientFooter/ClientFooter";
import { ClientHeader } from "./components/ClientHeader/ClientHeader";

export default function ClientLayout({ children }) {
  return (
    <div className="client">
      <ClientHeader />
       {children}
      <ClientFooter />
    </div>
  );
}
