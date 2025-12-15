import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Phone, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

export default function ClientLogin() {
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [nome, setNome] = useState('');
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const formatWhatsApp = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const cleanWhatsapp = whatsapp.replace(/\D/g, '');
    const email = `${cleanWhatsapp}@whatsapp.local`;

    if (isSignUp) {
      if (!nome.trim()) {
        toast.error('Por favor, informe seu nome');
        setIsLoading(false);
        return;
      }
      
      const { error } = await signUp(email, password, { nome, whatsapp: cleanWhatsapp });
      
      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('Este WhatsApp já está cadastrado');
        } else {
          toast.error('Erro ao criar conta');
        }
        setIsLoading(false);
        return;
      }

      toast.success('Conta criada com sucesso!');
      navigate('/client');
    } else {
      const { error } = await signIn(email, password);
      
      if (error) {
        toast.error('WhatsApp ou senha incorretos');
        setIsLoading(false);
        return;
      }

      toast.success('Bem-vinda!');
      navigate('/client');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row animated-bg">
      {/* Decorative header for mobile */}
      <div className="lg:hidden relative overflow-hidden sidebar-gradient py-12 px-6">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-primary/30 rounded-full blur-2xl" />
          <div className="absolute bottom-5 right-10 w-40 h-40 bg-rose/30 rounded-full blur-2xl" />
        </div>
        
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-rose flex items-center justify-center mx-auto mb-4 shadow-glow-primary">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-white">Luana Farias</h1>
          <p className="text-white/80">Studio</p>
        </div>
      </div>
      
      {/* Left side - Decorative (desktop) */}
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
            Agende seus serviços de forma rápida e prática usando seu WhatsApp.
          </p>
        </div>
      </div>
      
      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-8">
        <div className="w-full max-w-md">
          <div className="neu-card">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
                {isSignUp ? 'Criar Conta' : 'Entrar'}
              </h2>
              <p className="text-muted-foreground">
                Seu login é o seu número de WhatsApp
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {isSignUp && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Nome</label>
                  <Input
                    type="text"
                    placeholder="Seu nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required={isSignUp}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">WhatsApp</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(formatWhatsApp(e.target.value))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Senha</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                    required
                    minLength={6}
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
                variant="gradient-rose" 
                size="lg" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Aguarde...' : (isSignUp ? 'Criar Conta' : 'Entrar')}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-primary hover:underline"
              >
                {isSignUp ? 'Já tem conta? Entrar' : 'Não tem conta? Cadastre-se'}
              </button>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <Link to="/admin/login" className="text-sm text-muted-foreground hover:text-foreground">
              Acesso administrativo →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
