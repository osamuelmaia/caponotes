import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

function getCurrentWeek(): string {
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / 86400000)
  const weekNumber = Math.ceil((dayOfYear + startOfYear.getDay() + 1) / 7)
  return `${now.getFullYear()}-W${String(weekNumber).padStart(2, "0")}`
}

const week = getCurrentWeek()

const tasks = [
  { name: "Escrever thread tutorial completa", day: "Segunda", timeSlot: "9h–10h", channels: JSON.stringify(["Twitter/X"]), details: "8 a 10 tweets. Começa com resultado, depois ensina. Não coloca link no primeiro tweet. Formato: promessa → desenvolvimento → solução → CTA no último tweet.", position: 0 },
  { name: "Revisar e agendar thread para as 19h", day: "Segunda", timeSlot: "10h–11h", channels: JSON.stringify(["Twitter/X"]), details: "Lê novamente, ajusta o primeiro tweet para ser irresistível, confirma que não tem link no início. Agendar para 19h pelo Twitter.", position: 1 },
  { name: "Escrever dica rápida para o canal do Telegram", day: "Segunda", timeSlot: "15h–16h30", channels: JSON.stringify(["Telegram"]), details: "Uma coisa concreta que o membro pode aplicar hoje. Máx 5 linhas. Tom direto. Publicar às 20h.", position: 2 },
  { name: "Planejar conteúdo dos próximos 3 dias", day: "Segunda", timeSlot: "16h30–18h", channels: JSON.stringify(["Planejamento"]), details: "Definir tema de terça, quarta e sexta. Separar prints de resultado de usuários. Anotar o formato vencedor da semana anterior.", position: 3 },
  { name: "Responder dúvidas no Discord — Capo Community", day: "Segunda", timeSlot: "18h–19h", channels: JSON.stringify(["Discord"]), details: "Mínimo 15 minutos ativos respondendo membros. Verificar canal #resultados e celebrar conquistas. Isso retém usuário.", position: 4 },
  { name: "Gravar vídeo da semana", day: "Terça", timeSlot: "9h–11h", channels: JSON.stringify(["YouTube"]), details: "Screencast + voz. Estrutura: hook 30s mostrando resultado final → apresentação rápida → tutorial passo a passo numerado → CTA duplo no final. Duração: 8 a 14 minutos.", position: 0 },
  { name: "Editar vídeo", day: "Terça", timeSlot: "15h–17h", channels: JSON.stringify(["YouTube"]), details: "Cortar silêncios e hesitações, adicionar texto na tela nas etapas numeradas, inserir CTA no final com link de cadastro e menção ao canal do Telegram.", position: 1 },
  { name: "Preparar post de print de resultado", day: "Terça", timeSlot: "15h–17h", channels: JSON.stringify(["Twitter/X"]), details: "Pegar print real de venda de usuário (pedir autorização). Escrever contexto em 3 tweets: resultado → como configurou → CTA. Agendar para 19h.", position: 2 },
  { name: "Publicar vídeo no YouTube", day: "Terça", timeSlot: "17h–18h30", channels: JSON.stringify(["YouTube"]), details: "Título começa com 'Como'. Descrição: primeiras 2 linhas = resumo do vídeo + link de cadastro. Tags: bot telegram, vendas telegram, automação telegram.", position: 3 },
  { name: "Publicar case completo no canal Telegram", day: "Terça", timeSlot: "18h30–19h", channels: JSON.stringify(["Telegram"]), details: "Versão aprofundada do print do Twitter. Mostra fluxo exato, produto vendido, texto das mensagens, resultado em números. Exclusivo aqui — não vai pro Twitter.", position: 4 },
  { name: "Engajar comentários da thread de segunda", day: "Terça", timeSlot: "18h30–19h", channels: JSON.stringify(["Twitter/X"]), details: "Responder todos os comentários da thread de segunda. Primeiras 48h são críticas para o algoritmo. Responder com conteúdo, não só 'obrigado'.", position: 5 },
  { name: "Escrever post de erro comum", day: "Quarta", timeSlot: "9h–10h30", channels: JSON.stringify(["Twitter/X"]), details: "Formato: erro que todo afiliado comete → consequência → como eu resolvi. 3 a 5 tweets com solução prática. Agendar para 19h.", position: 0 },
  { name: "Monitorar métricas da semana", day: "Quarta", timeSlot: "10h30–11h", channels: JSON.stringify(["Planejamento"]), details: "Ver qual post mais engajou, qual trouxe cadastro, qual vídeo está com mais views. Anotar o formato vencedor para repetir na semana seguinte.", position: 1 },
  { name: "Publicar post de bastidor do produto", day: "Quarta", timeSlot: "15h–17h", channels: JSON.stringify(["Twitter/X"]), details: "O que está sendo construído, funcionalidade nova, novidade da plataforma. Mostrar por dentro. Publicar às 19h.", position: 2 },
  { name: "Publicar novidade exclusiva no canal Telegram", day: "Quarta", timeSlot: "15h–17h", channels: JSON.stringify(["Telegram"]), details: "Versão mais detalhada do bastidor. Mencionar: 'isso você viu aqui primeiro'. Criar sensação de exclusividade para quem está no canal.", position: 3 },
  { name: "Interação no Discord + suporte a usuários", day: "Quarta", timeSlot: "17h–19h", channels: JSON.stringify(["Discord"]), details: "Responder dúvidas técnicas, incentivar membros a postar resultado em #resultados. Se houver usuário com problema, resolver ao vivo.", position: 4 },
  { name: "Escrever CTA direto para cadastro", day: "Sexta", timeSlot: "9h–10h", channels: JSON.stringify(["Twitter/X"]), details: "Post curto e direto. 'Grátis. Você só paga quando vende.' Mencionar Capo Community com link escondido nos posts — não na bio, em algum post da semana.", position: 0 },
  { name: "Publicar CTA para Capo Community no Telegram", day: "Sexta", timeSlot: "10h–11h", channels: JSON.stringify(["Telegram"]), details: "'Capo Community está aberta. Link de acesso em algum post aqui no canal.' Cria curiosidade, faz o membro vasculhar os posts.", position: 1 },
  { name: "Planejar semana seguinte completa", day: "Sexta", timeSlot: "15h–17h", channels: JSON.stringify(["Planejamento"]), details: "Definir tema de cada dia da próxima semana, separar prints, esboçar roteiro do vídeo da terça. Segunda começa sem precisar pensar — tudo já decidido.", position: 2 },
  { name: "Relatório semanal rápido", day: "Sexta", timeSlot: "17h–18h30", channels: JSON.stringify(["Planejamento"]), details: "Registrar: novos cadastros, usuários ativos, post que mais converteu, receita da semana, meta para a semana seguinte. Salvar na aba Métricas.", position: 3 },
  { name: "Encerrar semana no Discord", day: "Sexta", timeSlot: "18h30–19h", channels: JSON.stringify(["Discord"]), details: "Post de encerramento em #anúncios. Celebrar resultado de membro se houver. Deixar a comunidade animada para a semana seguinte.", position: 4 },
  { name: "Publicar pergunta aberta no canal Telegram", day: "Sábado", timeSlot: "2h livres", channels: JSON.stringify(["Telegram"]), details: "'Qual sua maior dificuldade para vender no Telegram hoje?' Habilitar comentários só nesse post. Usar as respostas para criar conteúdo da semana seguinte.", position: 0 },
  { name: "Repostar melhor conteúdo da semana", day: "Sábado", timeSlot: "2h livres", channels: JSON.stringify(["Twitter/X"]), details: "Pegar o post que mais engajou e repostar com um comentário novo em cima acrescentando contexto. Não retweet simples — adiciona valor.", position: 1 },
  { name: "Interação livre no Discord", day: "Sábado", timeSlot: "2h livres", channels: JSON.stringify(["Discord"]), details: "Sem pressão. Conversa, responde o que tiver pendente, coleta feedback informal dos membros. Perguntar o que gostariam de ver na semana seguinte.", position: 2 },
]

const ideas = [
  // Twitter/X
  { title: "Meu bot vendeu R$847 enquanto eu dormia — mostrando a tela", channel: "Twitter/X", format: "Print", hook: "Acordei, vi esse número. Aqui está cada passo de como configurei." },
  { title: "Afiliado gasta 4h/dia respondendo DM. Eu gasto 0. A diferença é essa:", channel: "Twitter/X", format: "Provocação", hook: "Você ainda vende no grito? Para e lê isso." },
  { title: "R$3.200 num final de semana. Canal no Telegram. Sem anúncio. Explico como.", channel: "Twitter/X", format: "Print", hook: "Print real. Método real. Thread completa." },
  { title: "9 em cada 10 afiliados erra isso no Telegram. Você provavelmente também:", channel: "Twitter/X", format: "Thread", hook: "Errei por meses sem perceber. Quando entendi, mudou tudo." },
  { title: "Criei um canal no Telegram do zero. 90 dias depois, vende sozinho. O que aprendi:", channel: "Twitter/X", format: "Thread", hook: "Dados reais de 90 dias. Sem omitir os erros." },
  { title: "Instagram, TikTok, YouTube. Todo mundo briga por atenção lá. O Telegram está vazio. Eu estou lá.", channel: "Twitter/X", format: "Provocação", hook: "A mina de ouro que os grandes ignoram." },
  { title: "Como configurei meu bot de vendas em 37 minutos sem uma linha de código:", channel: "Twitter/X", format: "Tutorial", hook: "Printei cada passo. Thread completa com prints reais." },
  { title: "Perdi 8 meses tentando vender no Telegram. O erro era ridículo de simples:", channel: "Twitter/X", format: "Erro", hook: "Se você ainda faz isso, para agora e lê até o fim." },
  { title: "Você vende na força bruta. Eu automatizei tudo. Grátis pra começar.", channel: "Twitter/X", format: "CTA", hook: "Testa antes de me chamar de mentiroso. Só pago quando vendo." },
  { title: "Minha semana vendendo no Telegram com automação — números reais:", channel: "Twitter/X", format: "Bastidor", hook: "Segunda. Bot vendeu 3x enquanto eu fazia outras coisas." },
  { title: "Com 200 seguidores e um bot, fiz mais do que influencer com 50k. O que ninguém conta:", channel: "Twitter/X", format: "Provocação", hook: "Audiência pequena, sistema certo. Isso muda tudo." },
  { title: "O funil que converte lista fria em comprador em 72h no Telegram:", channel: "Twitter/X", format: "Thread", hook: "3 mensagens. 72 horas. Venda. Vou te mostrar exatamente." },
  { title: "Resultado de membro da Capo Community: primeira semana com o bot", channel: "Twitter/X", format: "Print", hook: "Ele entrou sem saber nada. Olha o que aconteceu em 7 dias." },
  { title: "A copy que mais vende no Telegram não é o que você pensa:", channel: "Twitter/X", format: "Thread", hook: "Testei 12 modelos diferentes. O que venceu me surpreendeu." },
  // YouTube
  { title: "Quanto meu bot do Telegram vendeu em 30 dias (mostrando o painel ao vivo)", channel: "YouTube", format: "Bastidor", hook: "Tela aberta. Sem corte. Números reais. Nem eu esperava esse resultado." },
  { title: "Bot de vendas no Telegram do zero ao primeiro pagamento — passo a passo completo", channel: "YouTube", format: "Tutorial", hook: "Do zero. Sem código. Você vai sair desse vídeo com o bot funcionando." },
  { title: "Por que afiliados falham no Telegram — e como resolvi em 7 dias", channel: "YouTube", format: "Erro", hook: "Errei por meses. A resposta era mais simples do que parece." },
  { title: "Como construir lista de compradores no Telegram sem investir em tráfego", channel: "YouTube", format: "Tutorial", hook: "Lista quente. Zero em anúncio. Esse método ninguém está falando." },
  { title: "Analisei 50 canais de venda no Telegram. O que os que faturam têm em comum:", channel: "YouTube", format: "Case", hook: "50 canais. Dados reais. Um padrão que mudou minha estratégia." },
  { title: "Fiquei 7 dias sem postar. Meu Telegram continuou vendendo. Veja como:", channel: "YouTube", format: "Bastidor", hook: "7 dias offline. Bot trabalhando. Esse é o número que ficou." },
  { title: "Os 5 tipos de mensagem que mais vendem no Telegram em 2026", channel: "YouTube", format: "Tutorial", hook: "Tipo 1 triplicou minha conversão. Tipo 4 a maioria ignora." },
  { title: "Como fazer R$1.000/mês com afiliado no Telegram — guia sem enrolação", channel: "YouTube", format: "Tutorial", hook: "Guia real. Sem atalho. Sem guru. Só o que funciona." },
  { title: "Revisão ao vivo: bot de inscrito faturando R$X — o que mudei em 20 minutos", channel: "YouTube", format: "Case", hook: "3 mudanças. 20 minutos. Resultado que ele mesmo não acreditou." },
  { title: "Telegram vs Instagram para infoproduto: 6 meses de dados reais", channel: "YouTube", format: "Case", hook: "6 meses. Dois canais. Um resultado que me surpreendeu." },
  { title: "Canal no Telegram que vende todo dia sem precisar postar todo dia", channel: "YouTube", format: "Tutorial", hook: "Última postagem: 4 dias atrás. Canal vendeu hoje. Vou explicar." },
  { title: "O erro que destrói vendas no Telegram (e como corrigir em 10 minutos)", channel: "YouTube", format: "Erro", hook: "10 minutos de ajuste. A diferença aparece no mesmo dia." },
]

export async function GET() {
  try {
    const existing = await prisma.task.count()
    if (existing > 0) {
      return NextResponse.json({ message: "Banco já populado", tasks: existing })
    }

    for (const task of tasks) {
      await prisma.task.create({ data: { ...task, week } })
    }
    for (const idea of ideas) {
      await prisma.contentIdea.create({ data: idea })
    }

    return NextResponse.json({ ok: true, tasks: tasks.length, ideas: ideas.length, week })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
