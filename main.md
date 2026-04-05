# Prompt para Claude Code — Gestor de Tarefas Local (estilo Notion)

Crie uma aplicação web completa de gestão de tarefas estilo Notion, que abre direto no navegador sem login, com todos os dados já preenchidos. É o hub de operação de marketing do projeto Yomescapo / Capo Community.

## Stack

- **Frontend:** Next.js 14+ App Router
- **UI:** Tailwind CSS + shadcn/ui
- **Banco local:** SQLite com Prisma (arquivo local, sem servidor externo)
- **Sem autenticação** — abre direto na aplicação

---

## Schema Prisma (prisma/schema.prisma)

```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./yomescapo.db"
}

generator client {
  provider = "prisma-client-js"
}

model Task {
  id        String   @id @default(cuid())
  name      String
  details   String?
  day       String   // Segunda | Terça | Quarta | Sexta | Sábado
  timeSlot  String   // ex: "9h–10h"
  channels  String   // JSON array: ["Twitter/X", "YouTube"]
  status    String   @default("todo") // todo | inprogress | done
  week      String   // "2025-W01" formato ISO week
  position  Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model WeeklyMetric {
  id           String @id @default(cuid())
  week         String @unique
  newSignups   Int    @default(0)
  activeUsers  Int    @default(0)
  revenue      Int    @default(0) // em centavos
  bestPost     String?
  notes        String?
}

model ContentIdea {
  id        String   @id @default(cuid())
  title     String
  channel   String
  format    String
  hook      String?
  used      Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

---

## Seed (prisma/seed.ts)

Crie o seed com TODAS as tarefas abaixo para a semana atual. Use `getCurrentWeek()` para pegar o identificador da semana no formato ISO (ex: "2025-W01").

### Segunda — 5 tarefas

```
1. name: "Escrever thread tutorial completa"
   timeSlot: "9h–10h"
   channels: ["Twitter/X"]
   details: "8 a 10 tweets. Começa com resultado, depois ensina. Não coloca link no primeiro tweet. Formato: promessa → desenvolvimento → solução → CTA no último tweet."

2. name: "Revisar e agendar thread para as 19h"
   timeSlot: "10h–11h"
   channels: ["Twitter/X"]
   details: "Lê novamente, ajusta o primeiro tweet para ser irresistível, confirma que não tem link no início. Agendar para 19h pelo Twitter."

3. name: "Escrever dica rápida para o canal do Telegram"
   timeSlot: "15h–16h30"
   channels: ["Telegram"]
   details: "Uma coisa concreta que o membro pode aplicar hoje. Máx 5 linhas. Tom direto. Publicar às 20h."

4. name: "Planejar conteúdo dos próximos 3 dias"
   timeSlot: "16h30–18h"
   channels: ["Planejamento"]
   details: "Definir tema de terça, quarta e sexta. Separar prints de resultado de usuários. Anotar o formato vencedor da semana anterior."

5. name: "Responder dúvidas no Discord — Capo Community"
   timeSlot: "18h–19h"
   channels: ["Discord"]
   details: "Mínimo 15 minutos ativos respondendo membros. Verificar canal #resultados e celebrar conquistas. Isso retém usuário."
```

### Terça — 6 tarefas

```
1. name: "Gravar vídeo da semana"
   timeSlot: "9h–11h"
   channels: ["YouTube"]
   details: "Screencast + voz. Estrutura: hook 30s mostrando resultado final → apresentação rápida → tutorial passo a passo numerado → CTA duplo no final. Duração: 8 a 14 minutos."

2. name: "Editar vídeo"
   timeSlot: "15h–17h"
   channels: ["YouTube"]
   details: "Cortar silêncios e hesitações, adicionar texto na tela nas etapas numeradas, inserir CTA no final com link de cadastro e menção ao canal do Telegram."

3. name: "Preparar post de print de resultado"
   timeSlot: "15h–17h"
   channels: ["Twitter/X"]
   details: "Pegar print real de venda de usuário (pedir autorização). Escrever contexto em 3 tweets: resultado → como configurou → CTA. Agendar para 19h."

4. name: "Publicar vídeo no YouTube"
   timeSlot: "17h–18h30"
   channels: ["YouTube"]
   details: "Título começa com 'Como'. Descrição: primeiras 2 linhas = resumo do vídeo + link de cadastro. Tags: bot telegram, vendas telegram, automação telegram."

5. name: "Publicar case completo no canal Telegram"
   timeSlot: "18h30–19h"
   channels: ["Telegram"]
   details: "Versão aprofundada do print do Twitter. Mostra fluxo exato, produto vendido, texto das mensagens, resultado em números. Exclusivo aqui — não vai pro Twitter."

6. name: "Engajar comentários da thread de segunda"
   timeSlot: "18h30–19h"
   channels: ["Twitter/X"]
   details: "Responder todos os comentários da thread de segunda. Primeiras 48h são críticas para o algoritmo. Responder com conteúdo, não só 'obrigado'."
```

### Quarta — 5 tarefas

```
1. name: "Escrever post de erro comum"
   timeSlot: "9h–10h30"
   channels: ["Twitter/X"]
   details: "Formato: erro que todo afiliado comete → consequência → como eu resolvi. 3 a 5 tweets com solução prática. Agendar para 19h."

2. name: "Monitorar métricas da semana"
   timeSlot: "10h30–11h"
   channels: ["Planejamento"]
   details: "Ver qual post mais engajou, qual trouxe cadastro, qual vídeo está com mais views. Anotar o formato vencedor para repetir na semana seguinte."

3. name: "Publicar post de bastidor do produto"
   timeSlot: "15h–17h"
   channels: ["Twitter/X"]
   details: "O que está sendo construído, funcionalidade nova, novidade da plataforma. Mostrar por dentro. Publicar às 19h."

4. name: "Publicar novidade exclusiva no canal Telegram"
   timeSlot: "15h–17h"
   channels: ["Telegram"]
   details: "Versão mais detalhada do bastidor. Mencionar: 'isso você viu aqui primeiro'. Criar sensação de exclusividade para quem está no canal."

5. name: "Interação no Discord + suporte a usuários"
   timeSlot: "17h–19h"
   channels: ["Discord"]
   details: "Responder dúvidas técnicas, incentivar membros a postar resultado em #resultados. Se houver usuário com problema, resolver ao vivo."
```

### Sexta — 5 tarefas

```
1. name: "Escrever CTA direto para cadastro"
   timeSlot: "9h–10h"
   channels: ["Twitter/X"]
   details: "Post curto e direto. 'Grátis. Você só paga quando vende.' Mencionar Capo Community com link escondido nos posts — não na bio, em algum post da semana."

2. name: "Publicar CTA para Capo Community no Telegram"
   timeSlot: "10h–11h"
   channels: ["Telegram"]
   details: "'Capo Community está aberta. Link de acesso em algum post aqui no canal.' Cria curiosidade, faz o membro vasculhar os posts."

3. name: "Planejar semana seguinte completa"
   timeSlot: "15h–17h"
   channels: ["Planejamento"]
   details: "Definir tema de cada dia da próxima semana, separar prints, esboçar roteiro do vídeo da terça. Segunda começa sem precisar pensar — tudo já decidido."

4. name: "Relatório semanal rápido"
   timeSlot: "17h–18h30"
   channels: ["Planejamento"]
   details: "Registrar: novos cadastros, usuários ativos, post que mais converteu, receita da semana, meta para a semana seguinte. Salvar na aba Métricas."

5. name: "Encerrar semana no Discord"
   timeSlot: "18h30–19h"
   channels: ["Discord"]
   details: "Post de encerramento em #anúncios. Celebrar resultado de membro se houver. Deixar a comunidade animada para a semana seguinte."
```

### Sábado — 3 tarefas

```
1. name: "Publicar pergunta aberta no canal Telegram"
   timeSlot: "2h livres"
   channels: ["Telegram"]
   details: "'Qual sua maior dificuldade para vender no Telegram hoje?' Habilitar comentários só nesse post. Usar as respostas para criar conteúdo da semana seguinte."

2. name: "Repostar melhor conteúdo da semana"
   timeSlot: "2h livres"
   channels: ["Twitter/X"]
   details: "Pegar o post que mais engajou e repostar com um comentário novo em cima acrescentando contexto. Não retweet simples — adiciona valor."

3. name: "Interação livre no Discord"
   timeSlot: "2h livres"
   channels: ["Discord"]
   details: "Sem pressão. Conversa, responde o que tiver pendente, coleta feedback informal dos membros. Perguntar o que gostariam de ver na semana seguinte."
```

---

## Páginas da aplicação

### `/` — Dashboard principal

Layout com sidebar fixa à esquerda e conteúdo à direita.

**Sidebar:**
- Logo/nome: "🏴 Yomescapo"
- Links: Dashboard, Agenda, Métricas, Banco de Ideias
- Indicador da semana atual no rodapé

**Conteúdo do Dashboard:**
- Cards de resumo no topo:
  - Tarefas concluídas hoje (X/Y)
  - Progresso da semana (%)
  - Dia atual com próxima tarefa
- Barra de progresso da semana
- Lista das tarefas de HOJE já filtradas (buscar pelo dia da semana atual)
- Cada tarefa com checkbox, canal badge colorido, horário e nome

---

### `/agenda` — Agenda semanal completa

**Visualizações (tabs):**

**Tab 1 — Por dia (padrão)**
- Colunas: Segunda | Terça | Quarta | Sexta | Sábado
- Quinta aparece como coluna cinza com texto "Offline"
- Cada coluna lista as tarefas com checkbox, horário e canal badge
- Drag and drop para reordenar tarefas dentro do mesmo dia

**Tab 2 — Por canal**
- Colunas: Twitter/X | YouTube | Telegram | Discord | Planejamento
- Cada coluna lista as tarefas desse canal com dia e horário

**Tab 3 — Por status**
- Colunas: A fazer | Em andamento | Concluído
- Todas as tarefas da semana agrupadas por status

**Navegação de semana:**
- Botões "← Semana anterior" e "Semana seguinte →"
- Título mostrando a semana atual: "Semana de 06 a 11 de Janeiro"
- Botão "Duplicar semana" — copia todas as tarefas para a próxima semana com status resetado para "todo"

---

### `/metricas` — Métricas semanais

Formulário para preencher ao final de cada semana:
- Novos cadastros
- Usuários ativos
- Receita (R$)
- Melhor post da semana
- Observações

Tabela com histórico de todas as semanas anteriores.

Cards comparando semana atual vs semana anterior:
- Crescimento de cadastros (%)
- Crescimento de receita (%)

---

### `/ideias` — Banco de ideias de conteúdo

Já popular com as 10 ideias de post do Twitter/X e 12 títulos do YouTube do plano de marketing.

Campos por ideia:
- Título
- Canal (Twitter/X | YouTube | Telegram)
- Formato (Thread | Print | Erro | Tutorial | CTA | Bastidor)
- Hook (primeira linha/frase)
- Usado (checkbox)

Filtro por canal e por usado/não usado.
Botão "Nova ideia" abre modal para adicionar.

---

## Design

- **Tema:** Dark mode como padrão
- **Cores dos canais (badges):**
  - Twitter/X → azul (#378ADD)
  - YouTube → vermelho (#E24B4A)
  - Telegram → verde (#1D9E75)
  - Discord → roxo (#7F77DD)
  - Planejamento → âmbar (#BA7517)
- **Status cores:**
  - todo → cinza
  - inprogress → âmbar
  - done → verde
- **Fonte:** Inter ou similar
- Loading states com skeleton em todas as listas
- Toasts de confirmação ao marcar tarefa como concluída
- Totalmente responsivo — funciona bem no celular

---

## Funcionalidades extras

1. **Marcar tarefa como concluída:** clique no checkbox → status vai para "done" → toast de confirmação
2. **Marcar como em andamento:** botão secundário na tarefa → status "inprogress"
3. **Editar tarefa:** clique no nome → abre sheet lateral com formulário de edição
4. **Duplicar semana:** copia todas as 24 tarefas para a semana seguinte com status resetado
5. **Filtro rápido por canal:** chips clicáveis no topo da agenda
6. **Indicador de % do dia:** barra de progresso em cada coluna de dia

---

## Ordem de implementação

1. Setup Next.js + Tailwind + shadcn/ui
2. Schema Prisma + SQLite
3. Seed com todas as 24 tarefas
4. Layout base com sidebar
5. Dashboard `/`
6. Agenda `/agenda` com as 3 tabs
7. API routes para CRUD de tarefas
8. Métricas `/metricas`
9. Banco de ideias `/ideias`
10. Polish: dark mode, responsivo, toasts, skeletons

---

## Comando para rodar

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

Abre em `http://localhost:3000` direto, sem login.

---

**Regra:** Implemente fase por fase e me avise ao terminar cada etapa antes de avançar.
