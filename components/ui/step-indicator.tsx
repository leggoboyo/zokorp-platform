import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StepItem = {
  id: string;
  title: string;
  description?: string;
};

type StepIndicatorProps = {
  currentStep: number;
  items: StepItem[];
  className?: string;
};

export function StepIndicator({ currentStep, items, className }: StepIndicatorProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {items.map((item, index) => {
        const isActive = index === currentStep;
        const isComplete = index < currentStep;

        return (
          <Badge
            key={item.id}
            variant={isActive ? "brand" : isComplete ? "success" : "secondary"}
            className="gap-2 px-3 py-1.5 normal-case tracking-normal"
            title={item.description}
          >
            <span className="font-mono text-[11px]">{`${index + 1}`.padStart(2, "0")}</span>
            <span>{item.title}</span>
          </Badge>
        );
      })}
    </div>
  );
}
