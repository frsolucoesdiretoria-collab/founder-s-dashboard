import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { PasswordProtection } from "./components/PasswordProtection";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import DashboardV02 from "./pages/DashboardV02";
// TEMPORÁRIO: Removido para reunião - import CoffeePage from "./pages/Coffee";
// TEMPORÁRIO: Removido para reunião - import ExpansionPage from "./pages/Expansion";
import FinancePage from "./pages/Finance";
import ActionsCreatePage from "./pages/ActionsCreate";
// TEMPORÁRIO: Removido para reunião - import ApresentacaoPage from "./pages/Apresentacao";
import Apresentacao03Page from "./pages/Apresentacao03";
import Apresentacao05Page from "./pages/Apresentacao05";
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
import DomaCondoDashboard from "./pages/DomaCondoDashboard";
import DomaCondoClientLogin from "./pages/DomaCondoClientLogin";
import DomaCondoClientReport from "./pages/DomaCondoClientReport";
import VendeMaisObrasPage from "./pages/VendeMaisObras";
import VendeMaisObrasCatalogo from "./pages/VendeMaisObrasCatalogo";
import VendeMaisObrasLogin from "./pages/VendeMaisObrasLogin";
import VendeMaisObrasRegister from "./pages/VendeMaisObrasRegister";
import VendeMaisObrasDashboard from "./pages/VendeMaisObrasDashboard";
import VendeMaisObrasProfile from "./pages/VendeMaisObrasProfile";
import VendeMaisObrasOrcamentos from "./pages/VendeMaisObrasOrcamentos";
import VendeMaisObrasClientes from "./pages/VendeMaisObrasClientes";
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
const domaCondoPassword = "deixeatecnologiafazer";
const vendeMaisObrasPassword = import.meta.env.VITE_VENDE_MAIS_OBRAS_PASSWORD as string | undefined;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster richColors position="top-right" />
    <BrowserRouter>
      <AuthProvider>
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
        {/* DOMA CONDO: Dashboard protegido por senha */}
        <Route
          path="/dashboard-doma-condo"
          element={
            <PasswordProtection
              storageKey="doma_condo_authenticated"
              correctPassword={domaCondoPassword}
              title="Acesso Restrito — DOMA CONDO"
              description="Digite a senha para acessar o painel DOMA CONDO"
            >
              <DomaCondoDashboard />
            </PasswordProtection>
          }
        />
        {/* DOMA CONDO: Portal de Clientes */}
        <Route path="/doma-condo-clientes/login" element={<DomaCondoClientLogin />} />
        <Route path="/doma-condo-clientes/relatorio" element={<DomaCondoClientReport />} />
        {/* Vende Mais Obras: Rotas públicas */}
        <Route path="/vende-mais-obras/login" element={<VendeMaisObrasLogin />} />
        <Route path="/vende-mais-obras/register" element={<VendeMaisObrasRegister />} />

        {/* Vende Mais Obras: Rotas protegidas */}
        <Route
          path="/vende-mais-obras"
          element={
            <ProtectedRoute>
              <VendeMaisObrasDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vende-mais-obras/catalogo"
          element={
            <ProtectedRoute>
              <VendeMaisObrasCatalogo />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vende-mais-obras/orcamentos"
          element={
            <ProtectedRoute>
              <VendeMaisObrasOrcamentos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vende-mais-obras/perfil"
          element={
            <ProtectedRoute>
              <VendeMaisObrasProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vende-mais-obras/clientes"
          element={
            <ProtectedRoute>
              <VendeMaisObrasClientes />
            </ProtectedRoute>
          }
        />

        {/* Vende Mais Obras: Admin (mantido com passcode para compatibilidade) */}
        <Route
          path="/vende-mais-obras/admin"
          element={
            <PasswordProtection
              storageKey="vende_mais_obras_authenticated"
              correctPassword={vendeMaisObrasPassword || ''}
              title="Acesso Restrito — Vende Mais Obras Admin"
              description="Digite a senha para acessar o painel admin"
            >
              <VendeMaisObrasPage />
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
        <Route
          path="/apresentacao-03"
          element={
            <PasswordProtection storageKey="app_authenticated" correctPassword={appPassword || ''}>
              <Apresentacao03Page />
            </PasswordProtection>
          }
        />
        <Route
          path="/apresentacao-05"
          element={
            <PasswordProtection storageKey="app_authenticated" correctPassword={appPassword || ''}>
              <Apresentacao05Page />
            </PasswordProtection>
          }
        />
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
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
