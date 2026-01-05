import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import DashboardV02 from "./pages/DashboardV02";
import CoffeePage from "./pages/Coffee";
import ExpansionPage from "./pages/Expansion";
import FinancePage from "./pages/Finance";
import ActionsCreatePage from "./pages/ActionsCreate";
import ApresentacaoPage from "./pages/Apresentacao";
import Apresentacao02Page from "./pages/Apresentacao02";
import CRMPage from "./pages/CRM";
import ProdutosPage from "./pages/Produtos";
import ContactsPage from "./pages/Contacts";
import AdminHealth from "./pages/admin/Health";
import AdminSettings from "./pages/admin/Settings";
import AdminFinance from "./pages/admin/Finance";
import SelfTest from "./pages/SelfTest";
import NotFound from "./pages/NotFound";
import RelatosPage from "./pages/Relatos";
import TestePage from "./pages/Teste";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster richColors position="top-right" />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardV02 />} />
        <Route path="/coffee" element={<CoffeePage />} />
        <Route path="/expansion" element={<ExpansionPage />} />
        <Route path="/finance" element={<FinancePage />} />
        <Route path="/tasks" element={<ActionsCreatePage />} />
        <Route path="/crm" element={<CRMPage />} />
        <Route path="/produtos" element={<ProdutosPage />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/apresentacao" element={<ApresentacaoPage />} />
        <Route path="/apresentacao-02" element={<Apresentacao02Page />} />
        <Route path="/admin/health" element={<AdminHealth />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/finance" element={<AdminFinance />} />
        <Route path="/__selftest" element={<SelfTest />} />
        <Route path="/relatos" element={<RelatosPage />} />
        <Route path="/teste" element={<TestePage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
