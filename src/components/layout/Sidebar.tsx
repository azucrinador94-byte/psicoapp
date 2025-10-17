import { Home, Users, Calendar, Settings, Activity, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import logo from '@/assets/logo.png';
import { useState, useEffect } from 'react';
import { isBackendAvailable } from '@/services/api';
import { Badge } from '@/components/ui/badge';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navigation = [
  { id: 'dashboard', name: 'Dashboard', icon: Home },
  { id: 'patients', name: 'Pacientes', icon: Users },
  { id: 'calendar', name: 'Agenda', icon: Calendar },
  { id: 'reports', name: 'Relatórios', icon: Activity },
  { id: 'settings', name: 'Configurações', icon: Settings },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [backendStatus, setBackendStatus] = useState<boolean | null>(null);

  useEffect(() => {
    isBackendAvailable().then(setBackendStatus);
    
    // Verificar a cada 30 segundos
    const interval = setInterval(() => {
      isBackendAvailable().then(setBackendStatus);
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-card border-r border-border w-64 flex flex-col shadow-soft">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-gradient-primary">
            <img src={logo} alt="PsicoApp" className="w-8 h-8 object-contain" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">PsicoApp</h1>
            <p className="text-sm text-muted-foreground">Gestão Psicológica</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {/* Indicador de Modo Offline */}
        {backendStatus === false && (
          <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded">
            <div className="flex items-center gap-2">
              <WifiOff className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-xs font-medium text-yellow-800">Modo Offline</p>
                <p className="text-xs text-yellow-700">Dados salvos localmente</p>
              </div>
            </div>
          </div>
        )}
        
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-smooth hover:bg-accent",
                isActive 
                  ? "bg-gradient-primary text-primary-foreground shadow-soft" 
                  : "text-foreground hover:text-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
          <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
            <span className="text-secondary-foreground font-medium text-sm">DR</span>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Dr. Silva</p>
            <p className="text-xs text-muted-foreground">CRP 12345</p>
          </div>
        </div>
      </div>
    </div>
  );
}