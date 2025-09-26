import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import { CompanyProvider } from "@/hooks/useCompany";
import { BetaAdminPanel } from "@/components/BetaAdminPanel";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import QBOCallback from "./pages/QBOCallback";
import Legal from "./pages/Legal";
import NotFound from "./pages/NotFound";
import Invite from "./pages/Invite";
import ShareObjective from "./pages/ShareObjective";
import SharePage from "./pages/SharePage";
import MyShares from "./pages/MyShares";

const queryClient = new QueryClient();

const App = () => {
  console.log('App component rendering');
  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        {/* PUBLIC routes: no auth */}
        <Route path="/shared/:token/:mode" element={<SharePage />} />
        <Route path="/my-shares" element={<MyShares />} />
        
        <Route path="/auth" element={<Auth />} />
        <Route path="/invite/:token" element={<Invite />} />
        <Route path="/share/:token" element={<ShareObjective />} />
        <Route path="/qbo-callback" element={<QBOCallback />} />
        <Route path="/legal" element={<Legal />} />
        <Route 
          path="/admin/beta" 
          element={
            <ProtectedRoute>
              <BetaAdminPanel />
            </ProtectedRoute>
          } 
        />
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
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
