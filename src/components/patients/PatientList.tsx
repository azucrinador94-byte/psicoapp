import { useState } from 'react';
import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, Plus, Phone, Mail, Calendar, MoreVertical, Users, FileText, History, Edit2, Trash2 } from 'lucide-react';
import { Patient } from '@/types';

interface PatientListProps {
  patients: Patient[];
  onAddPatient: () => void;
  onEditPatient: (patient: Patient) => void;
  onDeletePatient: (patientId: number) => void;
  onOpenAnamnesis: (patient: Patient) => void;
  onOpenHistory: (patient: Patient) => void;
}

export function PatientList({ 
  patients, 
  onAddPatient, 
  onEditPatient, 
  onDeletePatient,
  onOpenAnamnesis,
  onOpenHistory 
}: PatientListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pacientes</h1>
          <p className="text-muted-foreground">Gerencie seus pacientes</p>
        </div>
        <Button onClick={onAddPatient} variant="gradient" className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Paciente
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4 mb-6 shadow-soft">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar pacientes por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Patient Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.map((patient) => (
          <Card key={patient.id} className="p-6 shadow-soft hover:shadow-medium transition-smooth">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-foreground">{patient.name}</h3>
                <Badge variant="secondary" className="mt-1">
                  {getAge(patient.birthDate)} anos
                </Badge>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEditPatient(patient)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Editar Dados
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onOpenAnamnesis(patient)}>
                    <FileText className="h-4 w-4 mr-2" />
                    Anamnese
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onOpenHistory(patient)}>
                    <History className="h-4 w-4 mr-2" />
                    Histórico de Consultas
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDeletePatient(patient.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{patient.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{patient.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Paciente desde {formatDate(patient.createdAt)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-border">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('🔥 BOTÃO ANAMNESE CLICADO! Paciente:', patient);
                  onOpenAnamnesis(patient);
                }}
              >
                <FileText className="h-4 w-4 mr-1" />
                Anamnese
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('🔥 BOTÃO HISTÓRICO CLICADO! Paciente:', patient);
                  onOpenHistory(patient);
                }}
              >
                <History className="h-4 w-4 mr-1" />
                Histórico
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredPatients.length === 0 && (
        <Card className="p-12 text-center shadow-soft">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {searchTerm ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm 
              ? 'Tente ajustar os termos da busca'
              : 'Comece adicionando seu primeiro paciente'
            }
          </p>
          {!searchTerm && (
            <Button onClick={onAddPatient} variant="gradient">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeiro Paciente
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}