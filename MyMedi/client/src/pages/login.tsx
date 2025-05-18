import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

type UserType = "patient" | "doctor";
type PageType = "login" | "register";

const Login = () => {
  const [userType, setUserType] = useState<UserType>("patient");
  const [pageType, setPageType] = useState<PageType>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [licenseId, setLicenseId] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [phone, setPhone] = useState("");
  const { login, loading } = useAuth();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter your email and password.",
      });
      return;
    }
    
    if (userType === "doctor" && !licenseId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter your medical license ID.",
      });
      return;
    }
    
    try {
      await login(email, password, userType);
    } catch (error) {
      // Error toast is already shown in the login function
      console.error("Login failed:", error);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Passwords do not match.",
      });
      return;
    }

    if (userType === "doctor" && !licenseId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter your medical license ID.",
      });
      return;
    }

    // Registration would be implemented on the backend
    toast({
      title: "Registration Successful",
      description: "Account created! You can now log in.",
    });
    
    // Reset form and go to login page
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFirstName("");
    setLastName("");
    setLicenseId("");
    setSpecialty("");
    setPhone("");
    setPageType("login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-secondary/5">
      <Card className="max-w-md w-full shadow-lg border-t-4 border-t-primary">
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {pageType === "login" ? "Welcome to MyMedi" : "Join MyMedi"}
            </h2>
            <p className="text-muted-foreground mt-1">
              {pageType === "login" 
                ? "Your unified healthcare platform" 
                : "Create your account to get started"
              }
            </p>
          </div>
          
          {/* Toggle between Patient and Doctor */}
          <div className="flex mb-6 rounded-lg overflow-hidden border">
            <div 
              className={`flex-1 py-3 text-center transition-all duration-200 ${
                userType === "patient" 
                  ? "bg-primary text-white font-medium" 
                  : "bg-muted hover:bg-muted/80 cursor-pointer"
              }`}
              onClick={() => setUserType("patient")}
            >
              <div className="text-sm font-medium">Patient</div>
            </div>
            <div 
              className={`flex-1 py-3 text-center transition-all duration-200 ${
                userType === "doctor" 
                  ? "bg-primary text-white font-medium" 
                  : "bg-muted hover:bg-muted/80 cursor-pointer"
              }`}
              onClick={() => setUserType("doctor")}
            >
              <div className="text-sm font-medium">Doctor</div>
            </div>
          </div>
          
          {/* Login Form */}
          {pageType === "login" && (
            <div id="login-form" className="mt-6">
              <form onSubmit={handleLogin}>
                <div className="mb-4">
                  <Label htmlFor="email" className="block text-sm font-medium mb-1">Email</Label>
                  <Input 
                    type="email" 
                    id="email" 
                    placeholder={userType === "patient" ? "johndoe@example.com" : "dr.smith@example.com"} 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white"
                  />
                </div>
                <div className="mb-4">
                  <Label htmlFor="password" className="block text-sm font-medium mb-1">Password</Label>
                  <Input 
                    type="password" 
                    id="password" 
                    placeholder="••••••••" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white"
                  />
                  <div className="mt-1 text-sm text-right">
                    <a href="#" className="text-primary hover:text-primary/80">Forgot password?</a>
                  </div>
                </div>
                
                {userType === "doctor" && (
                  <div className="mb-6">
                    <Label htmlFor="doctor-id" className="block text-sm font-medium mb-1">Medical License ID</Label>
                    <Input 
                      type="text" 
                      id="doctor-id" 
                      placeholder="MED-12345" 
                      required
                      value={licenseId}
                      onChange={(e) => setLicenseId(e.target.value)}
                      className="bg-white"
                    />
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90" 
                  disabled={loading}
                >
                  {loading ? "Signing In..." : "Sign In"}
                </Button>
              </form>
              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">Don't have an account?</span>
                <button 
                  onClick={() => setPageType("register")}
                  className="text-primary hover:text-primary/80 font-medium ml-1"
                >
                  Register now
                </button>
              </div>
            </div>
          )}
          
          {/* Registration Form */}
          {pageType === "register" && (
            <div id="register-form" className="mt-6">
              <form onSubmit={handleRegister}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="first-name" className="block text-sm font-medium mb-1">First Name</Label>
                    <Input 
                      type="text" 
                      id="first-name" 
                      placeholder="John" 
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="last-name" className="block text-sm font-medium mb-1">Last Name</Label>
                    <Input 
                      type="text" 
                      id="last-name" 
                      placeholder="Doe" 
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="bg-white"
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <Label htmlFor="email" className="block text-sm font-medium mb-1">Email</Label>
                  <Input 
                    type="email" 
                    id="email" 
                    placeholder={userType === "patient" ? "johndoe@example.com" : "dr.smith@example.com"} 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white"
                  />
                </div>
                
                <div className="mb-4">
                  <Label htmlFor="phone" className="block text-sm font-medium mb-1">Phone Number</Label>
                  <Input 
                    type="tel" 
                    id="phone" 
                    placeholder="(123) 456-7890" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-white"
                  />
                </div>
                
                {userType === "doctor" && (
                  <>
                    <div className="mb-4">
                      <Label htmlFor="specialty" className="block text-sm font-medium mb-1">Specialty</Label>
                      <Input 
                        type="text" 
                        id="specialty" 
                        placeholder="Cardiology" 
                        required
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        className="bg-white"
                      />
                    </div>
                    <div className="mb-4">
                      <Label htmlFor="license-id" className="block text-sm font-medium mb-1">Medical License ID</Label>
                      <Input 
                        type="text" 
                        id="license-id" 
                        placeholder="MED-12345" 
                        required
                        value={licenseId}
                        onChange={(e) => setLicenseId(e.target.value)}
                        className="bg-white"
                      />
                    </div>
                  </>
                )}
                
                <div className="mb-4">
                  <Label htmlFor="password" className="block text-sm font-medium mb-1">Password</Label>
                  <Input 
                    type="password" 
                    id="password" 
                    placeholder="••••••••" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white"
                  />
                </div>
                
                <div className="mb-6">
                  <Label htmlFor="confirm-password" className="block text-sm font-medium mb-1">Confirm Password</Label>
                  <Input 
                    type="password" 
                    id="confirm-password" 
                    placeholder="••••••••" 
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-white"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90" 
                >
                  Create Account
                </Button>
              </form>
              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">Already have an account?</span>
                <button 
                  onClick={() => setPageType("login")}
                  className="text-primary hover:text-primary/80 font-medium ml-1"
                >
                  Log in
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
