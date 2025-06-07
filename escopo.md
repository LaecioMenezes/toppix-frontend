### 🎨 Frontend (React)
- [x] Criar projeto com Vite ou CRA
- [x] Instalar TailwindCSS
- [x] Estrutura de pastas: `pages`, `components`, `services`, `hooks`, `contexts`
- [x] Configurar sistema de cores personalizável estilo Apple
- [x] Implementar componentes base (Button, Input, Card) com glass effect
- [x] Configurar testes unitários com Vitest
- [x] Implementar contexto global para gerenciamento de estado

---

### 🖥️ Frontend - Área do Administrador
- [x] Tela de geração de bilhetes:
  - [x] Quantidade a gerar
  - [x] Prefixo (ex: GANHADOR)
  - [x] Valor do prêmio (opcional)
  - [x] Data de expiração (opcional)
  - [x] Validação de formulário com Zod
  - [x] Exibição de resultados de geração
  - [x] Exportação de CSV dos bilhetes gerados
- [x] Listagem de bilhetes com:
  - [x] Número, código, status
  - [x] Filtro por status ou período
  - [x] Busca por código e prefixo
  - [x] Ação: visualizar PDF
  - [x] Estatísticas (total, ativos, premiados, expirados)
  - [x] Tabela responsiva com badges de status
- [x] Opção de exportar lista em CSV ou ZIP com PDFs
- [x] Layout administrativo responsivo com sidebar
- [x] Navegação com React Router
- [x] Design estilo Apple com glass effects

---

### 📱 Frontend - Área Pública (Validação)
- [x] Leitor de QR Code ou campo para digitar o código
- [x] Verificação do código no backend:
  - [x] Se premiado → exibe valor e instruções
  - [x] Se não premiado → mensagem de incentivo
  - [x] Se inválido ou expirado → mensagem de erro
- [x] Interface responsiva mobile-first
- [x] Design estilo Apple com backdrop blur
