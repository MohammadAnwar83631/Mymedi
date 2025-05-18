import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { LanguageProvider } from "@/components/language-switcher";

// Pages
import Login from "@/pages/login";
import PatientDashboard from "@/pages/patient-dashboard";
import DoctorDashboard from "@/pages/doctor-dashboard";
import FindDoctors from "@/pages/find-doctors";
import Booking from "@/pages/booking";
import MedicalRecords from "@/pages/medical-records";
import NotFound from "@/pages/not-found";

// Components
import Sidebar from "@/components/sidebar";
import MobileNav from "@/components/mobile-nav";
import Chatbot from "@/components/chatbot";
import LanguageSwitcher from "@/components/language-switcher";

function Router() {
  const [location] = useLocation();

  // Check if we're on the login page
  const isLoginPage = location === "/";

  return (
    <>
      {!isLoginPage && <MobileNav />}
      {!isLoginPage && <Sidebar />}
      
      <main className={!isLoginPage ? "md:pl-64 pt-14 md:pt-0 min-h-screen" : ""}>
        <Switch>
          <Route path="/" component={Login} />
          <Route path="/patient-dashboard" component={PatientDashboard} />
          <Route path="/doctor-dashboard" component={DoctorDashboard} />
          <Route path="/find-doctors" component={FindDoctors} />
          <Route path="/booking/:doctorId?" component={Booking} />
          <Route path="/medical-records" component={MedicalRecords} />
          <Route component={NotFound} />
        </Switch>
      </main>
      
      {!isLoginPage && <Chatbot />}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <AuthProvider>
            <Toaster />
            <Router />
          </AuthProvider>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
