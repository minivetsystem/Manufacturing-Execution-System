import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { OperatorProvider, useOperator } from "@/contexts/OperatorContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { ManufacturingProvider } from "./contexts/ManufacturingContext";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { operator } = useOperator();
  
  if (!operator) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <OperatorProvider>
          <ManufacturingProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/"  element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                } />
          
            <Route path="*" element={<NotFound />} />
          </Routes>
          </ManufacturingProvider>
        </OperatorProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
