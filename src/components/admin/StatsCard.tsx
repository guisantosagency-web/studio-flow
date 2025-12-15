import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'rose';
  className?: string;
}

export function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  variant = 'default',
  className 
}: StatsCardProps) {
  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:scale-[1.02]",
        variant === 'primary' && "stats-card text-white",
        variant === 'rose' && "bg-gradient-to-br from-rose to-rose-dark text-white",
        variant === 'default' && "neu-card",
        className
      )}
    >
      {/* Background decoration */}
      {variant !== 'default' && (
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/20" />
          <div className="absolute -bottom-5 -left-5 w-20 h-20 rounded-full bg-white/10" />
        </div>
      )}
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div 
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center",
              variant === 'default' 
                ? "bg-primary/10 text-primary" 
                : "bg-white/20 text-white"
            )}
          >
            <Icon className="w-6 h-6" />
          </div>
          
          {trend && (
            <span 
              className={cn(
                "text-sm font-medium px-2 py-1 rounded-lg",
                trend.isPositive 
                  ? "bg-green-500/20 text-green-600" 
                  : "bg-red-500/20 text-red-600",
                variant !== 'default' && "bg-white/20 text-white"
              )}
            >
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
          )}
        </div>
        
        <p className={cn(
          "text-sm font-medium mb-1",
          variant === 'default' ? "text-muted-foreground" : "text-white/80"
        )}>
          {title}
        </p>
        
        <p className={cn(
          "text-3xl font-bold font-serif",
          variant === 'default' ? "text-foreground" : "text-white"
        )}>
          {value}
        </p>
        
        {subtitle && (
          <p className={cn(
            "text-xs mt-1",
            variant === 'default' ? "text-muted-foreground" : "text-white/60"
          )}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
