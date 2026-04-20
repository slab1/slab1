import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface Step {
  label: string;
  icon: React.ReactNode;
}

interface EventStepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export function EventStepIndicator({ steps, currentStep }: EventStepIndicatorProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <div key={index} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  'h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                  isCompleted && 'bg-primary border-primary text-primary-foreground',
                  isCurrent && 'border-primary bg-primary/10 text-primary',
                  !isCompleted && !isCurrent && 'border-muted-foreground/25 text-muted-foreground/50'
                )}
              >
                {isCompleted ? <Check className="h-5 w-5" /> : step.icon}
              </div>
              <span
                className={cn(
                  'text-[10px] font-medium text-center leading-tight max-w-[70px]',
                  isCurrent && 'text-primary',
                  isCompleted && 'text-primary/70',
                  !isCompleted && !isCurrent && 'text-muted-foreground/50'
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 mx-2 mt-[-18px]">
                <div
                  className={cn(
                    'h-0.5 rounded-full transition-all duration-500',
                    isCompleted ? 'bg-primary' : 'bg-muted-foreground/15'
                  )}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
