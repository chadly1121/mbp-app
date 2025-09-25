import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Mail, Lock, User } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Turnstile } from '@marsidev/react-turnstile';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const { user, loading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Redirect authenticated users
  useEffect(() => {
    if (user && !loading) {
      navigate('/', { replace: true });
    }
  }, [user, loading, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await signIn(email, password);
    
    if (!error) {
      navigate('/');
    }
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!captchaToken) {
      alert('Please complete the CAPTCHA verification');
      return;
    }
    
    setIsLoading(true);
    
    await signUp(email, password, displayName);
    
    setIsLoading(false);
  };

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 md:mb-8">
          <div className="mx-auto w-12 h-12 md:w-16 md:h-16 bg-gradient-primary rounded-xl flex items-center justify-center mb-3 md:mb-4">
            <Building2 className="h-6 w-6 md:h-8 md:w-8 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">MBP SaaS</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1 md:mt-2">
            Monthly Business Planning & Analysis Platform
          </p>
        </div>

        <Card className="shadow-elevated border-0 bg-gradient-card">
          <CardHeader className="text-center pb-4 md:pb-6">
            <CardTitle className="text-xl md:text-2xl">Welcome</CardTitle>
            <CardDescription className="text-sm md:text-base">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-4 md:pb-6">
            <Tabs defaultValue="signin" className="space-y-4 md:space-y-6">
              <TabsList className="grid w-full grid-cols-2 h-9 md:h-10">
                <TabsTrigger value="signin" className="text-sm md:text-base">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="text-sm md:text-base">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-3 md:space-y-4">
                <form onSubmit={handleSignIn} className="space-y-3 md:space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2 text-sm">
                      <Mail className="h-3 w-3 md:h-4 md:w-4" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-background/50 h-10 md:h-11 text-sm md:text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="flex items-center gap-2 text-sm">
                      <Lock className="h-3 w-3 md:h-4 md:w-4" />
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-background/50 h-10 md:h-11 text-sm md:text-base"
                    />
                  </div>
                  <Button type="submit" className="w-full h-10 md:h-11 text-sm md:text-base" disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-3 md:space-y-4">
                <form onSubmit={handleSignUp} className="space-y-3 md:space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="flex items-center gap-2 text-sm">
                      <User className="h-3 w-3 md:h-4 md:w-4" />
                      Display Name
                    </Label>
                    <Input
                      id="displayName"
                      type="text"
                      placeholder="Enter your name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="bg-background/50 h-10 md:h-11 text-sm md:text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupEmail" className="flex items-center gap-2 text-sm">
                      <Mail className="h-3 w-3 md:h-4 md:w-4" />
                      Email
                    </Label>
                    <Input
                      id="signupEmail"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-background/50 h-10 md:h-11 text-sm md:text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupPassword" className="flex items-center gap-2 text-sm">
                      <Lock className="h-3 w-3 md:h-4 md:w-4" />
                      Password
                    </Label>
                    <Input
                      id="signupPassword"
                      type="password"
                      placeholder="Create a password (min 6 characters)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="bg-background/50 h-10 md:h-11 text-sm md:text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Security Verification</Label>
                    <Turnstile
                      siteKey="1x00000000000000000000AA"
                      onSuccess={(token) => setCaptchaToken(token)}
                      onError={() => setCaptchaToken('')}
                      onExpire={() => setCaptchaToken('')}
                      options={{
                        theme: 'auto',
                        size: 'normal'
                      }}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-10 md:h-11 text-sm md:text-base" 
                    disabled={isLoading || !captchaToken}
                  >
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;