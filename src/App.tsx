import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./contexts/AuthContext";
// import Apresentacao03Page from "./pages/Apresentacao03";
// import Apresentacao05Page from "./pages/Apresentacao05";
// import NotFound from "./pages/NotFound";
const NotFound = () => <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-900">
  <div className="text-center">
    <h1 className="text-9xl font-black text-gray-200 dark:text-gray-700">404</h1>
    <p className="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">Page not found.</p>
    <a href="/v5-3-5" className="mt-6 inline-block rounded bg-indigo-600 px-5 py-3 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring">Go Back Home</a>
  </div>
</div>;
// import FinancePage from "./pages/Finance";
// REMOVIDO: VendeMaisObras (projeto separado - backup em /Users/fabricio/Documents/Backups/outros-projetos-2026-02-07/)
// AXIS V3 — Páginas (Removidas)
// import AxisTempoRealV1 from "./pages/AxisTempoRealV1";
// import AxisTempoRealV1_2 from "./pages/AxisTempoRealV1_2";
// import AxisTempoRealV1_3 from "./pages/AxisTempoRealV1_3";
// import AxisTempoRealV1_4 from "./pages/AxisTempoRealV1_4";
// import AxisTempoRealV1_5 from "./pages/AxisTempoRealV1_5";
// import AxisTempoRealV2 from "./pages/AxisTempoRealV2";
// import AxisTempoRealV2_2 from "./pages/AxisTempoRealV2_2";
// import AxisTempoRealV2_3 from "./pages/AxisTempoRealV2_3";
// import AxisTempoRealV2_4 from "./pages/AxisTempoRealV2_4";
// import PropostaMarcelaBuenoV2 from "./pages/PropostaMarcelaBuenoV2";
// import PropostaMarcelaBuenoV3 from "./pages/PropostaMarcelaBuenoV3";
// import PropostaMarcelaBuenoVersaoFinal from "./pages/PropostaMarcelaBuenoVersaoFinal";
// REMOVIDO: FinanceFlora (projeto separado - backup em /Users/fabricio/Documents/Backups/outros-projetos-2026-02-07/)
// REMOVIDO: LPAntivacanciaV1, PropostaMarcelaBueno, PagouEntrada1000 (backup realizado)
// REMOVIDO: v4-9 e v5-1/v5-2 (arquivos deletados)
// import AxisV491Page from "./app/v4-9-1/page";
// import AxisV492Page from "./app/v4-9-2/page";
// import AxisV53Page from "./app/v5-3/page";
// import AxisV531Page from "./app/v5-3-1/page";
// import AxisV532Page from "./app/v5-3-2/page";
// import AxisV533Page from "./app/v5-3-3/page";
// import AxisV534Page from "./app/v5-3-4/page";
import AxisV535Page from "./app/v5-3-5/page";
// REMOVIDO: PagouTotal4000 (backup realizado)
// REMOVIDO: AxisTempoRealV4_6_4, V4_4, V4_1_2 (páginas corrompidas sem export válido)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});



const App = () => {
  console.log("AXIS_DEPLOY_VERSION: v5.3.5");
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster richColors position="top-right" />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <AuthProvider>
          <Routes>
            {/* ROTA ISOLADA - PERFORMANCE MÁXIMA (Sem MainLayout/Global CSS) */}
            <Route path="/v5-3-5" element={<AxisV535Page />} />

            {/* TODAS AS OUTRAS ROTAS COMENTADAS PARA FIX BUILD */}
            {/*
            <Route path="/axis/tempo-real/v1" element={<AxisTempoRealV1 />} />
            <Route path="/axis/tempo-real/v2" element={<AxisTempoRealV2 />} />
            <Route path="/axis/tempo-real/v2.2" element={<AxisTempoRealV2_2 />} />
            <Route path="/axis/tempo-real/v2.3" element={<AxisTempoRealV2_3 />} />
            <Route path="/axis/tempo-real/v2.4" element={<AxisTempoRealV2_4 />} />
            <Route path="/axis/tempo-real/v1-2" element={<AxisTempoRealV1_2 />} />
            <Route path="/axis/tempo-real/v1-3" element={<AxisTempoRealV1_3 />} />
            <Route path="/axis/tempo-real/v1-4" element={<AxisTempoRealV1_4 />} />
            <Route path="/axis/tempo-real/v1-5" element={<AxisTempoRealV1_5 />} />
            
            <Route path="/v4-9" element={<Navigate to="/v5-3-2" replace />} />
            <Route path="/v4-9/" element={<Navigate to="/v5-3-2" replace />} />
            <Route path="/v4-9-1" element={<AxisV491Page />} />
            <Route path="/v4-9-2" element={<AxisV492Page />} />

            <Route path="/v5" element={<Navigate to="/v5-3-2" replace />} />
            <Route path="/v5-1" element={<Navigate to="/v5-3-2" replace />} />
            <Route path="/v5-2" element={<Navigate to="/v5-3-2" replace />} />

            <Route path="/v5-3" element={<AxisV53Page />} />
            <Route path="/v5-3-1" element={<AxisV531Page />} />
            <Route path="/v5-3-2" element={<AxisV532Page />} />
            <Route path="/v5-3-3" element={<AxisV533Page />} />
            <Route path="/v5-3-4" element={<AxisV534Page />} />
            
            <Route path="/proposta/marcela-bueno/v2" element={<PropostaMarcelaBuenoV2 />} />
            <Route path="/proposta2/marcela-bueno" element={<PropostaMarcelaBuenoV2 />} />
            <Route path="/proposta/marcela-bueno-v3" element={<PropostaMarcelaBuenoV3 />} />
            <Route path="/proposta/marcela-bueno/versao-final" element={<PropostaMarcelaBuenoVersaoFinal />} />

            <Route path="/" element={<Navigate to="/v5-3-2" replace />} />
            <Route path="/dashboard" element={<Navigate to="/v5-3-2" replace />} />
            <Route path="/finance/flora" element={<FinancePage />} />
            
            <Route
              path="/apresentacao-03"
              element={<Apresentacao03Page />}
            />
            <Route
              path="/apresentacao-05"
              element={<Apresentacao05Page />}
            />
            */}
            <Route
              path="*"
              element={<NotFound />}
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
