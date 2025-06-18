// Tipos de Status dos Bilhetes
export type StatusBilhete = 'ativo' | 'premiado' | 'expirado' | 'inativo';

// Interface do Bilhete
export interface Bilhete {
  id: string;
  numero: string;
  codigo: string;
  prefixo: string;
  status: StatusBilhete;
  valor?: number;
  dataCriacao: Date;
  dataExpiracao?: Date;
  dataValidacao?: Date;
}

// Interface para geração de bilhetes
export interface GerarBilhetesRequest {
  quantidade: number;
  prefixo: string;
  valor?: number;
  dataExpiracao?: Date;
}

// Interface para parâmetros de geração (usado nos testes)
export interface ParametrosGeracao {
  quantidade: number;
  prefixo: string;
  percentualPremiados?: number;
  valorMinimoPremio?: number;
  valorMaximoPremio?: number;
}

// Interface para validação de bilhetes
export interface ValidarBilheteRequest {
  codigo: string;
}

export interface ValidarBilheteResponse {
  valido: boolean;
  bilhete?: Bilhete;
  mensagem: string;
  tipo: 'sucesso' | 'erro' | 'aviso';
}

// Interface para filtros de listagem
export interface FiltrosBilhetes {
  status?: StatusBilhete;
  dataInicio?: Date;
  dataFim?: Date;
  prefixo?: string;
  codigo?: string;
}

// Alias para compatibilidade com testes antigos
export type FiltrosBilhete = FiltrosBilhetes;

// Interface para exportação
export interface ExportarBilhetesRequest {
  filtros?: FiltrosBilhetes;
  formato: 'csv' | 'pdf-zip';
}

// Tipos para roteamento
export type RotaAdmin = '/admin' | '/admin/gerar' | '/admin/listar';
export type RotaPublica = '/' | '/validar';

// Interface para resposta da API
export interface ApiResponse<T = any> {
  sucesso: boolean;
  dados?: T;
  mensagem?: string;
  erro?: string;
} 