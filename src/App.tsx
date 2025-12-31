import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import CoffeePage from "./pages/Coffee";
import ExpansionPage from "./pages/Expansion";
import FinancePage from "./pages/Finance";
import ActionsCreatePage from "./pages/ActionsCreate";
import ApresentacaoPage from "./pages/Apresentacao";
import AdminHealth from "./pages/admin/Health";
import AdminSettings from "./pages/admin/Settings";
import AdminFinance from "./pages/admin/Finance";
import SelfTest from "./pages/SelfTest";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Public routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/coffee" element={<CoffeePage />} />
          <Route path="/expansion" element={<ExpansionPage />} />
          <Route path="/finance" element={<FinancePage />} />
          <Route path="/tasks" element={<ActionsCreatePage />} />
          <Route path="/apresentacao" element={<ApresentacaoPage />} />
          
          {/* Admin routes (passcode protected) */}
          <Route path="/admin/health" element={<AdminHealth />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/finance" element={<AdminFinance />} />
          
          {/* Self test (passcode protected) */}
          <Route path="/__selftest" element={<SelfTest />} />
          
          {/* Phase 2 partner routes - not exposed yet */}
          {/* <Route path="/partner/login" element={<PartnerLogin />} /> */}
          {/* <Route path="/partner/dashboard" element={<PartnerDashboard />} /> */}
          {/* <Route path="/partner/share/:token" element={<PartnerShare />} /> */}
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
