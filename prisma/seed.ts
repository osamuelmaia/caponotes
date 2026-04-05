import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";
import path from "path";

const dbPath = path.join(process.cwd(), "prisma/yomescapo.db");
const libsql = createClient({ url: `file:${dbPath}` });
const adapter = new PrismaLibSQL(libsql);
const prisma = new PrismaClient({ adapter });

function getCurrentWeek(): string {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = Math.floor(
    (now.getTime() - startOfYear.getTime()) / 86400000
  );
  const weekNumber = Math.ceil((dayOfYear + startOfYear.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${String(weekNumber).padStart(2, "0")}`;
}

const week = getCurrentWeek();

const tasks = [
  // Segunda
  {
    name: "Escrever thread tutorial completa",
    day: "Segunda",
    timeSlot: "9h–10h",
    channels: JSON.stringify(["Twitter/X"]),
    details:
      "8 a 10 tweets. Começa com resultado, depois ensina. Não coloca link no primeiro tweet. Formato: promessa → desenvolvimento → solução → CTA no último tweet.",
    position: 0,
  },
  {
    name: "Revisar e agendar thread para as 19h",
    day: "Segunda",
    timeSlot: "10h–11h",
    channels: JSON.stringify(["Twitter/X"]),
    details:
      "Lê novamente, ajusta o primeiro tweet para ser irresistível, confirma que não tem link no início. Agendar para 19h pelo Twitter.",
    position: 1,
  },
  {
    name: "Escrever dica rápida para o canal do Telegram",
    day: "Segunda",
    timeSlot: "15h–16h30",
    channels: JSON.stringify(["Telegram"]),
    details:
      "Uma coisa concreta que o membro pode aplicar hoje. Máx 5 linhas. Tom direto. Publicar às 20h.",
    position: 2,
  },
  {
    name: "Planejar conteúdo dos próximos 3 dias",
    day: "Segunda",
    timeSlot: "16h30–18h",
    channels: JSON.stringify(["Planejamento"]),
    details:
      "Definir tema de terça, quarta e sexta. Separar prints de resultado de usuários. Anotar o formato vencedor da semana anterior.",
    position: 3,
  },
  {
    name: "Responder dúvidas no Discord — Capo Community",
    day: "Segunda",
    timeSlot: "18h–19h",
    channels: JSON.stringify(["Discord"]),
    details:
      "Mínimo 15 minutos ativos respondendo membros. Verificar canal #resultados e celebrar conquistas. Isso retém usuário.",
    position: 4,
  },

  // Terça
  {
    name: "Gravar vídeo da semana",
    day: "Terça",
    timeSlot: "9h–11h",
    channels: JSON.stringify(["YouTube"]),
    details:
      "Screencast + voz. Estrutura: hook 30s mostrando resultado final → apresentação rápida → tutorial passo a passo numerado → CTA duplo no final. Duração: 8 a 14 minutos.",
    position: 0,
  },
  {
    name: "Editar vídeo",
    day: "Terça",
    timeSlot: "15h–17h",
    channels: JSON.stringify(["YouTube"]),
    details:
      "Cortar silêncios e hesitações, adicionar texto na tela nas etapas numeradas, inserir CTA no final com link de cadastro e menção ao canal do Telegram.",
    position: 1,
  },
  {
    name: "Preparar post de print de resultado",
    day: "Terça",
    timeSlot: "15h–17h",
    channels: JSON.stringify(["Twitter/X"]),
    details:
      "Pegar print real de venda de usuário (pedir autorização). Escrever contexto em 3 tweets: resultado → como configurou → CTA. Agendar para 19h.",
    position: 2,
  },
  {
    name: "Publicar vídeo no YouTube",
    day: "Terça",
    timeSlot: "17h–18h30",
    channels: JSON.stringify(["YouTube"]),
    details:
      "Título começa com 'Como'. Descrição: primeiras 2 linhas = resumo do vídeo + link de cadastro. Tags: bot telegram, vendas telegram, automação telegram.",
    position: 3,
  },
  {
    name: "Publicar case completo no canal Telegram",
    day: "Terça",
    timeSlot: "18h30–19h",
    channels: JSON.stringify(["Telegram"]),
    details:
      "Versão aprofundada do print do Twitter. Mostra fluxo exato, produto vendido, texto das mensagens, resultado em números. Exclusivo aqui — não vai pro Twitter.",
    position: 4,
  },
  {
    name: "Engajar comentários da thread de segunda",
    day: "Terça",
    timeSlot: "18h30–19h",
    channels: JSON.stringify(["Twitter/X"]),
    details:
      "Responder todos os comentários da thread de segunda. Primeiras 48h são críticas para o algoritmo. Responder com conteúdo, não só 'obrigado'.",
    position: 5,
  },

  // Quarta
  {
    name: "Escrever post de erro comum",
    day: "Quarta",
    timeSlot: "9h–10h30",
    channels: JSON.stringify(["Twitter/X"]),
    details:
      "Formato: erro que todo afiliado comete → consequência → como eu resolvi. 3 a 5 tweets com solução prática. Agendar para 19h.",
    position: 0,
  },
  {
    name: "Monitorar métricas da semana",
    day: "Quarta",
    timeSlot: "10h30–11h",
    channels: JSON.stringify(["Planejamento"]),
    details:
      "Ver qual post mais engajou, qual trouxe cadastro, qual vídeo está com mais views. Anotar o formato vencedor para repetir na semana seguinte.",
    position: 1,
  },
  {
    name: "Publicar post de bastidor do produto",
    day: "Quarta",
    timeSlot: "15h–17h",
    channels: JSON.stringify(["Twitter/X"]),
    details:
      "O que está sendo construído, funcionalidade nova, novidade da plataforma. Mostrar por dentro. Publicar às 19h.",
    position: 2,
  },
  {
    name: "Publicar novidade exclusiva no canal Telegram",
    day: "Quarta",
    timeSlot: "15h–17h",
    channels: JSON.stringify(["Telegram"]),
    details:
      "Versão mais detalhada do bastidor. Mencionar: 'isso você viu aqui primeiro'. Criar sensação de exclusividade para quem está no canal.",
    position: 3,
  },
  {
    name: "Interação no Discord + suporte a usuários",
    day: "Quarta",
    timeSlot: "17h–19h",
    channels: JSON.stringify(["Discord"]),
    details:
      "Responder dúvidas técnicas, incentivar membros a postar resultado em #resultados. Se houver usuário com problema, resolver ao vivo.",
    position: 4,
  },

  // Sexta
  {
    name: "Escrever CTA direto para cadastro",
    day: "Sexta",
    timeSlot: "9h–10h",
    channels: JSON.stringify(["Twitter/X"]),
    details:
      "Post curto e direto. 'Grátis. Você só paga quando vende.' Mencionar Capo Community com link escondido nos posts — não na bio, em algum post da semana.",
    position: 0,
  },
  {
    name: "Publicar CTA para Capo Community no Telegram",
    day: "Sexta",
    timeSlot: "10h–11h",
    channels: JSON.stringify(["Telegram"]),
    details:
      "'Capo Community está aberta. Link de acesso em algum post aqui no canal.' Cria curiosidade, faz o membro vasculhar os posts.",
    position: 1,
  },
  {
    name: "Planejar semana seguinte completa",
    day: "Sexta",
    timeSlot: "15h–17h",
    channels: JSON.stringify(["Planejamento"]),
    details:
      "Definir tema de cada dia da próxima semana, separar prints, esboçar roteiro do vídeo da terça. Segunda começa sem precisar pensar — tudo já decidido.",
    position: 2,
  },
  {
    name: "Relatório semanal rápido",
    day: "Sexta",
    timeSlot: "17h–18h30",
    channels: JSON.stringify(["Planejamento"]),
    details:
      "Registrar: novos cadastros, usuários ativos, post que mais converteu, receita da semana, meta para a semana seguinte. Salvar na aba Métricas.",
    position: 3,
  },
  {
    name: "Encerrar semana no Discord",
    day: "Sexta",
    timeSlot: "18h30–19h",
    channels: JSON.stringify(["Discord"]),
    details:
      "Post de encerramento em #anúncios. Celebrar resultado de membro se houver. Deixar a comunidade animada para a semana seguinte.",
    position: 4,
  },

  // Sábado
  {
    name: "Publicar pergunta aberta no canal Telegram",
    day: "Sábado",
    timeSlot: "2h livres",
    channels: JSON.stringify(["Telegram"]),
    details:
      "'Qual sua maior dificuldade para vender no Telegram hoje?' Habilitar comentários só nesse post. Usar as respostas para criar conteúdo da semana seguinte.",
    position: 0,
  },
  {
    name: "Repostar melhor conteúdo da semana",
    day: "Sábado",
    timeSlot: "2h livres",
    channels: JSON.stringify(["Twitter/X"]),
    details:
      "Pegar o post que mais engajou e repostar com um comentário novo em cima acrescentando contexto. Não retweet simples — adiciona valor.",
    position: 1,
  },
  {
    name: "Interação livre no Discord",
    day: "Sábado",
    timeSlot: "2h livres",
    channels: JSON.stringify(["Discord"]),
    details:
      "Sem pressão. Conversa, responde o que tiver pendente, coleta feedback informal dos membros. Perguntar o que gostariam de ver na semana seguinte.",
    position: 2,
  },
];

const ideas = [
  // Twitter/X ideas
  {
    title: "Como eu fiz R$X em Y dias com bot no Telegram",
    channel: "Twitter/X",
    format: "Thread",
    hook: "Eu não sabia nada de programação. Hoje meu bot vende sozinho.",
  },
  {
    title: "7 erros que todo afiliado comete no Telegram",
    channel: "Twitter/X",
    format: "Thread",
    hook: "Erro número 1 já elimina 90% das suas vendas.",
  },
  {
    title: "Print de resultado: R$X em 24h com uma mensagem",
    channel: "Twitter/X",
    format: "Print",
    hook: "Uma mensagem. 24 horas. Esse número.",
  },
  {
    title: "O segredo que as pessoas não contam sobre vender no Telegram",
    channel: "Twitter/X",
    format: "Thread",
    hook: "Todo mundo fala de produto. Ninguém fala disso.",
  },
  {
    title: "Bastidor: o que construímos essa semana no Yomescapo",
    channel: "Twitter/X",
    format: "Bastidor",
    hook: "Olha o que saiu do forno hoje.",
  },
  {
    title: "CTA: Grátis. Você só paga quando vende.",
    channel: "Twitter/X",
    format: "CTA",
    hook: "Grátis. Você só paga quando vende.",
  },
  {
    title: "Como configurar seu primeiro bot de vendas em 30 minutos",
    channel: "Twitter/X",
    format: "Thread",
    hook: "30 minutos. Sem código. Sem servidor.",
  },
  {
    title: "Por que a maioria das pessoas falha vendendo no Telegram",
    channel: "Twitter/X",
    format: "Erro",
    hook: "Não é o produto. Não é o preço.",
  },
  {
    title: "O modelo de mensagem que converte 3x mais",
    channel: "Twitter/X",
    format: "Tutorial",
    hook: "Copiei esse modelo e as vendas triplicaram.",
  },
  {
    title: "Capo Community: resultados dos membros dessa semana",
    channel: "Twitter/X",
    format: "Print",
    hook: "Eles chegaram sem saber nada. Olha onde estão agora.",
  },

  // YouTube ideas
  {
    title: "Como criar um bot de vendas no Telegram do zero",
    channel: "YouTube",
    format: "Tutorial",
    hook: "No final desse vídeo você vai ter um bot funcionando.",
  },
  {
    title: "Como automatizar suas vendas no Telegram em 2025",
    channel: "YouTube",
    format: "Tutorial",
    hook: "Automação que roda enquanto você dorme.",
  },
  {
    title: "Como eu fiz minha primeira venda automática no Telegram",
    channel: "YouTube",
    format: "Tutorial",
    hook: "Do zero à primeira venda em menos de 1 semana.",
  },
  {
    title: "Como configurar pagamento automático no Telegram",
    channel: "YouTube",
    format: "Tutorial",
    hook: "Cliente paga, recebe acesso, você não faz nada.",
  },
  {
    title: "Como criar uma lista VIP no Telegram que realmente vende",
    channel: "YouTube",
    format: "Tutorial",
    hook: "Lista VIP não é grupo. É sistema.",
  },
  {
    title: "O funil de vendas que usei para fazer R$X no Telegram",
    channel: "YouTube",
    format: "Tutorial",
    hook: "Esse funil tem 3 etapas. Deixa eu te mostrar.",
  },
  {
    title: "Como fazer copy para Telegram que converte",
    channel: "YouTube",
    format: "Tutorial",
    hook: "A maioria das mensagens está errada. Veja o certo.",
  },
  {
    title: "Revisão ao vivo: bot de membro da Capo Community",
    channel: "YouTube",
    format: "Tutorial",
    hook: "Peguei o bot de um membro e melhorei ao vivo.",
  },
  {
    title: "Como usar o Yomescapo para vender todo dia",
    channel: "YouTube",
    format: "Tutorial",
    hook: "Tour completo pela plataforma.",
  },
  {
    title: "Erros que destroem suas vendas no Telegram",
    channel: "YouTube",
    format: "Tutorial",
    hook: "Eu cometi todos esses erros. Você não precisa.",
  },
  {
    title: "Como escalar vendas no Telegram sem trabalhar mais",
    channel: "YouTube",
    format: "Tutorial",
    hook: "Mais vendas. Menos trabalho. É possível.",
  },
  {
    title: "Resultados reais de membros da Capo Community",
    channel: "YouTube",
    format: "Tutorial",
    hook: "Eles entraram do zero. Esses são os números deles.",
  },
];

async function main() {
  console.log("Limpando banco de dados...");
  await prisma.task.deleteMany();
  await prisma.contentIdea.deleteMany();

  console.log(`Criando tarefas para semana ${week}...`);
  for (const task of tasks) {
    await prisma.task.create({ data: { ...task, week } });
  }

  console.log("Criando banco de ideias...");
  for (const idea of ideas) {
    await prisma.contentIdea.create({ data: idea });
  }

  console.log(`✓ ${tasks.length} tarefas criadas`);
  console.log(`✓ ${ideas.length} ideias criadas`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
