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
    "description" TEXT,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "WeeklyMetric_week_key" ON "WeeklyMetric"("week");
`);
// Add description column if it doesn't exist yet (migration for existing DBs)
await client.execute(`ALTER TABLE "ContentIdea" ADD COLUMN "description" TEXT`).catch(() => {});
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

// ── 4. Seed ideas — wipe unused and re-seed to keep ideas fresh ──────────────
await client.execute(`DELETE FROM "ContentIdea" WHERE used = 0`);
const { rows: ideaRows } = await client.execute(`SELECT COUNT(*) as count FROM "ContentIdea"`);
const ideaCount = Number(ideaRows[0].count);

{

  const ideas = [
    // ── Twitter/X ────────────────────────────────────────────────────────────
    {
      title: "Meu bot vendeu R$847 enquanto eu dormia — mostrando a tela", channel: "Twitter/X", format: "Print",
      hook: "Acordei, vi esse número. Aqui está cada passo de como configurei.",
      description: "Post com print real do painel do Yomescapo mostrando as vendas da noite. Thread de 6-8 tweets explicando: 1) qual produto estava vendendo, 2) como configurou o bot, 3) qual foi a oferta, 4) link pro Yomescapo no final. Tom: direto, sem hype, deixar os números falarem.",
    },
    {
      title: "Afiliado gasta 4h/dia respondendo DM. Eu gasto 0. A diferença é essa:", channel: "Twitter/X", format: "Provocação",
      hook: "Você ainda vende no grito? Para e lê isso.",
      description: "Comparativo entre vender manualmente (responder DM, enviar link, confirmar pagamento) vs automação com bot. Mostrar o custo de oportunidade do tempo perdido. Não atacar ninguém — mostrar evolução. Finalizar com: 'O bot faz isso enquanto você faz outra coisa.' CTA sutil pro Yomescapo.",
    },
    {
      title: "R$3.200 num final de semana. Canal no Telegram. Sem anúncio. Explico como.", channel: "Twitter/X", format: "Print",
      hook: "Print real. Método real. Thread completa.",
      description: "Thread mostrando resultado de fds. Estrutura: print → contexto (produto, nicho, tamanho da lista) → o que enviou (tipo de mensagem, horário) → taxa de conversão → o que o bot fez automaticamente. Mostrar que não foi sorte, foi sistema. Revelar os detalhes que as pessoas escondem.",
    },
    {
      title: "9 em cada 10 afiliados erra isso no Telegram. Você provavelmente também:", channel: "Twitter/X", format: "Thread",
      hook: "Errei por meses sem perceber. Quando entendi, mudou tudo.",
      description: "Thread sobre o erro de tratar o Telegram como grupo de spam em vez de lista quente. Os 3 erros mais comuns: 1) mandar link direto sem contexto, 2) não ter sequência de boas-vindas, 3) não segmentar compradores de curiosos. Cada erro com exemplo real de mensagem errada vs certa.",
    },
    {
      title: "Criei um canal no Telegram do zero. 90 dias depois, vende sozinho. O que aprendi:", channel: "Twitter/X", format: "Thread",
      hook: "Dados reais de 90 dias. Sem omitir os erros.",
      description: "Thread de retrospectiva: semana 1 (zero assinantes, primeiros posts), semana 4 (primeiras vendas), mês 2 (ajuste de copy), mês 3 (automação funcionando). Incluir números reais por período. Mencionar o que não funcionou. Tom de diário honesto, não de guru.",
    },
    {
      title: "Instagram, TikTok, YouTube. Todo mundo briga por atenção lá. O Telegram está vazio. Eu estou lá.", channel: "Twitter/X", format: "Provocação",
      hook: "A mina de ouro que os grandes ignoram.",
      description: "Post de posicionamento — por que o Telegram é canal subestimado: sem algoritmo punitivo, lista própria, open rate de 80%+, comunicação direta. Comparar com alcance orgânico do Instagram. Não é anti-Instagram, é 'adivinha onde tem menos concorrência'. Finalizar com dado de open rate.",
    },
    {
      title: "Como configurei meu bot de vendas em 37 minutos sem uma linha de código:", channel: "Twitter/X", format: "Tutorial",
      hook: "Printei cada passo. Thread completa com prints reais.",
      description: "Thread tutorial com prints de cada etapa no Yomescapo: 1) criar conta, 2) conectar bot no Telegram, 3) configurar produto + preço, 4) definir mensagens automáticas, 5) teste de compra. Cada tweet = um passo. Último tweet: 'Isso levou 37 minutos. Meu bot vendeu no mesmo dia.' CTA.",
    },
    {
      title: "Perdi 8 meses tentando vender no Telegram. O erro era ridículo de simples:", channel: "Twitter/X", format: "Erro",
      hook: "Se você ainda faz isso, para agora e lê até o fim.",
      description: "O erro: copiar mensagem de vendas genérica para lista fria. As pessoas precisam de aquecimento antes da oferta. Thread explicando o conceito de 'sequência de boas-vindas' — os primeiros 3 dias antes de qualquer oferta. Mostrar antes e depois das mensagens com resultado.",
    },
    {
      title: "Você vende na força bruta. Eu automatizei tudo. Grátis pra começar.", channel: "Twitter/X", format: "CTA",
      hook: "Testa antes de me chamar de mentiroso. Só pago quando vendo.",
      description: "Post de CTA direto. Estrutura: 'Você provavelmente faz isso → [lista do processo manual doloroso]. Eu faço isso → [lista do bot fazendo tudo]. Diferença: [resultado]. Onde eu faço isso: Yomescapo. Grátis pra criar. Paga só % quando vende.' Link. Sem floreios.",
    },
    {
      title: "Minha semana vendendo no Telegram com automação — números reais:", channel: "Twitter/X", format: "Bastidor",
      hook: "Segunda. Bot vendeu 3x enquanto eu fazia outras coisas.",
      description: "Thread de bastidor semanal: segunda (enviei 1 mensagem, bot gerou X vendas), quarta (reativação de lista fria, resultado), sexta (oferta especial, ROI). Total da semana. Horas gastas: X. Horas do bot trabalhando: 168. Fazer isso toda semana como série — constrói audiência de afiliados.",
    },
    {
      title: "Com 200 seguidores e um bot, fiz mais do que influencer com 50k. O que ninguém conta:", channel: "Twitter/X", format: "Provocação",
      hook: "Audiência pequena, sistema certo. Isso muda tudo.",
      description: "Provocação sobre métricas de vaidade vs métricas de resultado. Seguidores ≠ compradores. Lista de Telegram segmentada > audiência de Instagram genérica. Dados: influencer com 50k faz X de conversão em produto, lista de 500 pessoas no Telegram bem trabalhada faz Y. Mostrar matemática.",
    },
    {
      title: "O funil que converte lista fria em comprador em 72h no Telegram:", channel: "Twitter/X", format: "Thread",
      hook: "3 mensagens. 72 horas. Venda. Vou te mostrar exatamente.",
      description: "Thread revelando o funil de 3 mensagens: Dia 1 (boas-vindas + entrega de valor, sem oferta), Dia 2 (prova social + dor do problema), Dia 3 (oferta + urgência real). Escrever o texto de cada mensagem ou ao menos o esqueleto. Mostrar taxa de conversão esperada. Bot faz tudo automaticamente.",
    },
    {
      title: "Resultado de membro da Capo Community: primeira semana com o bot", channel: "Twitter/X", format: "Print",
      hook: "Ele entrou sem saber nada. Olha o que aconteceu em 7 dias.",
      description: "Case real de membro novo. Print do resultado com autorização. Contexto: qual produto, nicho, tamanho da lista inicial. O que o bot fez. Quanto faturou. Citar o membro (se aceitar). Tom: orgulho genuíno, não marketing. Finalizar convidando outros a entrar na Capo Community.",
    },
    {
      title: "A copy que mais vende no Telegram não é o que você pensa:", channel: "Twitter/X", format: "Thread",
      hook: "Testei 12 modelos diferentes. O que venceu me surpreendeu.",
      description: "Thread de teste A/B de copy. Mostrar 3-4 modelos testados (longa, curta, com emoji, sem emoji, storytelling, direta). Revelar qual converteu mais e por quê. O insight principal: mensagens curtas e diretas com prova social > mensagens longas com gatilhos forçados. Dar o template vencedor.",
    },

    // ── YouTube ──────────────────────────────────────────────────────────────
    {
      title: "Quanto meu bot do Telegram vendeu em 30 dias (mostrando o painel ao vivo)", channel: "YouTube", format: "Bastidor",
      hook: "Tela aberta. Sem corte. Números reais. Nem eu esperava esse resultado.",
      description: "Vídeo de bastidor/transparência. Abrir o painel do Yomescapo ao vivo, mostrar cada venda, data, valor. Calcular total ao vivo. Explicar o que fez em cada semana para gerar os resultados. Mostrar os dias que vendeu menos e o que mudou. Duração: 12-18 min. Thumbnail: print do painel + rosto surpreso.",
    },
    {
      title: "Bot de vendas no Telegram do zero ao primeiro pagamento — passo a passo completo", channel: "YouTube", format: "Tutorial",
      hook: "Do zero. Sem código. Você vai sair desse vídeo com o bot funcionando.",
      description: "Tutorial completo de setup: criar conta Yomescapo → criar bot no BotFather → conectar → configurar produto → escrever mensagens automáticas → fazer compra de teste. Mostrar tela em tempo real. Duração: 20-25 min. Capítulos no vídeo. Prometer resultado concreto na thumbnail: 'Bot funcionando em 30 min'.",
    },
    {
      title: "Por que afiliados falham no Telegram — e como resolvi em 7 dias", channel: "YouTube", format: "Erro",
      hook: "Errei por meses. A resposta era mais simples do que parece.",
      description: "Vídeo de análise de erros comuns: sem sequência de boas-vindas, oferta imediata para lista fria, mensagens genéricas, sem segmentação de compradores. Para cada erro: mostrar o que fazia antes vs o que faz agora. Revelar a mudança que gerou resultado em 7 dias. Duração: 15 min. CTA: link Yomescapo na descrição.",
    },
    {
      title: "Como construir lista de compradores no Telegram sem investir em tráfego", channel: "YouTube", format: "Tutorial",
      hook: "Lista quente. Zero em anúncio. Esse método ninguém está falando.",
      description: "Tutorial de crescimento orgânico: usar Twitter/X, YouTube e grupos de nicho para atrair pessoas para o canal do Telegram. Mostrar os exatos scripts de CTA. Estratégia de conteúdo isca (dar algo grátis para entrar na lista). Como filtrar compradores de curiosos com o bot. Duração: 18 min.",
    },
    {
      title: "Analisei 50 canais de venda no Telegram. O que os que faturam têm em comum:", channel: "YouTube", format: "Case",
      hook: "50 canais. Dados reais. Um padrão que mudou minha estratégia.",
      description: "Vídeo de pesquisa/análise. Mostrar os padrões encontrados nos canais que vendem bem: frequência de postagem, tipo de mensagem (valor vs oferta), uso de prova social, timing das ofertas. Montar um framework baseado nos dados. Duração: 20 min. Thumbnail: '50 canais analisados' com gráfico.",
    },
    {
      title: "Fiquei 7 dias sem postar. Meu Telegram continuou vendendo. Veja como:", channel: "YouTube", format: "Bastidor",
      hook: "7 dias offline. Bot trabalhando. Esse é o número que ficou.",
      description: "Vídeo de prova de automação real. Mostrar o período offline (sem nenhuma mensagem manual). Abrir o painel e mostrar cada venda automática que aconteceu. Explicar qual sequência estava rodando, qual oferta estava ativa. Revelar o número total. Duração: 10-12 min. Thumbnail: calendário riscado + cifrão.",
    },
    {
      title: "Os 5 tipos de mensagem que mais vendem no Telegram em 2026", channel: "YouTube", format: "Tutorial",
      hook: "Tipo 1 triplicou minha conversão. Tipo 4 a maioria ignora.",
      description: "Tutorial de copywriting para Telegram. Os 5 tipos: 1) prova social com número específico, 2) mensagem de dor + solução direta, 3) bastidor/transparência, 4) urgência real (não falsa), 5) oferta de reativação para quem não comprou. Para cada tipo: dar o template + exemplo real + taxa de conversão esperada.",
    },
    {
      title: "Como fazer R$1.000/mês com afiliado no Telegram — guia sem enrolação", channel: "YouTube", format: "Tutorial",
      hook: "Guia real. Sem atalho. Sem guru. Só o que funciona.",
      description: "Guia do zero ao R$1k/mês: escolher produto de afiliado com boa comissão, criar canal no Telegram, configurar bot com Yomescapo, crescer a lista com tráfego orgânico, sequência de mensagens que converte. Mostrar a matemática: precisa de X pessoas na lista com Y% de conversão e Z% de comissão. Duração: 25 min.",
    },
    {
      title: "Revisão ao vivo: bot de inscrito faturando R$X — o que mudei em 20 minutos", channel: "YouTube", format: "Case",
      hook: "3 mudanças. 20 minutos. Resultado que ele mesmo não acreditou.",
      description: "Formato de revisão ao vivo: pegar o bot de um inscrito (com autorização), identificar os problemas ao vivo, fazer as mudanças na frente da câmera, mostrar o resultado depois. As 3 mudanças mais comuns que fazem diferença: reescrever boas-vindas, adicionar prova social, criar sequência de reativação.",
    },
    {
      title: "Telegram vs Instagram para infoproduto: 6 meses de dados reais", channel: "YouTube", format: "Case",
      hook: "6 meses. Dois canais. Um resultado que me surpreendeu.",
      description: "Comparativo de 6 meses vendendo o mesmo produto nos dois canais. Métricas: alcance, taxa de abertura, taxa de clique, taxa de conversão, custo de aquisição, ROI. Mostrar planilha real. Falar honestamente sobre o que cada canal faz melhor. Não é 'X é melhor' — é 'use os dois, mas saiba a diferença'.",
    },
    {
      title: "Canal no Telegram que vende todo dia sem precisar postar todo dia", channel: "YouTube", format: "Tutorial",
      hook: "Última postagem: 4 dias atrás. Canal vendeu hoje. Vou explicar.",
      description: "Tutorial sobre sequências automáticas evergreen. Como configurar no Yomescapo uma sequência de 14-21 dias de mensagens que roda para cada novo assinante automaticamente. Mostrar o setup completo. Explicar a diferença entre broadcast (manual) e sequência (automática). Duração: 20 min.",
    },
    {
      title: "O erro que destrói vendas no Telegram (e como corrigir em 10 minutos)", channel: "YouTube", format: "Erro",
      hook: "10 minutos de ajuste. A diferença aparece no mesmo dia.",
      description: "Vídeo curto e direto (10-12 min). O erro: não ter mensagem de boas-vindas configurada. Quem entra no canal sem boas-vindas vai embora sem comprar. Mostrar como configurar a boas-vindas perfeita no Yomescapo em tempo real. Template da mensagem de boas-vindas que mais converte. CTA forte no final.",
    },
  ];
  for (const idea of ideas) {
    await client.execute({
      sql: `INSERT INTO "ContentIdea" (id, title, channel, format, hook, description, used, createdAt) VALUES (?, ?, ?, ?, ?, ?, 0, ?)`,
      args: [randomUUID(), idea.title, idea.channel, idea.format, idea.hook ?? null, idea.description ?? null, now],
    });
  }
  console.log(`✓ Setup: ${ideas.length} ideias criadas`);
}

console.log(`✓ Setup: ${tasks.length} tarefas criadas para ${week}`);
client.close();
