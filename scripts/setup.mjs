/**
 * Runs at Vercel build time:
 * 1. Creates tables (idempotent)
 * 2. Seeds tasks + ideas for current ISO week (re-seeds if week changed)
 */
import { createClient } from "@libsql/client";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ISO 8601 week — same logic as lib/week.ts
function getCurrentWeek() {
  const now = new Date();
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

const dbUrl =
  process.env.TURSO_DATABASE_URL ??
  `file:${path.join(__dirname, "../prisma/yomescapo.db")}`;
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient({ url: dbUrl, authToken });

// ── 1. Create tables ──────────────────────────────────────────────────────────
await client.executeMultiple(`
CREATE TABLE IF NOT EXISTS "Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "details" TEXT,
    "day" TEXT NOT NULL,
    "timeSlot" TEXT NOT NULL,
    "channels" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'todo',
    "week" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
CREATE TABLE IF NOT EXISTS "WeeklyMetric" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "week" TEXT NOT NULL,
    "newSignups" INTEGER NOT NULL DEFAULT 0,
    "activeUsers" INTEGER NOT NULL DEFAULT 0,
    "revenue" INTEGER NOT NULL DEFAULT 0,
    "bestPost" TEXT,
    "notes" TEXT
);
CREATE TABLE IF NOT EXISTS "ContentIdea" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "hook" TEXT,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "WeeklyMetric_week_key" ON "WeeklyMetric"("week");
`);
console.log("✓ Setup: tabelas verificadas");

// ── 2. Check week — re-seed if missing or wrong week ─────────────────────────
const week = getCurrentWeek();
const { rows } = await client.execute({
  sql: `SELECT COUNT(*) as count FROM "Task" WHERE week = ?`,
  args: [week],
});
const count = Number(rows[0].count);
if (count > 0) {
  console.log(`✓ Setup: semana ${week} já tem ${count} tarefas, seed ignorado`);
  client.close();
  process.exit(0);
}
// Clean up tasks from wrong weeks and re-seed
await client.execute(`DELETE FROM "Task"`);
console.log(`✓ Setup: re-seeding para semana ${week}`);

// ── 3. Seed tasks ─────────────────────────────────────────────────────────────
const now = new Date().toISOString();

const tasks = [
  { day: "Segunda", position: 0, name: "Escrever thread tutorial completa", timeSlot: "9h–10h", channels: '["Twitter/X"]', details: "8 a 10 tweets. Começa com resultado, depois ensina. Não coloca link no primeiro tweet. Formato: promessa → desenvolvimento → solução → CTA no último tweet." },
  { day: "Segunda", position: 1, name: "Revisar e agendar thread para as 19h", timeSlot: "10h–11h", channels: '["Twitter/X"]', details: "Lê novamente, ajusta o primeiro tweet para ser irresistível, confirma que não tem link no início. Agendar para 19h pelo Twitter." },
  { day: "Segunda", position: 2, name: "Escrever dica rápida para o canal do Telegram", timeSlot: "15h–16h30", channels: '["Telegram"]', details: "Uma coisa concreta que o membro pode aplicar hoje. Máx 5 linhas. Tom direto. Publicar às 20h." },
  { day: "Segunda", position: 3, name: "Planejar conteúdo dos próximos 3 dias", timeSlot: "16h30–18h", channels: '["Planejamento"]', details: "Definir tema de terça, quarta e sexta. Separar prints de resultado de usuários. Anotar o formato vencedor da semana anterior." },
  { day: "Segunda", position: 4, name: "Responder dúvidas no Discord — Capo Community", timeSlot: "18h–19h", channels: '["Discord"]', details: "Mínimo 15 minutos ativos respondendo membros. Verificar canal #resultados e celebrar conquistas. Isso retém usuário." },

  { day: "Terça", position: 0, name: "Gravar vídeo da semana", timeSlot: "9h–11h", channels: '["YouTube"]', details: "Screencast + voz. Estrutura: hook 30s mostrando resultado final → apresentação rápida → tutorial passo a passo numerado → CTA duplo no final. Duração: 8 a 14 minutos." },
  { day: "Terça", position: 1, name: "Editar vídeo", timeSlot: "15h–17h", channels: '["YouTube"]', details: "Cortar silêncios e hesitações, adicionar texto na tela nas etapas numeradas, inserir CTA no final com link de cadastro e menção ao canal do Telegram." },
  { day: "Terça", position: 2, name: "Preparar post de print de resultado", timeSlot: "15h–17h", channels: '["Twitter/X"]', details: "Pegar print real de venda de usuário (pedir autorização). Escrever contexto em 3 tweets: resultado → como configurou → CTA. Agendar para 19h." },
  { day: "Terça", position: 3, name: "Publicar vídeo no YouTube", timeSlot: "17h–18h30", channels: '["YouTube"]', details: "Título começa com 'Como'. Descrição: primeiras 2 linhas = resumo do vídeo + link de cadastro. Tags: bot telegram, vendas telegram, automação telegram." },
  { day: "Terça", position: 4, name: "Publicar case completo no canal Telegram", timeSlot: "18h30–19h", channels: '["Telegram"]', details: "Versão aprofundada do print do Twitter. Mostra fluxo exato, produto vendido, texto das mensagens, resultado em números. Exclusivo aqui — não vai pro Twitter." },
  { day: "Terça", position: 5, name: "Engajar comentários da thread de segunda", timeSlot: "18h30–19h", channels: '["Twitter/X"]', details: "Responder todos os comentários da thread de segunda. Primeiras 48h são críticas para o algoritmo. Responder com conteúdo, não só 'obrigado'." },

  { day: "Quarta", position: 0, name: "Escrever post de erro comum", timeSlot: "9h–10h30", channels: '["Twitter/X"]', details: "Formato: erro que todo afiliado comete → consequência → como eu resolvi. 3 a 5 tweets com solução prática. Agendar para 19h." },
  { day: "Quarta", position: 1, name: "Monitorar métricas da semana", timeSlot: "10h30–11h", channels: '["Planejamento"]', details: "Ver qual post mais engajou, qual trouxe cadastro, qual vídeo está com mais views. Anotar o formato vencedor para repetir na semana seguinte." },
  { day: "Quarta", position: 2, name: "Publicar post de bastidor do produto", timeSlot: "15h–17h", channels: '["Twitter/X"]', details: "O que está sendo construído, funcionalidade nova, novidade da plataforma. Mostrar por dentro. Publicar às 19h." },
  { day: "Quarta", position: 3, name: "Publicar novidade exclusiva no canal Telegram", timeSlot: "15h–17h", channels: '["Telegram"]', details: "Versão mais detalhada do bastidor. Mencionar: 'isso você viu aqui primeiro'. Criar sensação de exclusividade para quem está no canal." },
  { day: "Quarta", position: 4, name: "Interação no Discord + suporte a usuários", timeSlot: "17h–19h", channels: '["Discord"]', details: "Responder dúvidas técnicas, incentivar membros a postar resultado em #resultados. Se houver usuário com problema, resolver ao vivo." },

  { day: "Sexta", position: 0, name: "Escrever CTA direto para cadastro", timeSlot: "9h–10h", channels: '["Twitter/X"]', details: "Post curto e direto. 'Grátis. Você só paga quando vende.' Mencionar Capo Community com link escondido nos posts — não na bio, em algum post da semana." },
  { day: "Sexta", position: 1, name: "Publicar CTA para Capo Community no Telegram", timeSlot: "10h–11h", channels: '["Telegram"]', details: "'Capo Community está aberta. Link de acesso em algum post aqui no canal.' Cria curiosidade, faz o membro vasculhar os posts." },
  { day: "Sexta", position: 2, name: "Planejar semana seguinte completa", timeSlot: "15h–17h", channels: '["Planejamento"]', details: "Definir tema de cada dia da próxima semana, separar prints, esboçar roteiro do vídeo da terça. Segunda começa sem precisar pensar — tudo já decidido." },
  { day: "Sexta", position: 3, name: "Relatório semanal rápido", timeSlot: "17h–18h30", channels: '["Planejamento"]', details: "Registrar: novos cadastros, usuários ativos, post que mais converteu, receita da semana, meta para a semana seguinte. Salvar na aba Métricas." },
  { day: "Sexta", position: 4, name: "Encerrar semana no Discord", timeSlot: "18h30–19h", channels: '["Discord"]', details: "Post de encerramento em #anúncios. Celebrar resultado de membro se houver. Deixar a comunidade animada para a semana seguinte." },

  { day: "Sábado", position: 0, name: "Publicar pergunta aberta no canal Telegram", timeSlot: "2h livres", channels: '["Telegram"]', details: "'Qual sua maior dificuldade para vender no Telegram hoje?' Habilitar comentários só nesse post. Usar as respostas para criar conteúdo da semana seguinte." },
  { day: "Sábado", position: 1, name: "Repostar melhor conteúdo da semana", timeSlot: "2h livres", channels: '["Twitter/X"]', details: "Pegar o post que mais engajou e repostar com um comentário novo em cima acrescentando contexto. Não retweet simples — adiciona valor." },
  { day: "Sábado", position: 2, name: "Interação livre no Discord", timeSlot: "2h livres", channels: '["Discord"]', details: "Sem pressão. Conversa, responde o que tiver pendente, coleta feedback informal dos membros. Perguntar o que gostariam de ver na semana seguinte." },
];

for (const t of tasks) {
  await client.execute({
    sql: `INSERT INTO "Task" (id, name, details, day, timeSlot, channels, status, week, position, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, 'todo', ?, ?, ?, ?)`,
    args: [randomUUID(), t.name, t.details, t.day, t.timeSlot, t.channels, week, t.position, now, now],
  });
}

// ── 4. Seed ideas (only if table is empty) ────────────────────────────────────
const { rows: ideaRows } = await client.execute(`SELECT COUNT(*) as count FROM "ContentIdea"`);
const ideaCount = Number(ideaRows[0].count);

if (ideaCount === 0) {
  const ideas = [
    { title: "Como eu fiz R$X em Y dias com bot no Telegram", channel: "Twitter/X", format: "Thread", hook: "Eu não sabia nada de programação. Hoje meu bot vende sozinho." },
    { title: "7 erros que todo afiliado comete no Telegram", channel: "Twitter/X", format: "Thread", hook: "Erro número 1 já elimina 90% das suas vendas." },
    { title: "Print de resultado: R$X em 24h com uma mensagem", channel: "Twitter/X", format: "Print", hook: "Uma mensagem. 24 horas. Esse número." },
    { title: "O segredo que as pessoas não contam sobre vender no Telegram", channel: "Twitter/X", format: "Thread", hook: "Todo mundo fala de produto. Ninguém fala disso." },
    { title: "Bastidor: o que construímos essa semana no Yomescapo", channel: "Twitter/X", format: "Bastidor", hook: "Olha o que saiu do forno hoje." },
    { title: "CTA: Grátis. Você só paga quando vende.", channel: "Twitter/X", format: "CTA", hook: "Grátis. Você só paga quando vende." },
    { title: "Como configurar seu primeiro bot de vendas em 30 minutos", channel: "Twitter/X", format: "Thread", hook: "30 minutos. Sem código. Sem servidor." },
    { title: "Por que a maioria das pessoas falha vendendo no Telegram", channel: "Twitter/X", format: "Erro", hook: "Não é o produto. Não é o preço." },
    { title: "O modelo de mensagem que converte 3x mais", channel: "Twitter/X", format: "Tutorial", hook: "Copiei esse modelo e as vendas triplicaram." },
    { title: "Capo Community: resultados dos membros dessa semana", channel: "Twitter/X", format: "Print", hook: "Eles chegaram sem saber nada. Olha onde estão agora." },
    { title: "Como criar um bot de vendas no Telegram do zero", channel: "YouTube", format: "Tutorial", hook: "No final desse vídeo você vai ter um bot funcionando." },
    { title: "Como automatizar suas vendas no Telegram em 2025", channel: "YouTube", format: "Tutorial", hook: "Automação que roda enquanto você dorme." },
    { title: "Como eu fiz minha primeira venda automática no Telegram", channel: "YouTube", format: "Tutorial", hook: "Do zero à primeira venda em menos de 1 semana." },
    { title: "Como configurar pagamento automático no Telegram", channel: "YouTube", format: "Tutorial", hook: "Cliente paga, recebe acesso, você não faz nada." },
    { title: "Como criar uma lista VIP no Telegram que realmente vende", channel: "YouTube", format: "Tutorial", hook: "Lista VIP não é grupo. É sistema." },
    { title: "O funil de vendas que usei para fazer R$X no Telegram", channel: "YouTube", format: "Tutorial", hook: "Esse funil tem 3 etapas. Deixa eu te mostrar." },
    { title: "Como fazer copy para Telegram que converte", channel: "YouTube", format: "Tutorial", hook: "A maioria das mensagens está errada. Veja o certo." },
    { title: "Revisão ao vivo: bot de membro da Capo Community", channel: "YouTube", format: "Tutorial", hook: "Peguei o bot de um membro e melhorei ao vivo." },
    { title: "Como usar o Yomescapo para vender todo dia", channel: "YouTube", format: "Tutorial", hook: "Tour completo pela plataforma." },
    { title: "Erros que destroem suas vendas no Telegram", channel: "YouTube", format: "Tutorial", hook: "Eu cometi todos esses erros. Você não precisa." },
    { title: "Como escalar vendas no Telegram sem trabalhar mais", channel: "YouTube", format: "Tutorial", hook: "Mais vendas. Menos trabalho. É possível." },
    { title: "Resultados reais de membros da Capo Community", channel: "YouTube", format: "Tutorial", hook: "Eles entraram do zero. Esses são os números deles." },
  ];
  for (const idea of ideas) {
    await client.execute({
      sql: `INSERT INTO "ContentIdea" (id, title, channel, format, hook, used, createdAt) VALUES (?, ?, ?, ?, ?, 0, ?)`,
      args: [randomUUID(), idea.title, idea.channel, idea.format, idea.hook ?? null, now],
    });
  }
  console.log(`✓ Setup: ${ideas.length} ideias criadas`);
}

console.log(`✓ Setup: ${tasks.length} tarefas criadas para ${week}`);
client.close();
