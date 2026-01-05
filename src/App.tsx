import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import DashboardV02 from "./pages/DashboardV02";
// TEMPORÁRIO: Removido para reunião - import CoffeePage from "./pages/Coffee";
// TEMPORÁRIO: Removido para reunião - import ExpansionPage from "./pages/Expansion";
import FinancePage from "./pages/Finance";
import ActionsCreatePage from "./pages/ActionsCreate";
// TEMPORÁRIO: Removido para reunião - import ApresentacaoPage from "./pages/Apresentacao";
// TEMPORÁRIO: Removido para reunião - import Apresentacao02Page from "./pages/Apresentacao02";
import CRMPage from "./pages/CRM";
// TEMPORÁRIO: Removido para reunião - import ProdutosPage from "./pages/Produtos";
import ContactsPage from "./pages/Contacts";
// TEMPORÁRIO: Removido para reunião - import AdminHealth from "./pages/admin/Health";
// TEMPORÁRIO: Removido para reunião - import AdminSettings from "./pages/admin/Settings";
// TEMPORÁRIO: Removido para reunião - import AdminFinance from "./pages/admin/Finance";
import SelfTest from "./pages/SelfTest";
import NotFound from "./pages/NotFound";
import RelatosPage from "./pages/Relatos";
// TEMPORÁRIO: Removido para reunião - import TestePage from "./pages/Teste";

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
        {/* TEMPORÁRIO: Removido para reunião - <Route path="/coffee" element={<CoffeePage />} /> */}
        {/* TEMPORÁRIO: Removido para reunião - <Route path="/expansion" element={<ExpansionPage />} /> */}
        <Route path="/finance" element={<FinancePage />} />
        <Route path="/tasks" element={<ActionsCreatePage />} />
        <Route path="/crm" element={<CRMPage />} />
        {/* TEMPORÁRIO: Removido para reunião - <Route path="/produtos" element={<ProdutosPage />} /> */}
        <Route path="/contacts" element={<ContactsPage />} />
        {/* TEMPORÁRIO: Removido para reunião - <Route path="/apresentacao" element={<ApresentacaoPage />} /> */}
        {/* TEMPORÁRIO: Removido para reunião - <Route path="/apresentacao-02" element={<Apresentacao02Page />} /> */}
        {/* TEMPORÁRIO: Removido para reunião - <Route path="/admin/health" element={<AdminHealth />} /> */}
        {/* TEMPORÁRIO: Removido para reunião - <Route path="/admin/settings" element={<AdminSettings />} /> */}
        {/* TEMPORÁRIO: Removido para reunião - <Route path="/admin/finance" element={<AdminFinance />} /> */}
        <Route path="/__selftest" element={<SelfTest />} />
        <Route path="/relatos" element={<RelatosPage />} />
        {/* TEMPORÁRIO: Removido para reunião - <Route path="/teste" element={<TestePage />} /> */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
