import { Card } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface ReportCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
}

export function ReportCard({ title, value, icon: Icon, description }: ReportCardProps) {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="p-3 bg-primary/10 rounded-lg">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </Card>
  );
}
