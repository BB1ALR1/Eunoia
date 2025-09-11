import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { EyeIcon, EyeOffIcon, UserPlus, CheckCircle } from "lucide-react";

interface SignupPageProps {
  onSignupSuccess: () => void;
  onSwitchToLogin: () => void;
}

export default function SignupPage({ onSignupSuccess, onSwitchToLogin }: SignupPageProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();

  const signupMutation = useMutation({
    mutationFn: async (credentials: { username: string; email: string; password: string }) => {
      const response = await apiRequest("POST", "/api/auth/signup", credentials);
      return response.json();
    },
    onSuccess: (data) => {
      // Store token in localStorage
      localStorage.setItem("eunoia-auth-state", JSON.stringify({
        isLoggedIn: true,
        userId: data.id,
        username: data.username,
        email: data.email,
        token: data.token,
        timestamp: Date.now()
      }));
      
      toast({
        title: "Account Created!",
        description: data.message || "Welcome to Eunoia! You're now logged in.",
      });
      onSignupSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Signup Failed",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    signupMutation.mutate({ username: username.trim(), email: email.trim(), password });
  };

  const isPasswordValid = password.length >= 6;
  const doPasswordsMatch = password === confirmPassword && confirmPassword.length > 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>
            Join Eunoia and start your personalized mental health journey today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className={password.length > 0 ? (isPasswordValid ? "border-green-500" : "border-red-500") : ""}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {password.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  {isPasswordValid ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-green-600">Password strength: Good</span>
                    </>
                  ) : (
                    <span className="text-red-600">Password must be at least 6 characters</span>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className={confirmPassword.length > 0 ? (doPasswordsMatch ? "border-green-500" : "border-red-500") : ""}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOffIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {confirmPassword.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  {doPasswordsMatch ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-green-600">Passwords match</span>
                    </>
                  ) : (
                    <span className="text-red-600">Passwords do not match</span>
                  )}
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={signupMutation.isPending || !isPasswordValid || !doPasswordsMatch}
            >
              {signupMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Account...
                </div>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Button
                variant="link"
                className="p-0 h-auto font-semibold"
                onClick={onSwitchToLogin}
              >
                Sign In
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}