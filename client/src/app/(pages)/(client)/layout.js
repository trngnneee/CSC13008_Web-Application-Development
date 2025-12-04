import { ClientAuthProvider } from "@/provider/clientAuthProvider";
import { ClientFooter } from "./components/ClientFooter/ClientFooter";
import { ClientHeader } from "./components/ClientHeader/ClientHeader";

export default function ClientLayout({ children }) {
  return (
    <div className="client">
      <ClientAuthProvider>
        <ClientHeader />
        {children}
        <ClientFooter />
      </ClientAuthProvider>
    </div>
  );
}
