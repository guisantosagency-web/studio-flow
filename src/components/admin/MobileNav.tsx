import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Scissors, 
  Settings 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const mobileMenuItems = [
  { icon: LayoutDashboard, label: 'Home', path: '/admin' },
  { icon: Calendar, label: 'Agenda', path: '/admin/appointments' },
  { icon: Users, label: 'Clientes', path: '/admin/clients' },
  { icon: Scissors, label: 'Serviços', path: '/admin/services' },
  { icon: Settings, label: 'Config', path: '/admin/settings' },
];

export function MobileNav() {
  const location = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border shadow-neu">
      <div className="flex items-center justify-around py-2 px-2">
        {mobileMenuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-300",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive && "animate-scale-in")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
