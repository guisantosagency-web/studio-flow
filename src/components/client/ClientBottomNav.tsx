import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, Bell, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Home, label: 'Início', path: '/client' },
  { icon: Calendar, label: 'Agendar', path: '/client/book' },
  { icon: Bell, label: 'Avisos', path: '/client/notifications' },
  { icon: User, label: 'Perfil', path: '/client/profile' },
];

export function ClientBottomNav() {
  const location = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border">
      <div className="flex items-center justify-around py-3 px-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path === '/client/book' && location.pathname.startsWith('/client/book'));
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all duration-300",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "p-2 rounded-xl transition-all duration-300",
                isActive && "bg-primary/10 shadow-glow-primary"
              )}>
                <item.icon className={cn("w-5 h-5", isActive && "animate-scale-in")} />
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
