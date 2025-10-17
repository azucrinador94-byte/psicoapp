# PsicoApp - Guia de Instalação

## Para Instalação Completa (Primeira Vez)

1. **Execute o script principal do banco:**
   ```sql
   source database/setup.sql
   ```

## Para Atualizar uma Instalação Existente

Se você já tem o PsicoApp instalado e está recebendo erros sobre colunas não encontradas, execute:

1. **Execute o script de migração:**
   ```sql
   source database/migration.sql
   ```

## Verificação do Sistema

Após a instalação/atualização, acesse o sistema:
- URL: `http://localhost/psicoapp`
- Faça login com suas credenciais
- Verifique se o dashboard carrega sem erros

## Funcionalidades Disponíveis

✅ **Sistema de Autenticação**
- Login/Registro de psicólogos
- Sessões seguras

✅ **Gestão de Pacientes**
- Cadastro de pacientes
- Anamnese completa
- Histórico de consultas

✅ **Sistema de Agendamento**
- Agenda de consultas
- Controle de status (agendado/concluído/cancelado)
- Duração personalizada

✅ **Sistema Financeiro**
- Preços por paciente
- Controle de receita mensal
- Valores por consulta

✅ **Relatórios e Estatísticas**
- Dashboard com métricas
- Consultas do dia/semana/mês
- Receita mensal

✅ **Histórico de Consultas**
- Notas de sessão
- Humor do paciente
- Tarefas de casa
- Objetivos da próxima sessão

## Estrutura do Banco de Dados

- `users` - Psicólogos cadastrados
- `patients` - Pacientes
- `appointments` - Agendamentos/Consultas
- `patient_pricing` - Preços personalizados por paciente
- `patient_anamnesis` - Dados de anamnese
- `consultation_history` - Histórico detalhado das sessões

## Resolução de Problemas

### Erro: "Column 'amount' not found"
Execute o script de migração: `database/migration.sql`

### Erro: "Table doesn't exist"
Execute o script completo: `database/setup.sql`

### Problemas de Permissão
Verifique se o PHP tem permissão de escrita no diretório do projeto.

## Status de Produção

✅ Sistema pronto para produção
✅ Todas as funcionalidades integradas
✅ Tratamento de erros implementado
✅ Validação de dados
✅ Segurança de sessões