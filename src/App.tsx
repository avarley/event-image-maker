import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import DocsIndex from "./pages/DocsIndex";
import ChatHistory from "./pages/docs/ChatHistory";
import Architecture from "./pages/docs/Architecture";
import Libraries from "./pages/docs/Libraries";
import Functionality from "./pages/docs/Functionality";
import MigrationGuide from "./pages/docs/MigrationGuide";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/docs" element={<DocsIndex />} />
          <Route path="/docs/chat-history" element={<ChatHistory />} />
          <Route path="/docs/architecture" element={<Architecture />} />
          <Route path="/docs/libraries" element={<Libraries />} />
          <Route path="/docs/functionality" element={<Functionality />} />
          <Route path="/docs/migration" element={<MigrationGuide />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
