# 🔧 Configuração de CORS - Backend NestJS

## Problema
Erro de CORS ao fazer requisições do frontend (localhost:5173) para o backend NestJS (localhost:3000).

## Soluções Implementadas no Frontend

### 1. Proxy do Vite (Recomendado para Desenvolvimento)
```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
      secure: false,
      rewrite: (path) => path.replace(/^\/api/, ''),
    },
  },
}
```

### 2. Configuração da API
```typescript
// src/services/apiService.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.DEV ? '/api' : 'http://localhost:3000'
);

// Configurações de fetch
const defaultOptions: RequestInit = {
  mode: 'cors',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};
```

## Configuração Necessária no Backend NestJS

### 1. Instalar Dependências
```bash
npm install @nestjs/platform-express
```

### 2. Configurar CORS no main.ts
```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configuração de CORS
  app.enableCors({
    origin: [
      'http://localhost:5173', // Frontend Vite
      'http://localhost:3000', // Caso o frontend rode na 3000
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
    ],
    credentials: true, // Permitir cookies/credenciais
  });

  await app.listen(3000);
  console.log('🚀 Backend rodando em http://localhost:3000');
}
bootstrap();
```

### 3. Configuração Alternativa (Mais Permissiva)
```typescript
// src/main.ts - Para desenvolvimento apenas
app.enableCors({
  origin: true, // Permitir qualquer origem
  credentials: true,
});
```

### 4. Controller de Autenticação
```typescript
// src/auth/auth.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: { email: string; password: string }) {
    // Validar credenciais
    if (loginDto.email === 'admin@teste.com' && loginDto.password === 'password123') {
      return {
        access_token: 'jwt_token_aqui',
        user: {
          id: '1',
          email: loginDto.email,
          nome: 'Admin',
          role: 'ADMIN',
        },
      };
    }
    
    throw new Error('Credenciais inválidas');
  }
}
```

## Testando a Configuração

### 1. Verificar se o Backend está Rodando
```bash
curl http://localhost:3000/auth/login
```

### 2. Testar CORS
```bash
curl -X OPTIONS http://localhost:3000/auth/login \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  -v
```

### 3. Testar Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:5173" \
  -d '{"email":"admin@teste.com","password":"password123"}'
```

## Variáveis de Ambiente

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000
# ou para usar proxy:
# VITE_API_URL=/api
```

### Backend (.env)
```env
PORT=3000
FRONTEND_URL=http://localhost:5173
```

## Troubleshooting

### Erro: "Access to fetch at ... has been blocked by CORS policy"
1. ✅ Verificar se o backend está rodando na porta 3000
2. ✅ Verificar se o CORS está configurado no backend
3. ✅ Verificar se a URL do frontend está na lista de origens permitidas

### Erro: "Failed to fetch"
1. ✅ Verificar se o backend está acessível
2. ✅ Verificar se não há firewall bloqueando
3. ✅ Testar com curl primeiro

### Erro: "Preflight request failed"
1. ✅ Verificar se o método OPTIONS está permitido
2. ✅ Verificar se os headers estão na lista permitida
3. ✅ Verificar se o backend responde a requisições OPTIONS

## Comandos Úteis

### Reiniciar Frontend
```bash
npm run dev
```

### Verificar Logs do Backend
```bash
# No terminal do backend NestJS
npm run start:dev
```

### Verificar Network no Browser
1. Abrir DevTools (F12)
2. Aba Network
3. Tentar fazer login
4. Verificar requisições e respostas

## Status Atual
- ✅ Frontend configurado com proxy
- ✅ Headers CORS configurados
- ✅ Tratamento de erros melhorado
- ⏳ Aguardando configuração do backend NestJS 