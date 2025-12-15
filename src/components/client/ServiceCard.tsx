import { Clock, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServiceCardProps {
  id: string;
  nome: string;
  descricao?: string;
  duracao: number;
  valor?: number;
  exibirValor?: boolean;
  requerAnamnese?: boolean;
  selected?: boolean;
  onClick?: () => void;
}

export function ServiceCard({
  nome,
  descricao,
  duracao,
  valor,
  exibirValor = true,
  requerAnamnese = false,
  selected = false,
  onClick,
}: ServiceCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left service-card relative overflow-hidden group",
        selected && "ring-2 ring-primary shadow-glow-primary"
      )}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
      
      {requerAnamnese && (
        <div className="absolute top-4 right-4 flex items-center gap-1 text-xs bg-rose/10 text-rose px-2 py-1 rounded-lg">
          <Sparkles className="w-3 h-3" />
          <span>Anamnese</span>
        </div>
      )}
      
      <div className="relative z-10">
        <h3 className="text-xl font-serif font-semibold text-foreground mb-2 group-hover:text-gradient-primary transition-all">
          {nome}
        </h3>
        
        {descricao && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {descricao}
          </p>
        )}
        
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{duracao} min</span>
          </div>
          
          {exibirValor && valor && (
            <span className="text-lg font-bold text-gradient-primary">
              R$ {valor.toFixed(2)}
            </span>
          )}
        </div>
      </div>
      
      {/* Selection indicator */}
      {selected && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-rose" />
      )}
    </button>
  );
}
