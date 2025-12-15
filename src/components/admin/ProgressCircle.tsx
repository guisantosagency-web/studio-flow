import { cn } from '@/lib/utils';

interface ProgressCircleProps {
  percentage: number;
  label: string;
  sublabel?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ProgressCircle({ 
  percentage, 
  label, 
  sublabel,
  size = 'md',
  className 
}: ProgressCircleProps) {
  const sizes = {
    sm: { width: 100, stroke: 6, fontSize: 'text-xl' },
    md: { width: 140, stroke: 8, fontSize: 'text-3xl' },
    lg: { width: 180, stroke: 10, fontSize: 'text-4xl' },
  };
  
  const { width, stroke, fontSize } = sizes[size];
  const radius = (width - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn("neu-card flex flex-col items-center justify-center p-6", className)}>
      <div className="relative" style={{ width, height: width }}>
        <svg width={width} height={width}>
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(252, 72%, 62%)" />
              <stop offset="100%" stopColor="hsl(350, 80%, 72%)" />
            </linearGradient>
          </defs>
          
          {/* Background circle */}
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={stroke}
          />
          
          {/* Progress circle */}
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transform: 'rotate(-90deg)',
              transformOrigin: 'center',
              transition: 'stroke-dashoffset 1s ease-in-out',
            }}
          />
        </svg>
        
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-bold text-gradient-primary", fontSize)}>
            {percentage}%
          </span>
        </div>
      </div>
      
      <p className="text-foreground font-semibold mt-4">{label}</p>
      {sublabel && (
        <p className="text-sm text-muted-foreground">{sublabel}</p>
      )}
    </div>
  );
}
