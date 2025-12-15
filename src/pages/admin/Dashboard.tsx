import { useEffect, useState } from 'react';
import { Calendar, Users, DollarSign, TrendingUp } from 'lucide-react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { MobileNav } from '@/components/admin/MobileNav';
import { StatsCard } from '@/components/admin/StatsCard';
import { PerformanceChart } from '@/components/admin/PerformanceChart';
import { RecentActivity } from '@/components/admin/RecentActivity';
import { ProgressCircle } from '@/components/admin/ProgressCircle';
import { supabase } from '@/integrations/supabase/client';

const chartData = [
  { name: 'Jul', value: 45 },
  { name: 'Ago', value: 52 },
  { name: 'Set', value: 48 },
  { name: 'Out', value: 70 },
  { name: 'Nov', value: 65 },
  { name: 'Dez', value: 85 },
];

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalAppointments: 0,
    totalClients: 0,
    monthlyRevenue: 0,
    completionRate: 0,
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    // Fetch appointments count
    const { count: appointmentsCount } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true });

    // Fetch clients count
    const { count: clientsCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Fetch completed appointments for revenue
    const { data: completedAppointments } = await supabase
      .from('appointments')
      .select(`
        *,
        services (valor)
      `)
      .eq('status', 'concluido');

    const revenue = completedAppointments?.reduce((acc, apt) => {
      return acc + (apt.services?.valor || 0);
    }, 0) || 0;

    // Calculate completion rate
    const { count: completedCount } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'concluido');

    const rate = appointmentsCount ? Math.round((completedCount || 0) / appointmentsCount * 100) : 0;

    setStats({
      totalAppointments: appointmentsCount || 0,
      totalClients: clientsCount || 0,
      monthlyRevenue: revenue,
      completionRate: rate,
    });

    // Fetch recent appointments for activity feed
    const { data: recentAppointments } = await supabase
      .from('appointments')
      .select(`
        id,
        status,
        criado_em,
        profiles (nome),
        services (nome)
      `)
      .order('criado_em', { ascending: false })
      .limit(5);

    if (recentAppointments) {
      const activities = recentAppointments.map((apt) => ({
        id: apt.id,
        type: apt.status === 'pendente' ? 'new' : apt.status,
        clientName: apt.profiles?.nome || 'Cliente',
        service: apt.services?.nome || 'Serviço',
        time: new Date(apt.criado_em).toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
      }));
      setRecentActivities(activities);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        
        <main className="flex-1 p-4 lg:p-8 pb-24 lg:pb-8">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-serif font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Visão geral do seu negócio</p>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
            <StatsCard
              title="Agendamentos"
              value={stats.totalAppointments}
              subtitle="Total"
              icon={Calendar}
              variant="primary"
              trend={{ value: 12, isPositive: true }}
            />
            <StatsCard
              title="Clientes"
              value={stats.totalClients}
              subtitle="Cadastrados"
              icon={Users}
              trend={{ value: 8, isPositive: true }}
            />
            <StatsCard
              title="Receita"
              value={`R$ ${stats.monthlyRevenue.toFixed(0)}`}
              subtitle="Este mês"
              icon={DollarSign}
              variant="rose"
              trend={{ value: 15, isPositive: true }}
            />
            <StatsCard
              title="Crescimento"
              value="+24%"
              subtitle="vs mês anterior"
              icon={TrendingUp}
            />
          </div>
          
          {/* Charts & Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PerformanceChart data={chartData} />
            </div>
            <div>
              <ProgressCircle
                percentage={stats.completionRate}
                label="Taxa de Conclusão"
                sublabel="Agendamentos finalizados"
              />
            </div>
          </div>
          
          {/* Recent Activity */}
          <div className="mt-6">
            <RecentActivity activities={recentActivities} />
          </div>
        </main>
      </div>
      
      <MobileNav />
    </div>
  );
}
