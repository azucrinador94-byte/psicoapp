import { useEffect } from 'react';

interface ModalDebuggerProps {
  selectedPatientAnamnesis: any;
  selectedPatientHistory: any;
}

export function ModalDebugger({ selectedPatientAnamnesis, selectedPatientHistory }: ModalDebuggerProps) {
  useEffect(() => {
    console.log('🔍 ModalDebugger - Estado dos modals:', {
      selectedPatientAnamnesis: !!selectedPatientAnamnesis,
      selectedPatientHistory: !!selectedPatientHistory,
      anamnesisPatientName: selectedPatientAnamnesis?.name || 'nenhum',
      historyPatientName: selectedPatientHistory?.name || 'nenhum'
    });

    if (selectedPatientAnamnesis) {
      console.log('🔍 Modal de anamnese sendo renderizado para:', selectedPatientAnamnesis.name);
    }

    if (selectedPatientHistory) {
      console.log('🔍 Modal de histórico sendo renderizado para:', selectedPatientHistory.name);
    }
  }, [selectedPatientAnamnesis, selectedPatientHistory]);

  return null; // Este componente só faz debug, não renderiza nada
}