import React from "react";
import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "./components/ui/tooltip";
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import ProtectedRoute from "./components/ProtectedRoute";
import { CompanyProvider } from "./hooks/useCompany";
import SharePage from "./pages/SharePage";
import MyShares from "./pages/MyShares";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { StrategicObjectiveCard } from "./components/StrategicObjectiveCard";

const queryClient = new QueryClient();

const App = () => {
  // quick smoke route to prove rendering works
  const Smoke = () => (
    <div className="p-4">
      <h1 className="text-xl font-semibold">Smoke OK</h1>
      <StrategicObjectiveCard id="1" title="Grow Revenue" />
    </div>
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ErrorBoundary>
          <Routes>
            {/* PUBLIC */}
            <Route path="/share/:token/:mode" element={<SharePage />} />
            <Route path="/my-shares" element={<MyShares />} />
            <Route path="/smoke" element={<Smoke />} />

            {/* AUTH */}
            <Route path="/auth" element={<Auth />} />

            {/* PROTECTED */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <CompanyProvider>
                    <Index />
                  </CompanyProvider>
                </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;