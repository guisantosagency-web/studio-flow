import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ClientBottomNav } from '@/components/client/ClientBottomNav';
import { AppointmentCard } from '@/components/client/AppointmentCard';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Appointment {
  id: string;
  data: string;
  hora: string;
  status: 'pendente' | 'confirmado' | 'concluido' | 'cancelado';
  services: { nome: string } | null;
}

export default function ClientHome() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ nome: string } | null>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [pastAppointments, setPastAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchAppointments();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('nome')
      .eq('user_id', user?.id)
      .single();
    
    setProfile(data);
  };

  const fetchAppointments = async () => {
    const today = format(new Date(), 'yyyy-MM-dd');

    // Upcoming appointments
    const { data: upcoming } = await supabase
      .from('appointments')
      .select(`*, services (nome)`)
      .eq('user_id', user?.id)
      .gte('data', today)
      .in('status', ['pendente', 'confirmado'])
      .order('data')
      .order('hora')
      .limit(3);

    // Past appointments
    const { data: past } = await supabase
      .from('appointments')
      .select(`*, services (nome)`)
      .eq('user_id', user?.id)
      .or(`data.lt.${today},status.eq.concluido,status.eq.cancelado`)
      .order('data', { ascending: false })
      .limit(3);

    setUpcomingAppointments(upcoming || []);
    setPastAppointments(past || []);
  };

  const formatDate = (date: string) => {
    return format(parseISO(date), "d 'de' MMMM", { locale: ptBR });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="relative overflow-hidden sidebar-gradient px-6 pt-12 pb-8">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-primary/30 rounded-full blur-2xl" />
          <div className="absolute bottom-5 right-10 w-40 h-40 bg-rose/30 rounded-full blur-2xl" />
        </div>
        
        <div className="relative z-10">
          <p className="text-white/70 mb-1">Olá,</p>
          <h1 className="text-2xl font-serif font-bold text-white mb-6">
            {profile?.nome || 'Cliente'}! 👋
          </h1>
          
          <Link to="/client/book">
            <Button variant="gradient-rose" size="lg" className="w-full justify-between">
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Agendar Serviço
              </span>
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Content */}
      <div className="px-4 py-6 space-y-8">
        {/* Upcoming Appointments */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Próximos Agendamentos</h2>
            <Link to="/client/appointments" className="text-sm text-primary">
              Ver todos
            </Link>
          </div>
          
          {upcomingAppointments.length > 0 ? (
            <div className="space-y-4">
              {upcomingAppointments.map((apt) => (
                <AppointmentCard
                  key={apt.id}
                  id={apt.id}
                  serviceName={apt.services?.nome || 'Serviço'}
                  date={formatDate(apt.data)}
                  time={apt.hora}
                  status={apt.status}
                />
              ))}
            </div>
          ) : (
            <div className="neu-card text-center py-8">
              <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">Nenhum agendamento futuro</p>
              <Link to="/client/book">
                <Button variant="gradient" size="sm">
                  Agendar Agora
                </Button>
              </Link>
            </div>
          )}
        </section>
        
        {/* Quick Actions */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">Acesso Rápido</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <Link to="/client/book" className="neu-card p-4 text-center hover:scale-[1.02] transition-transform">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <p className="font-medium text-foreground">Agendar</p>
            </Link>
            
            <Link to="/client/notifications" className="neu-card p-4 text-center hover:scale-[1.02] transition-transform">
              <div className="w-12 h-12 rounded-2xl bg-rose/10 flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-rose" />
              </div>
              <p className="font-medium text-foreground">Histórico</p>
            </Link>
          </div>
        </section>
        
        {/* Past Appointments */}
        {pastAppointments.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4">Histórico</h2>
            
            <div className="space-y-4">
              {pastAppointments.map((apt) => (
                <AppointmentCard
                  key={apt.id}
                  id={apt.id}
                  serviceName={apt.services?.nome || 'Serviço'}
                  date={formatDate(apt.data)}
                  time={apt.hora}
                  status={apt.status}
                />
              ))}
            </div>
          </section>
        )}
      </div>
      
      <ClientBottomNav />
    </div>
  );
}
