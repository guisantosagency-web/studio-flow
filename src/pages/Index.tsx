import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';

export default function Index() {
  const { user, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) {
      if (isAdmin) {
        navigate('/admin');
      } else {
        navigate('/client');
      }
    }
  }, [user, isAdmin, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-rose flex items-center justify-center animate-pulse">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col animated-bg overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 -left-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-rose/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Logo */}
        <div className="mb-8 animate-float">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-rose flex items-center justify-center shadow-glow-primary">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
        </div>
        
        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground text-center mb-4 animate-fade-in">
          Luana Farias
        </h1>
        <p className="text-xl text-gradient-primary font-medium mb-2 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          Studio
        </p>
        <p className="text-muted-foreground text-center max-w-sm mb-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          Design de sobrancelhas e cuidados com a beleza em um ambiente acolhedor e profissional.
        </p>
        
        {/* CTA Buttons */}
        <div className="w-full max-w-sm space-y-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <Link to="/login" className="block">
            <Button variant="gradient-rose" size="xl" className="w-full">
              <Calendar className="w-5 h-5 mr-2" />
              Agendar Horário
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          
          <Link to="/login" className="block">
            <Button variant="neu" size="lg" className="w-full">
              Já tenho conta
            </Button>
          </Link>
        </div>
        
        {/* Features */}
        <div className="mt-16 grid grid-cols-3 gap-6 w-full max-w-md animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">Agendamento Online</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose/10 flex items-center justify-center mx-auto mb-2">
              <Sparkles className="w-6 h-6 text-rose" />
            </div>
            <p className="text-xs text-muted-foreground">Serviços Premium</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <span className="text-lg">💜</span>
            </div>
            <p className="text-xs text-muted-foreground">Atendimento VIP</p>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="relative z-10 py-6 text-center">
        <p className="text-sm text-muted-foreground">
          © 2024 Luana Farias Studio. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}
