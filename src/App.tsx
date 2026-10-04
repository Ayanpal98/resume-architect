import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import PlanGate from "@/components/PlanGate";
import Index from "./pages/Index";
import Welcome from "./pages/Welcome";
import Builder from "./pages/Builder";
import ATSAnalysis from "./pages/ATSAnalysis";
import Recruiter from "./pages/Recruiter";
import CareerIntelligence from "./pages/CareerIntelligence";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Security from "./pages/Security";
import Privacy from "./pages/Privacy";
import DeepImprovement from "./pages/DeepImprovement";
import PortfolioStudio from "./pages/PortfolioStudio";
import Pricing from "./pages/Pricing";
import Checkout from "./pages/Checkout";
import AdminOrders from "./pages/AdminOrders";
import { InstallPrompt } from "@/components/InstallPrompt";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Toaster />
      <Sonner />
      <InstallPrompt />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/welcome" element={<ProtectedRoute><Welcome /></ProtectedRoute>} />
            <Route path="/builder" element={<ProtectedRoute><Builder /></ProtectedRoute>} />
            <Route path="/ats-analysis" element={<ProtectedRoute><ATSAnalysis /></ProtectedRoute>} />
            <Route path="/recruiter" element={<ProtectedRoute><PlanGate audience="recruiter" minTier={1} feature="Recruiter hiring portal" fullPage><Recruiter /></PlanGate></ProtectedRoute>} />
            <Route path="/career-intelligence" element={<ProtectedRoute><CareerIntelligence /></ProtectedRoute>} />
            <Route path="/deep-improvement" element={<ProtectedRoute><PlanGate audience="jobseeker" minTier={3} feature="Deep Resume Improvement" fullPage><DeepImprovement /></PlanGate></ProtectedRoute>} />
            <Route path="/portfolio-studio" element={<ProtectedRoute><PortfolioStudio /></ProtectedRoute>} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/admin/orders" element={<ProtectedRoute><AdminOrders /></ProtectedRoute>} />
            <Route path="/security" element={<Security />} />
            <Route path="/privacy" element={<Privacy />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
