import { Calendar, Clock, MapPin, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AppointmentCardProps {
  id: string;
  serviceName: string;
  date: string;
  time: string;
  status: 'pendente' | 'confirmado' | 'concluido' | 'cancelado';
  onReschedule?: () => void;
  onCancel?: () => void;
}

const statusConfig = {
  pendente: { label: 'Pendente', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  confirmado: { label: 'Confirmado', color: 'bg-green-500/10 text-green-600 border-green-500/30' },
  concluido: { label: 'Concluído', color: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  cancelado: { label: 'Cancelado', color: 'bg-rose/10 text-rose border-rose/30' },
};

export function AppointmentCard({
  serviceName,
  date,
  time,
  status,
  onReschedule,
  onCancel,
}: AppointmentCardProps) {
  const config = statusConfig[status];
  const isPast = status === 'concluido' || status === 'cancelado';

  return (
    <div className={cn(
      "neu-card relative overflow-hidden transition-all duration-300",
      isPast && "opacity-70"
    )}>
      {/* Status indicator line */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-1",
        status === 'confirmado' && "bg-gradient-to-r from-green-400 to-green-500",
        status === 'pendente' && "bg-gradient-to-r from-yellow-400 to-yellow-500",
        status === 'concluido' && "bg-gradient-to-r from-blue-400 to-blue-500",
        status === 'cancelado' && "bg-gradient-to-r from-rose to-rose-dark"
      )} />
      
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <span className={cn(
              "text-xs font-medium px-3 py-1 rounded-full border",
              config.color
            )}>
              {config.label}
            </span>
          </div>
          
          <h3 className="text-lg font-semibold text-foreground mb-3">
            {serviceName}
          </h3>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4 text-primary" />
              <span>{date}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4 text-primary" />
              <span>{time}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 text-primary" />
              <span>Luana Farias Studio</span>
            </div>
          </div>
        </div>
        
        {!isPast && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="flex-shrink-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="neu-card border-0 p-2">
              <DropdownMenuItem 
                onClick={onReschedule}
                className="rounded-xl cursor-pointer"
              >
                Reagendar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={onCancel}
                className="rounded-xl cursor-pointer text-rose focus:text-rose"
              >
                Cancelar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
