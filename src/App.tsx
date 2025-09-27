import React from "react";
import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "./components/ui/tooltip";
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import Invite from "./pages/Invite";
import QBOCallback from "./pages/QBOCallback";
import Legal from "./pages/Legal";
import ShareObjective from "./pages/ShareObjective";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./hooks/useAuth";
import { CompanyProvider } from "./hooks/useCompany";
import SharePage from "./pages/SharePage";
import MyShares from "./pages/MyShares";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ObjectiveCard } from "./components/objectives";

const queryClient = new QueryClient();

const App = () => {
  // Keep the smoke route for testing
  const Smoke = () => (
    <div className="p-4">
      <h1 className="text-xl font-semibold">Smoke Test - App is Working!</h1>
      <p className="mb-4">If you can see this, React is rendering successfully.</p>
      <div className="border rounded p-3 mb-2">
        <h3 className="font-semibold">Test Objective - Grow Revenue</h3>
        <p className="text-sm text-muted-foreground">Smoke test for objective cards working</p>
      </div>
      <div className="mt-4 space-y-2">
        <p><strong>Available routes:</strong></p>
        <ul className="list-disc list-inside space-y-1">
          <li><a href="/" className="text-blue-600 underline">/ - Main Dashboard (requires auth)</a></li>
          <li><a href="/auth" className="text-blue-600 underline">/auth - Login/Signup</a></li>
          <li><a href="/shared/test/viewer" className="text-blue-600 underline">/shared/:token/:mode - Share Page</a></li>
          <li><a href="/my-shares" className="text-blue-600 underline">/my-shares - My Shares</a></li>
          <li><a href="/legal" className="text-blue-600 underline">/legal - Legal Page</a></li>
          <li><a href="/smoke" className="text-blue-600 underline">/smoke - This Test Page</a></li>
        </ul>
      </div>
    </div>
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ErrorBoundary>
          <AuthProvider>
          <Routes>
            {/* PUBLIC routes: no auth required */}
            <Route path="/shared/:token/:mode" element={<SharePage />} />
            <Route path="/my-shares" element={<MyShares />} />
            <Route path="/smoke" element={<Smoke />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/invite/:token" element={<Invite />} />
            <Route path="/share/:token" element={<ShareObjective />} />
            <Route path="/qbo-callback" element={<QBOCallback />} />
            <Route path="/legal" element={<Legal />} />

            {/* PROTECTED main app */}
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

            {/* 404 catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </AuthProvider>
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
