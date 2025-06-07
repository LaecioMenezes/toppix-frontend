# 🎫 Sistema de Bilhetes - Frontend

Sistema moderno de geração e validação de bilhetes premiados, desenvolvido com React, TypeScript e design Apple-like com glass effects.

## ✨ Características

- **Design Apple-like**: Interface moderna com glass effects e backdrop blur
- **Mobile-first**: Responsivo e otimizado para dispositivos móveis
- **TDD**: Desenvolvido com Test-Driven Development
- **TypeScript**: Tipagem completa para maior confiabilidade
- **Tema personalizável**: Sistema de cores facilmente customizável via CSS variables

## 🛠️ Tecnologias

- **React 19.1.0** com TypeScript
- **Vite** para build e desenvolvimento
- **TailwindCSS 4.1.8** com configuração customizada
- **React Router 7.6.2** para navegação
- **React Hook Form + Zod** para validação de formulários
- **Vitest + Testing Library** para testes
- **Lucide React** para ícones

## 📦 Instalação

```bash
# Instalar dependências
yarn install

# Configurar variáveis de ambiente
cp .env.example .env.local

# Executar em desenvolvimento
yarn dev

# Executar testes
yarn test

# Build para produção
yarn build
```

## 🔧 Configuração

### Variáveis de Ambiente

```env
# URL da API (opcional - padrão: http://localhost:3001/api)
VITE_API_URL=http://localhost:3001/api

# Usar mock service para desenvolvimento (opcional - padrão: true)
VITE_USE_MOCK=true
```

### Personalização de Cores

O sistema usa CSS variables para cores facilmente personalizáveis em `src/index.css`:

```css
:root {
  /* Cores primárias (azul Apple) */
  --color-primary-50: 239 246 255;
  --color-primary-500: 59 130 246;
  --color-primary-600: 37 99 235;
  
  /* Tema escuro automático */
  @media (prefers-color-scheme: dark) {
    --color-primary-500: 96 165 250;
  }
}
```

## 🏗️ Arquitetura

### Estrutura de Pastas

```
src/
├── components/          # Componentes reutilizáveis
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   └── Select.tsx
├── pages/              # Páginas da aplicação
│   ├── ValidarBilhete.tsx
│   └── admin/
│       ├── AdminLayout.tsx
│       ├── GerarBilhetes.tsx
│       └── ListarBilhetes.tsx
├── contexts/           # Contextos do React
│   └── BilheteContext.tsx
├── hooks/              # Hooks customizados
│   └── useBilhetes.ts
├── services/           # Serviços da API
│   └── bilheteService.ts
├── types/              # Definições de tipos
│   └── index.ts
└── __tests__/          # Testes unitários
```

### Gerenciamento de Estado

- **Context API + useReducer**: Estado global para bilhetes
- **React Hook Form**: Estado local de formulários
- **Mock Service**: Dados simulados para desenvolvimento

## 🎯 Funcionalidades

### 📱 Área Pública (/validar)

- **Validação de bilhetes**: Digite o código ou escaneie QR Code
- **Resultado visual**: Estados diferenciados para premiado/válido/inválido
- **Detalhes do bilhete**: Informações completas quando encontrado
- **Interface mobile-first**: Otimizada para smartphones

### 🖥️ Área Administrativa (/admin)

#### Gerar Bilhetes (/admin/gerar)
- **Formulário completo**: Quantidade, prefixo, valor, data de expiração
- **Validação robusta**: Zod schema com mensagens em português
- **Resultado visual**: Exibição dos bilhetes gerados
- **Exportação**: CSV dos bilhetes criados

#### Listar Bilhetes (/admin/listar)
- **Tabela responsiva**: Visualização completa dos bilhetes
- **Filtros avançados**: Por código, prefixo e status
- **Estatísticas**: Contadores por status
- **Busca em tempo real**: Debounce para performance
- **Ações**: Visualizar PDF de cada bilhete
- **Exportação**: CSV ou ZIP com PDFs

## 🧪 Testes

```bash
# Executar todos os testes
yarn test

# Executar com interface visual
yarn test:ui

# Executar com coverage
yarn test:coverage

# Executar teste específico
yarn test src/__tests__/components/Button.test.tsx
```

### Cobertura de Testes

- **Button Component**: 8 testes (renderização, variantes, estados)
- **Input Component**: 7 testes (validação, acessibilidade)
- **ValidarBilhete Page**: 6 testes (formulário, resultados)
- **GerarBilhetes Page**: 7 testes (geração, validação)
- **ListarBilhetes Page**: 10 testes (filtros, tabela)

## 🎨 Design System

### Componentes Base

- **Button**: 4 variantes (primary, secondary, ghost, danger)
- **Input**: Com ícones, validação e acessibilidade
- **Card**: 3 variantes (default, glass, elevated)
- **Select**: Dropdown com validação

### Utilitários CSS

```css
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.button-apple {
  border-radius: 10px;
  transition: all 0.2s ease;
  transform: active:scale(0.95);
}
```

## 🚀 Build e Deploy

```bash
# Build para produção
yarn build

# Preview do build
yarn preview

# Análise do bundle
yarn build && npx vite-bundle-analyzer dist
```

### Otimizações

- **Code splitting**: Lazy loading das rotas
- **Tree shaking**: Remoção de código não utilizado
- **Compressão**: Gzip automático
- **Cache**: Headers otimizados para assets

## 📈 Performance

- **Core Web Vitals**: Otimizado para métricas do Google
- **Mobile-first**: Carregamento rápido em dispositivos móveis
- **Lazy loading**: Componentes carregados sob demanda
- **Debounce**: Filtros com delay para reduzir requests

## 🔧 Desenvolvimento

### Scripts Disponíveis

```bash
yarn dev          # Desenvolvimento com hot reload
yarn build        # Build para produção
yarn preview      # Preview do build
yarn test         # Testes unitários
yarn test:ui      # Interface visual dos testes
yarn test:coverage # Cobertura de testes
yarn lint         # Linting do código
yarn type-check   # Verificação de tipos
```

### Padrões de Código

- **ESLint + Prettier**: Formatação automática
- **TypeScript strict**: Tipagem rigorosa
- **Conventional Commits**: Mensagens de commit padronizadas
- **Component naming**: PascalCase para componentes

## 📱 Responsividade

### Breakpoints

```css
/* Mobile first */
.container { @apply max-w-sm; }

/* Tablet */
@media (min-width: 768px) {
  .container { @apply max-w-4xl; }
}

/* Desktop */
@media (min-width: 1024px) {
  .container { @apply max-w-7xl; }
}
```

## 🌐 Navegação

### Rotas

- `/` → Redireciona para `/validar`
- `/validar` → Área pública de validação
- `/admin` → Redireciona para `/admin/gerar`
- `/admin/gerar` → Geração de bilhetes
- `/admin/listar` → Listagem de bilhetes
- `*` → Redireciona para `/validar` (404)

## 🛡️ Segurança

- **Validação client-side**: Zod schemas
- **Sanitização**: Inputs limpos antes do envio
- **CORS**: Configurado para produção
- **Headers de segurança**: CSP, HSTS, etc.

## 📚 Documentação Adicional

- [Design System](./docs/design-system.md)
- [API Integration](./docs/api-integration.md)
- [Testing Guide](./docs/testing.md)
- [Deployment](./docs/deployment.md)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/amazing-feature`)
3. Commit suas mudanças (`git commit -m 'Add some amazing feature'`)
4. Push para a branch (`git push origin feature/amazing-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

---

**Desenvolvido com ❤️ usando React + TypeScript + TailwindCSS**
