import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import Logo from "@/components/logo";
import { useAuth } from "@/hooks/use-auth";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import LanguageSwitcher from "@/components/language-switcher";

const MobileNav = () => {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Each navigation item
  const navItems = [
    {
      label: "Login",
      icon: "fas fa-sign-in-alt",
      href: "/",
      showWhen: !user
    },
    {
      label: "Patient Dashboard",
      icon: "fas fa-columns",
      href: "/patient-dashboard",
      showWhen: user?.role === "patient"
    },
    {
      label: "Doctor Dashboard",
      icon: "fas fa-user-md",
      href: "/doctor-dashboard",
      showWhen: user?.role === "doctor"
    },
    {
      label: "Find Doctors",
      icon: "fas fa-search",
      href: "/find-doctors",
      showWhen: true
    },
    {
      label: "Book Appointment",
      icon: "fas fa-calendar-alt",
      href: "/booking",
      showWhen: user?.role === "patient"
    },
    {
      label: "Medical Records",
      icon: "fas fa-file-medical-alt",
      href: "/medical-records",
      showWhen: user?.role === "patient"
    }
  ];

  // Filter out items that shouldn't be shown based on user role
  const filteredNavItems = navItems.filter(item => item.showWhen);

  return (
    <header className="md:hidden bg-white shadow-sm fixed top-0 left-0 right-0 z-10">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Logo />
        </div>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <button type="button" className="text-neutral-500">
              <i className="fas fa-bars"></i>
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center h-16 px-4 bg-white border-b border-neutral-200">
                <Logo />
              </div>
              <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                <div className="flex-1 px-3 space-y-1">
                  {filteredNavItems.map((item) => (
                    <Link 
                      key={item.href} 
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "group flex items-center px-3 py-2 text-sm font-medium rounded-md",
                        location === item.href 
                          ? "bg-primary-100 text-primary-800" 
                          : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800"
                      )}
                    >
                      <i className={cn(
                        item.icon, 
                        "mr-3 flex-shrink-0",
                        location === item.href 
                          ? "text-primary-600" 
                          : "text-neutral-500"
                      )}></i>
                      <span>{item.label}</span>
                    </Link>
                  ))}
                  
                  {user && (
                    <button 
                      onClick={() => {
                        logout();
                        setIsOpen(false);
                      }}
                      className="w-full text-left group flex items-center px-3 py-2 text-sm font-medium rounded-md text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800"
                    >
                      <i className="fas fa-sign-out-alt mr-3 flex-shrink-0 text-neutral-500"></i>
                      <span>Logout</span>
                    </button>
                  )}
                </div>
              </div>
              <div className="border-t border-neutral-200 p-4 space-y-3">
                <div className="flex justify-between items-center px-2">
                  <span className="text-sm font-medium text-neutral-600">Language</span>
                  <LanguageSwitcher />
                </div>
                <button 
                  id="chatbot-toggle" 
                  className="w-full flex items-center justify-center px-4 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition"
                  onClick={() => {
                    setIsOpen(false);
                    const chatbotContainer = document.getElementById('chatbot-container');
                    if (chatbotContainer) {
                      chatbotContainer.classList.toggle('hidden');
                    }
                  }}
                >
                  <i className="fas fa-robot mr-2"></i>
                  <span>Chat Assistant</span>
                </button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default MobileNav;
