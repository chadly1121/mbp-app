import { Toaster as Sonner } from "@/components/ui/sonner";
import { Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { ProtectedRoute, AuthProvider } from "@/hooks/useAuth";
import { CompanyProvider } from "@/hooks/useCompany";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Lazy load components for better performance
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const QBOCallback = lazy(() => import("./pages/QBOCallback"));
const Legal = lazy(() => import("./pages/Legal"));
const NotFound = lazy(() => import("./pages/NotFound"));
const BetaAdminPanel = lazy(() => import("@/components/BetaAdminPanel").then(m => ({ default: m.BetaAdminPanel })));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const App = () => (
  <ErrorBoundary>
    <AuthProvider>
      <Sonner />
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/qbo-callback" element={<QBOCallback />} />
          <Route path="/legal" element={<Legal />} />
          <Route 
            path="/admin/beta" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <BetaAdminPanel />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/" 
            element={
              <ProtectedRoute requireBetaAccess={false}>
                <CompanyProvider>
                  <Index />
                </CompanyProvider>
              </ProtectedRoute>
            } 
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  </ErrorBoundary>
);

export default App;
