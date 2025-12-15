import { useEffect, useState } from 'react';
import { Bell, Calendar, CheckCircle, XCircle, Info } from 'lucide-react';
import { ClientBottomNav } from '@/components/client/ClientBottomNav';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'new' | 'confirmed' | 'reminder' | 'cancelled';
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export default function ClientNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    const { data } = await supabase
      .from('appointments')
      .select(`*, services (nome)`)
      .eq('user_id', user?.id)
      .order('criado_em', { ascending: false })
      .limit(20);

    if (data) {
      const notifs: Notification[] = data.map((apt) => ({
        id: apt.id,
        type: apt.status === 'confirmado' ? 'confirmed' : 
              apt.status === 'cancelado' ? 'cancelled' : 'new',
        title: apt.status === 'confirmado' ? 'Agendamento Confirmado' :
               apt.status === 'cancelado' ? 'Agendamento Cancelado' : 'Novo Agendamento',
        message: `${apt.services?.nome} - ${format(parseISO(apt.data), "d 'de' MMMM", { locale: ptBR })} às ${apt.hora}`,
        date: apt.criado_em,
        read: apt.status !== 'pendente',
      }));
      setNotifications(notifs);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-rose" />;
      case 'reminder':
        return <Bell className="w-5 h-5 text-primary" />;
      default:
        return <Calendar className="w-5 h-5 text-primary" />;
    }
  };

  const formatDate = (date: string) => {
    return format(parseISO(date), "d 'de' MMM, HH:mm", { locale: ptBR });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border p-4">
        <h1 className="text-xl font-serif font-bold text-foreground">Avisos</h1>
        <p className="text-sm text-muted-foreground">Suas notificações e lembretes</p>
      </div>
      
      {/* Notifications List */}
      <div className="p-4 space-y-3">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={cn(
              "neu-card transition-all duration-300",
              !notification.read && "border-l-4 border-l-primary"
            )}
          >
            <div className="flex items-start gap-4">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                notification.type === 'confirmed' && "bg-green-500/10",
                notification.type === 'cancelled' && "bg-rose/10",
                notification.type === 'new' && "bg-primary/10",
                notification.type === 'reminder' && "bg-primary/10"
              )}>
                {getIcon(notification.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-foreground">{notification.title}</h3>
                  {!notification.read && (
                    <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                <p className="text-xs text-muted-foreground mt-2">{formatDate(notification.date)}</p>
              </div>
            </div>
          </div>
        ))}
        
        {notifications.length === 0 && (
          <div className="neu-card text-center py-12">
            <Info className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhuma notificação</p>
            <p className="text-sm text-muted-foreground mt-1">
              Seus avisos aparecerão aqui
            </p>
          </div>
        )}
      </div>
      
      <ClientBottomNav />
    </div>
  );
}
