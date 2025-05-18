import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "patient" | "doctor";
  phone?: string;
  address?: string;
}

interface DoctorProfile {
  id: number;
  userId: number;
  specialty: string;
  bio?: string;
  imageUrl?: string;
  languages?: string;
  location?: string;
  acceptingNewPatients: boolean;
  videoVisits: boolean;
  licenseId: string;
  rating: number;
  reviewCount: number;
}

interface AuthContextType {
  user: User | null;
  doctorProfile: DoctorProfile | null;
  loading: boolean;
  login: (email: string, password: string, role: "patient" | "doctor") => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem("user");
    const storedDoctorProfile = localStorage.getItem("doctorProfile");
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      
      if (storedDoctorProfile) {
        setDoctorProfile(JSON.parse(storedDoctorProfile));
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, role: "patient" | "doctor") => {
    try {
      setLoading(true);
      
      const response = await apiRequest("POST", "/api/auth/login", {
        email,
        password,
        role
      });
      
      const data = await response.json();
      
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      if (data.doctorProfile) {
        setDoctorProfile(data.doctorProfile);
        localStorage.setItem("doctorProfile", JSON.stringify(data.doctorProfile));
      }
      
      // Redirect based on role
      if (role === "patient") {
        setLocation("/patient-dashboard");
      } else {
        setLocation("/doctor-dashboard");
      }
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${data.user.firstName}!`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "Invalid email or password. Please try again.",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setDoctorProfile(null);
    localStorage.removeItem("user");
    localStorage.removeItem("doctorProfile");
    setLocation("/");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  const contextValue = {
    user,
    doctorProfile,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };

  return React.createElement(AuthContext.Provider, { value: contextValue }, children);
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export { AuthProvider, useAuth };