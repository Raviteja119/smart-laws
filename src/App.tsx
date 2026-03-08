import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import UploadBill from "@/pages/UploadBill";
import DocumentAnalysis from "@/pages/DocumentAnalysis";
import AskTheBill from "@/pages/AskTheBill";
import BillComparison from "@/pages/BillComparison";
import TokenEfficiency from "@/pages/TokenEfficiency";
import SettingsPage from "@/pages/SettingsPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<UploadBill />} />
            <Route path="/analysis" element={<DocumentAnalysis />} />
            <Route path="/chat" element={<AskTheBill />} />
            <Route path="/comparison" element={<BillComparison />} />
            <Route path="/tokens" element={<TokenEfficiency />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
