import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { PasswordProtection } from "./components/PasswordProtection";
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
import ProposalsPage from "./pages/Proposals";
// TEMPORÁRIO: Removido para reunião - import AdminHealth from "./pages/admin/Health";
// TEMPORÁRIO: Removido para reunião - import AdminSettings from "./pages/admin/Settings";
// TEMPORÁRIO: Removido para reunião - import AdminFinance from "./pages/admin/Finance";
import SelfTest from "./pages/SelfTest";
import NotFound from "./pages/NotFound";
import RelatosPage from "./pages/Relatos";
import DoterraPage from "./pages/Doterra";
// TEMPORÁRIO: Removido para reunião - import TestePage from "./pages/Teste";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const appPassword = import.meta.env.VITE_APP_PASSWORD as string | undefined;
const doterraPassword = import.meta.env.VITE_DOTERRA_PASSWORD as string | undefined;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster richColors position="top-right" />
    <BrowserRouter>
      <Routes>
        {/* Doterra: senha separada do app geral */}
        <Route
          path="/doterra"
          element={
            <PasswordProtection
              storageKey="doterra_authenticated"
              correctPassword={doterraPassword || ''}
              title="Acesso Restrito — Doterra"
              description="Digite a senha para acessar o painel Doterra"
            >
              <DoterraPage />
            </PasswordProtection>
          }
        />

        {/* App geral: senha própria (não compartilha com clientes) */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/dashboard"
          element={
            <PasswordProtection storageKey="app_authenticated" correctPassword={appPassword || ''}>
              <DashboardV02 />
            </PasswordProtection>
          }
        />
        {/* TEMPORÁRIO: Removido para reunião - <Route path="/coffee" element={<CoffeePage />} /> */}
        {/* TEMPORÁRIO: Removido para reunião - <Route path="/expansion" element={<ExpansionPage />} /> */}
        <Route
          path="/finance"
          element={
            <PasswordProtection storageKey="app_authenticated" correctPassword={appPassword || ''}>
              <FinancePage />
            </PasswordProtection>
          }
        />
        <Route
          path="/tasks"
          element={
            <PasswordProtection storageKey="app_authenticated" correctPassword={appPassword || ''}>
              <ActionsCreatePage />
            </PasswordProtection>
          }
        />
        <Route
          path="/crm"
          element={
            <PasswordProtection storageKey="app_authenticated" correctPassword={appPassword || ''}>
              <CRMPage />
            </PasswordProtection>
          }
        />
        {/* TEMPORÁRIO: Removido para reunião - <Route path="/produtos" element={<ProdutosPage />} /> */}
        <Route
          path="/contacts"
          element={
            <PasswordProtection storageKey="app_authenticated" correctPassword={appPassword || ''}>
              <ContactsPage />
            </PasswordProtection>
          }
        />
        <Route
          path="/proposals"
          element={
            <PasswordProtection storageKey="app_authenticated" correctPassword={appPassword || ''}>
              <ProposalsPage />
            </PasswordProtection>
          }
        />
        {/* TEMPORÁRIO: Removido para reunião - <Route path="/apresentacao" element={<ApresentacaoPage />} /> */}
        {/* TEMPORÁRIO: Removido para reunião - <Route path="/apresentacao-02" element={<Apresentacao02Page />} /> */}
        {/* TEMPORÁRIO: Removido para reunião - <Route path="/admin/health" element={<AdminHealth />} /> */}
        {/* TEMPORÁRIO: Removido para reunião - <Route path="/admin/settings" element={<AdminSettings />} /> */}
        {/* TEMPORÁRIO: Removido para reunião - <Route path="/admin/finance" element={<AdminFinance />} /> */}
        <Route
          path="/__selftest"
          element={
            <PasswordProtection storageKey="app_authenticated" correctPassword={appPassword || ''}>
              <SelfTest />
            </PasswordProtection>
          }
        />
        <Route
          path="/relatos"
          element={
            <PasswordProtection storageKey="app_authenticated" correctPassword={appPassword || ''}>
              <RelatosPage />
            </PasswordProtection>
          }
        />
        {/* TEMPORÁRIO: Removido para reunião - <Route path="/teste" element={<TestePage />} /> */}
        <Route
          path="*"
          element={
            <PasswordProtection storageKey="app_authenticated" correctPassword={appPassword || ''}>
              <NotFound />
            </PasswordProtection>
          }
        />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
