import { GameMetrics } from "../types";

// Frases para pontuação baixa (< 1000)
const LOW_SCORE_PHRASES = [
  "Cadete, isso foi vergonhoso. Volte para a academia.",
  "Perdemos a nave por incompetência sua. Relatório enviado ao comando.",
  "Seus reflexos são lentos demais para esta frota. Melhore.",
  "A frota não precisa de pilotos que morrem na primeira onda.",
  "Patético. Apenas patético.",
  "O simulador estava no modo fácil e você ainda falhou.",
  "Gastamos milhões nessa nave para você batê-la assim?",
  "Sua licença de piloto foi revogada temporariamente.",
  "Foi um erro te colocar no cockpit.",
  "Tente abrir os olhos na próxima vez, piloto."
];

// Frases para pontuação média (1000 - 5000)
const MEDIUM_SCORE_PHRASES = [
  "Nada mal, piloto. Mas o inimigo ainda avança.",
  "Bom trabalho, mas esperávamos mais resistência.",
  "Desempenho aceitável. A galáxia sobrevive mais um dia.",
  "Você tem potencial, mas precisa de mais foco nos flancos.",
  "Combate encerrado. Relatório inconclusivo.",
  "Bela pontaria, mas a esquiva precisa melhorar.",
  "Não foi um desastre total, o que já é um avanço.",
  "Missão cumprida, mas com ressalvas.",
  "Sólido. Não espetacular, mas sólido.",
  "Você viveu para lutar outro dia. É o que importa."
];

// Frases para pontuação alta (> 5000)
const HIGH_SCORE_PHRASES = [
  "Excelente trabalho, ás! O comando estelar te saúda.",
  "Incrível! Você é a última esperança da humanidade.",
  "Sua mira é lendária. Os inimigos tremem diante da sua nave.",
  "Promoção iminente. Continue assim, comandante.",
  "Uma exibição magistral de superioridade aérea.",
  "Os bardos cantarão canções sobre essa batalha.",
  "A frota inimiga foi dizimada. Ótimo trabalho.",
  "Nunca vi um piloto manobrar assim antes.",
  "Você fez parecer fácil. Impressionante.",
  "Medalha de Honra garantida após essa performance."
];

// Frases de início de onda
const WAVE_PHRASES = [
  "Detectando assinaturas de calor múltiplas.",
  "Prepare-se, nova frota inimiga chegando.",
  "Sensores indicam hostis se aproximando rapidamente.",
  "Eles não desistem. Mantenha a formação.",
  "Alerta vermelho! Inimigos no radar.",
  "O enxame se aproxima. Armas prontas.",
  "Cuidado com os flancos, piloto."
];

const getRandomPhrase = (list: string[]) => {
  return list[Math.floor(Math.random() * list.length)];
};

export const generateBattleReport = async (metrics: GameMetrics): Promise<string> => {
  // Simula um pequeno atraso para dar um efeito dramático de "recebendo transmissão"
  await new Promise(resolve => setTimeout(resolve, 600));

  if (metrics.score < 1000) {
    return getRandomPhrase(LOW_SCORE_PHRASES);
  } else if (metrics.score < 5000) {
    return getRandomPhrase(MEDIUM_SCORE_PHRASES);
  } else {
    return getRandomPhrase(HIGH_SCORE_PHRASES);
  }
};

export const generateWaveIntel = async (wave: number): Promise<string> => {
  return getRandomPhrase(WAVE_PHRASES);
};