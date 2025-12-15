import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/lib/auth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/auth/AdminLogin";
import ClientLogin from "./pages/auth/ClientLogin";
import Dashboard from "./pages/admin/Dashboard";
import Appointments from "./pages/admin/Appointments";
import Services from "./pages/admin/Services";
import Schedules from "./pages/admin/Schedules";
import Clients from "./pages/admin/Clients";
import ClientHome from "./pages/client/ClientHome";
import BookService from "./pages/client/BookService";
import ClientProfile from "./pages/client/ClientProfile";
import ClientNotifications from "./pages/client/ClientNotifications";

const queryClient = new QueryClient();

function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }
  
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/client" replace />;
  }
  
  return <>{children}</>;
}

function ProtectedClientRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<ClientLogin />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedAdminRoute><Dashboard /></ProtectedAdminRoute>} />
      <Route path="/admin/appointments" element={<ProtectedAdminRoute><Appointments /></ProtectedAdminRoute>} />
      <Route path="/admin/services" element={<ProtectedAdminRoute><Services /></ProtectedAdminRoute>} />
      <Route path="/admin/schedules" element={<ProtectedAdminRoute><Schedules /></ProtectedAdminRoute>} />
      <Route path="/admin/clients" element={<ProtectedAdminRoute><Clients /></ProtectedAdminRoute>} />
      <Route path="/admin/messages" element={<ProtectedAdminRoute><Dashboard /></ProtectedAdminRoute>} />
      <Route path="/admin/settings" element={<ProtectedAdminRoute><Dashboard /></ProtectedAdminRoute>} />
      
      {/* Client Routes */}
      <Route path="/client" element={<ProtectedClientRoute><ClientHome /></ProtectedClientRoute>} />
      <Route path="/client/book" element={<ProtectedClientRoute><BookService /></ProtectedClientRoute>} />
      <Route path="/client/profile" element={<ProtectedClientRoute><ClientProfile /></ProtectedClientRoute>} />
      <Route path="/client/notifications" element={<ProtectedClientRoute><ClientNotifications /></ProtectedClientRoute>} />
      
      {/* Catch all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
