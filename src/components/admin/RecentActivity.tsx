import { Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Activity {
  id: string;
  type: 'new' | 'confirmed' | 'completed' | 'cancelled';
  clientName: string;
  service: string;
  time: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

const activityConfig = {
  new: { icon: Calendar, color: 'text-primary', bg: 'bg-primary/10', label: 'Novo' },
  confirmed: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10', label: 'Confirmado' },
  completed: { icon: CheckCircle, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Concluído' },
  cancelled: { icon: XCircle, color: 'text-rose', bg: 'bg-rose/10', label: 'Cancelado' },
};

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <div className="neu-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Atividade Recente</h3>
          <p className="text-sm text-muted-foreground">Últimas atualizações</p>
        </div>
        <button className="text-sm text-primary hover:underline">Ver tudo</button>
      </div>
      
      <div className="space-y-4">
        {activities.map((activity) => {
          const config = activityConfig[activity.type];
          const Icon = config.icon;
          
          return (
            <div 
              key={activity.id}
              className="flex items-start gap-4 p-3 rounded-2xl hover:bg-secondary/50 transition-colors duration-200"
            >
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", config.bg)}>
                <Icon className={cn("w-5 h-5", config.color)} />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{activity.clientName}</p>
                <p className="text-sm text-muted-foreground truncate">{activity.service}</p>
              </div>
              
              <div className="text-right flex-shrink-0">
                <span className={cn(
                  "text-xs font-medium px-2 py-1 rounded-lg",
                  config.bg, config.color
                )}>
                  {config.label}
                </span>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 justify-end">
                  <Clock className="w-3 h-3" />
                  {activity.time}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
