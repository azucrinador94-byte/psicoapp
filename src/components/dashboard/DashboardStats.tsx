import { Card } from '@/components/ui/card';
import { Users, Calendar, TrendingUp, DollarSign } from 'lucide-react';
import { DashboardStats as Stats } from '@/types';

interface DashboardStatsProps {
  stats: Stats;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const cards = [
    {
      title: 'Total de Pacientes',
      value: stats.totalPatients,
      icon: Users,
      gradient: 'bg-gradient-primary',
      change: '+12%'
    },
    {
      title: 'Consultas Hoje',
      value: stats.todayAppointments,
      icon: Calendar,
      gradient: 'bg-gradient-secondary',
      change: '+5%'
    },
    {
      title: 'Consultas da Semana',
      value: stats.weeklyAppointments,
      icon: TrendingUp,
      gradient: 'bg-gradient-primary',
      change: '+8%'
    },
    {
      title: 'Receita Mensal',
      value: `R$ ${stats.monthlyRevenue.toLocaleString()}`,
      icon: DollarSign,
      gradient: 'bg-gradient-secondary',
      change: '+15%'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        
        return (
          <Card key={index} className="p-6 border-0 shadow-soft hover:shadow-medium transition-smooth">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">{card.title}</p>
                <p className="text-3xl font-bold text-foreground">{card.value}</p>
                <p className="text-sm text-secondary mt-1">{card.change} vs mês passado</p>
              </div>
              <div className={`w-12 h-12 rounded-lg ${card.gradient} flex items-center justify-center`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}