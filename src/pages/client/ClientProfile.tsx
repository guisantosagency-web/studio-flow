import { useEffect, useState } from 'react';
import { User, Phone, LogOut, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ClientBottomNav } from '@/components/client/ClientBottomNav';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface Profile {
  nome: string;
  sobrenome: string | null;
  whatsapp: string;
}

export default function ClientProfile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [appointmentCount, setAppointmentCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchAppointmentCount();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('nome, sobrenome, whatsapp')
      .eq('user_id', user?.id)
      .single();
    
    setProfile(data);
  };

  const fetchAppointmentCount = async () => {
    const { count } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user?.id);
    
    setAppointmentCount(count || 0);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const formatWhatsApp = (whatsapp: string) => {
    return whatsapp.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="relative overflow-hidden sidebar-gradient px-6 pt-12 pb-8">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-primary/30 rounded-full blur-2xl" />
          <div className="absolute bottom-5 right-10 w-40 h-40 bg-rose/30 rounded-full blur-2xl" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-rose flex items-center justify-center mb-4 shadow-glow-primary">
            <span className="text-4xl font-serif font-bold text-white">
              {profile?.nome?.charAt(0).toUpperCase() || 'C'}
            </span>
          </div>
          
          <h1 className="text-2xl font-serif font-bold text-white">
            {profile?.nome} {profile?.sobrenome}
          </h1>
          <p className="text-white/70 flex items-center gap-2 mt-2">
            <Phone className="w-4 h-4" />
            {profile?.whatsapp && formatWhatsApp(profile.whatsapp)}
          </p>
        </div>
      </div>
      
      {/* Stats */}
      <div className="px-4 -mt-6 relative z-10">
        <div className="neu-card">
          <div className="grid grid-cols-2 divide-x divide-border">
            <div className="text-center py-4">
              <p className="text-3xl font-bold text-gradient-primary">{appointmentCount}</p>
              <p className="text-sm text-muted-foreground">Agendamentos</p>
            </div>
            <div className="text-center py-4">
              <p className="text-3xl font-bold text-gradient-rose">💜</p>
              <p className="text-sm text-muted-foreground">Cliente VIP</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Menu Options */}
      <div className="px-4 py-6 space-y-3">
        <button className="w-full neu-card flex items-center justify-between p-4 hover:scale-[1.01] transition-transform">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <span className="font-medium text-foreground">Editar Perfil</span>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
        
        <button 
          onClick={handleSignOut}
          className="w-full neu-card flex items-center justify-between p-4 hover:scale-[1.01] transition-transform"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-rose/10 flex items-center justify-center">
              <LogOut className="w-5 h-5 text-rose" />
            </div>
            <span className="font-medium text-rose">Sair da Conta</span>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>
      
      {/* Footer */}
      <div className="px-4 py-6 text-center">
        <p className="text-sm text-muted-foreground">
          Luana Farias Studio © 2024
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Versão 1.0.0
        </p>
      </div>
      
      <ClientBottomNav />
    </div>
  );
}
