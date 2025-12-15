import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Admin login uses email format
    const email = username.includes('@') ? username : `${username}@studio.local`;
    
    const { error } = await signIn(email, password);
    
    if (error) {
      toast.error('Credenciais inválidas');
      setIsLoading(false);
      return;
    }

    toast.success('Bem-vinda de volta!');
    navigate('/admin');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex animated-bg">
      {/* Left side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden sidebar-gradient">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-64 h-64 bg-primary/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-rose/30 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12">
          <div className="mb-8">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-rose flex items-center justify-center shadow-glow-primary animate-float">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl font-serif font-bold text-white mb-4 text-center">
            Luana Farias
          </h1>
          <p className="text-xl text-white/80 mb-2">Studio</p>
          <p className="text-white/60 text-center max-w-md">
            Painel administrativo para gerenciar agendamentos, clientes e serviços.
          </p>
        </div>
      </div>
      
      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-rose flex items-center justify-center mx-auto mb-4 shadow-glow-primary">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-foreground">Luana Farias Studio</h1>
          </div>
          
          <div className="neu-card">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
                Acesso Admin
              </h2>
              <p className="text-muted-foreground">
                Entre com suas credenciais
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Usuário</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="adminstudio"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                variant="gradient" 
                size="lg" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </div>
          
          <p className="text-center text-sm text-muted-foreground mt-6">
            Área restrita para administradores
          </p>
        </div>
      </div>
    </div>
  );
}
