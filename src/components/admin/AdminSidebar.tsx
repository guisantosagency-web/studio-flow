import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Scissors, 
  Clock, 
  MessageSquare, 
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Overview', path: '/admin' },
  { icon: Calendar, label: 'Agendamentos', path: '/admin/appointments' },
  { icon: Users, label: 'Clientes', path: '/admin/clients' },
  { icon: Scissors, label: 'Serviços', path: '/admin/services' },
  { icon: Clock, label: 'Horários', path: '/admin/schedules' },
  { icon: MessageSquare, label: 'Mensagens', path: '/admin/messages' },
  { icon: Settings, label: 'Configurações', path: '/admin/settings' },
];

export function AdminSidebar() {
  const location = useLocation();
  const { signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside 
      className={cn(
        "hidden lg:flex flex-col h-screen sticky top-0 sidebar-gradient transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-rose flex items-center justify-center">
            <span className="text-white font-bold text-lg">L</span>
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="text-sidebar-foreground font-serif text-lg font-semibold">Luana Farias</h1>
              <p className="text-sidebar-foreground/60 text-xs">Studio</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300",
                isActive 
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-glow-primary" 
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border space-y-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full justify-center text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </Button>
        <Button
          variant="ghost"
          onClick={signOut}
          className={cn(
            "w-full text-sidebar-foreground/60 hover:text-rose hover:bg-rose/10",
            collapsed ? "justify-center" : "justify-start"
          )}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="ml-2">Sair</span>}
        </Button>
      </div>
    </aside>
  );
}
