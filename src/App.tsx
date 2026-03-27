import { Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ChapterProvider } from "@/contexts/ChapterContext";
import { lazyRetry } from "@/lib/lazyRetry";

const Index = lazyRetry(() => import("./pages/Index.tsx"));
const ResetPassword = lazyRetry(() => import("./pages/ResetPassword.tsx"));
const Feedback = lazyRetry(() => import("./pages/Feedback.tsx"));
const Reviews = lazyRetry(() => import("./pages/Reviews.tsx"));
const Admin = lazyRetry(() => import("./pages/Admin.tsx"));
const Slovak = lazyRetry(() => import("./pages/Slovak.tsx"));
const NotFound = lazyRetry(() => import("./pages/NotFound.tsx"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ChapterProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/feedback" element={<Feedback />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/admin" element={<Admin />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ChapterProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
