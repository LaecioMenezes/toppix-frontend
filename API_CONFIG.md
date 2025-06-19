# Configuração da API - Top Pix

## Problema Identificado

A URL da API estava sendo concatenada incorretamente, misturando a URL do projeto com a variável de ambiente `VITE_API_URL`.

## Solução Implementada

### 1. Correção da Lógica de URL Base

```typescript
// ANTES (problemático):
const API_BASE_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.DEV ? '/api' : 'http://localhost:3000'
);

// DEPOIS (corrigido):
const API_BASE_URL = import.meta.env.VITE_API_URL ? 
  import.meta.env.VITE_API_URL.replace(/\/$/, '') : // Remove trailing slash se existir
  (import.meta.env.DEV ? '/api' : 'http://localhost:3000');
```

### 2. Normalização de Endpoints

```typescript
// Garantir que o endpoint comece com /
const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
const url = `${API_BASE_URL}${normalizedEndpoint}`;
```

### 3. Logs de Debug

Adicionados logs detalhados para identificar problemas de configuração:

```typescript
console.log('🔧 API Configuration:', {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  API_BASE_URL,
  endpoint: normalizedEndpoint,
  finalUrl: url
});
```

## Como Configurar

### Para Produção

1. **Criar arquivo `.env` na raiz do projeto:**

```bash
# .env
VITE_API_URL=https://sua-api-backend.com
```

2. **Exemplos de configuração:**

```bash
# Produção
VITE_API_URL=https://api.toppix.jaynaalimentos.com.br

# Staging
VITE_API_URL=https://staging-api.toppix.jaynaalimentos.com.br

# Desenvolvimento local
VITE_API_URL=http://localhost:3000
```

### Para Deploy (Vercel/Netlify)

Configure a variável de ambiente na plataforma:

- **Nome**: `VITE_API_URL`
- **Valor**: `https://sua-api-backend.com`

## Verificação

1. **No console do navegador**, você verá logs como:

```
🔧 API Configuration: {
  VITE_API_URL: "https://sua-api-backend.com",
  API_BASE_URL: "https://sua-api-backend.com",
  endpoint: "/auth/login",
  finalUrl: "https://sua-api-backend.com/auth/login"
}
```

2. **URLs corretas esperadas:**
   - ✅ `https://sua-api-backend.com/auth/login`
   - ✅ `https://sua-api-backend.com/bilhetes/gerar-lote`
   - ❌ `https://toppix.jaynaalimentos.com.br/promo.zynko.io/auth/login` (incorreto)

## Importante

- **Sempre** defina `VITE_API_URL` sem trailing slash (`/`)
- **Nunca** inclua paths como `/api` na variável de ambiente
- **Sempre** use HTTPS em produção

## Troubleshooting

Se ainda estiver concatenando URLs incorretamente:

1. Verifique se a variável `VITE_API_URL` está definida corretamente
2. Reinicie o servidor de desenvolvimento: `npm run dev`
3. Para produção, faça novo build: `npm run build`
4. Verifique os logs no console do navegador 