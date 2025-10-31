import { useState } from "react";
import { Grid3x3, User, FileText, AlertCircle, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { authService } from "@/services/authService";
import type { UserData } from "@/types";

interface WelcomePageProps {
  onLogin: (userData: UserData) => void;
}

export function WelcomePage({ onLogin }: WelcomePageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [recaptchaVerified, setRecaptchaVerified] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Autenticación con Google - modo Login (directo)
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    // Aquí se integraría con Google OAuth para login directo
    // Ejemplo: const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google' })
    
    setTimeout(() => {
      setIsLoading(false);
      // Login directo sin requerir username/bio
      onLogin({
        username: "Usuario Google",
        bio: "Perfil de Google",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=google${Date.now()}`,
      });
    }, 1500);
  };

  // Autenticación con Google - modo Register (requiere perfil)
  const handleGoogleRegister = async () => {
    setIsLoading(true);
    // Aquí se integraría con Google OAuth para registro
    // Ejemplo: const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google' })
    
    setTimeout(() => {
      setIsLoading(false);
      // Mostrar formulario de configuración de perfil
      setShowProfileSetup(true);
    }, 1500);
  };

  // Login con email/contraseña (directo, sin perfil)
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      alert("Por favor, completa todos los campos");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.login({ email, password });
      onLogin({
        username: response.data.username,
        email: response.data.email,
        bio: response.data.bio,
        avatar: response.data.avatar,
      });
    } catch (error: any) {
      alert(error.response?.data?.message || "Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  // Registro con email/contraseña (requiere perfil)
  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      alert("Por favor, completa todos los campos");
      return;
    }

    if (password.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setIsLoading(true);
    // Mostrar formulario de configuración de perfil
    setShowProfileSetup(true);
    setIsLoading(false);
  };

  // Completar configuración de perfil (username y bio)
  const handleCompleteProfileSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recaptchaVerified) {
      alert("Por favor, verifica el reCAPTCHA");
      return;
    }

    if (!username.trim() || !bio.trim()) {
      alert("Por favor, completa todos los campos");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.register({
        username: username.trim(),
        email,
        password,
        bio: bio.trim(),
      });
      onLogin({
        username: response.data.username,
        email: response.data.email,
        bio: response.data.bio,
        avatar: response.data.avatar,
      });
    } catch (error: any) {
      alert(error.response?.data?.message || "Error al registrar usuario");
    } finally {
      setIsLoading(false);
    }
  };

  // Simular verificación de reCAPTCHA
  const handleRecaptchaVerify = () => {
    // Aquí se integraría con Google reCAPTCHA v3
    // Ejemplo: grecaptcha.execute('YOUR_SITE_KEY', {action: 'submit'})
    setRecaptchaVerified(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-md mx-auto">
          {/* Logo y Título */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                <Grid3x3 className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="mb-2">InstaGur</h1>
            <p className="text-muted-foreground">
              Comparte y transforma tus imágenes con IA
            </p>
          </div>

          {/* Card de Autenticación */}
          <Card>
            <CardHeader>
              <CardTitle>Bienvenido</CardTitle>
              <CardDescription>
                {showProfileSetup 
                  ? "Completa tu perfil para comenzar" 
                  : "Inicia sesión o crea una cuenta nueva"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!showProfileSetup ? (
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                    <TabsTrigger value="register">Registrarse</TabsTrigger>
                  </TabsList>
                  
                  {/* Tab de Inicio de Sesión */}
                  <TabsContent value="login" className="space-y-4 mt-4">
                    {/* Google Login Button */}
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleGoogleLogin}
                      disabled={isLoading}
                    >
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      {isLoading ? "Conectando..." : "Iniciar con Google"}
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <Separator />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                          O continuar con
                        </span>
                      </div>
                    </div>

                    {/* Email/Password Login Form */}
                    <form onSubmit={handleEmailLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email">Correo Electrónico</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="login-email"
                            type="email"
                            placeholder="tu@email.com"
                            className="pl-10"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="login-password">Contraseña</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="login-password"
                            type="password"
                            placeholder="••••••••"
                            className="pl-10"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                      </Button>
                    </form>
                  </TabsContent>

                  {/* Tab de Registro */}
                  <TabsContent value="register" className="space-y-4 mt-4">
                    {/* Google Register Button */}
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleGoogleRegister}
                      disabled={isLoading}
                    >
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      {isLoading ? "Conectando..." : "Registrarse con Google"}
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <Separator />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                          O registrarse con
                        </span>
                      </div>
                    </div>

                    {/* Email/Password Register Form */}
                    <form onSubmit={handleEmailRegister} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-email">Correo Electrónico</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="register-email"
                            type="email"
                            placeholder="tu@email.com"
                            className="pl-10"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="register-password">Contraseña</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="register-password"
                            type="password"
                            placeholder="••••••••"
                            className="pl-10"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Mínimo 6 caracteres
                        </p>
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
                      </Button>
                    </form>
                  </TabsContent>

                  {/* Información sobre integración */}
                  <Alert className="mt-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      <strong>Nota de integración:</strong> Esta aplicación está preparada para 
                      integrar Google OAuth y reCAPTCHA v3. En producción, se conectará con 
                      Supabase Auth para autenticación segura.
                    </AlertDescription>
                  </Alert>
                </Tabs>
              ) : (
                <form onSubmit={handleCompleteProfileSetup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Nombre de Usuario</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="username"
                        type="text"
                        placeholder="tu_usuario"
                        className="pl-10"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Biografía</Label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Textarea
                        id="bio"
                        placeholder="Cuéntanos un poco sobre ti..."
                        className="pl-10 min-h-[100px]"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Simulación de reCAPTCHA */}
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="recaptcha-register"
                        className="h-5 w-5"
                        onChange={handleRecaptchaVerify}
                      />
                      <label htmlFor="recaptcha-register" className="text-sm">
                        No soy un robot (reCAPTCHA simulado)
                      </label>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || !recaptchaVerified}
                  >
                    {isLoading ? "Completando registro..." : "Completar Registro"}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      setShowProfileSetup(false);
                      setEmail("");
                      setPassword("");
                      setUsername("");
                      setBio("");
                    }}
                  >
                    Volver
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            Al continuar, aceptas nuestros Términos de Servicio y Política de Privacidad
          </p>
        </div>
      </div>
    </div>
  );
}
