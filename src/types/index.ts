// Tipos de Status dos Bilhetes (baseado na API real)
export type StatusBilhete = 'GERADO' | 'PREMIADO' | 'CANCELADO';

// Interface do Bilhete (baseado na API real)
export interface Bilhete {
  id: string;
  codigoUnico: string;
  numeroSequencial: string;
  qrCodeRef?: string;
  pdfUrl?: string;
  status: StatusBilhete;
  createdAt: string;
  updatedAt: string;
  dataResgate?: string;
  usuarioId?: string | null;
  usuario?: Usuario | null;
}

// Interface do Usuário
export interface Usuario {
  id: string;
  email: string;
  nome: string | null;
  role?: 'ADMIN' | 'USER';
}

// Interface para geração de lote de bilhetes (API real)
export interface GerarLoteRequest {
  quantidade: number;
  prefixo?: string;
}

export interface GerarLoteResponse {
  quantidade: number;
  prefixo: string;
}

// Interface para login
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: Usuario;
}

// Interface para criar usuário
export interface CriarUsuarioRequest {
  email: string;
  password: string;
  nome?: string;
  role?: 'ADMIN' | 'USER';
}

// Interface para validação de bilhetes (área pública)
export interface ValidarBilheteRequest {
  codigo: string;
}

export interface ValidarBilheteResponse {
  valido: boolean;
  bilhete?: Bilhete;
  mensagem: string;
  tipo: 'sucesso' | 'erro' | 'aviso';
}

// Interface para formulário de resgate (baseado na API real)
export interface FormularioResgateRequest {
  codigo: string;
  nomeCompleto: string;
  telefone: string;
  email: string;
  chavePix: string;
}

export interface ResgateResponse {
  sucesso: boolean;
  mensagem: string;
  bilhete: Bilhete;
  dataResgate: string;
}

// Interface para filtros de listagem (API real)
export interface FiltrosBilhetes {
  status?: StatusBilhete;
  dataInicio?: string; // formato: YYYY-MM-DD
  dataFim?: string;    // formato: YYYY-MM-DD
}

// Interface para informações do storage
export interface StorageInfo {
  bucketName: string;
  endpoint: string;
  connected: boolean;
}

// Interface para URL pré-assinada do PDF
export interface PdfUrlResponse {
  url: string;
  expiresIn: string;
}

// Interface para resposta de erro da API
export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
}

// Interface para resposta de validação
export interface ValidationErrorResponse {
  statusCode: number;
  message: string[];
  error: string;
}

// Tipos para roteamento
export type RotaAdmin = '/admin' | '/admin/gerar' | '/admin/listar';
export type RotaPublica = '/' | '/validar';

// Interface para resposta da API (genérica)
export interface ApiResponse<T = any> {
  sucesso: boolean;
  dados?: T;
  mensagem?: string;
  erro?: string;
}

// Alias para compatibilidade com código existente
export type FiltrosBilhete = FiltrosBilhetes;

// Interface para exportação (mantida para compatibilidade)
export interface ExportarBilhetesRequest {
  filtros?: FiltrosBilhetes;
  formato: 'csv' | 'pdf-zip';
}

// Interfaces legadas (manter para compatibilidade)
export interface GerarBilhetesRequest {
  quantidade: number;
  prefixo: string;
  valor?: number;
  dataExpiracao?: Date;
}

export interface ParametrosGeracao {
  quantidade: number;
  prefixo: string;
  percentualPremiados?: number;
  valorMinimoPremio?: number;
  valorMaximoPremio?: number;
} 