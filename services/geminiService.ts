import { GoogleGenAI } from "@google/genai";
import { GameMetrics } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateBattleReport = async (metrics: GameMetrics): Promise<string> => {
  if (!apiKey) {
    return "Conexão com o Comando Estelar perdida. (API Key não configurada)";
  }

  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      Você é um Almirante de Frota espacial sci-fi sério e cínico.
      O piloto acabou de perder sua nave em combate.
      Analise os seguintes dados e dê um feedback curto (máximo 2 frases) e intenso em Português.
      
      Dados da Missão:
      - Pontuação Final: ${metrics.score}
      - Onda Alcançada: ${metrics.wave}
      - Inimigos Destruídos: ${metrics.enemiesDestroyed}
      - Precisão de Tiro: ${Math.floor(metrics.accuracy * 100)}%
      
      Se a pontuação for baixa (<1000), seja duro. Se for alta (>5000), elogie com ressalvas.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text || "Relatório de dados corrompido.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Falha na comunicação subespacial. Tente novamente.";
  }
};

export const generateWaveIntel = async (wave: number): Promise<string> => {
  if (!apiKey) return "Sensores offline.";
  
  try {
     const model = 'gemini-2.5-flash';
     const prompt = `
      Gere um aviso tático muito curto (uma frase) estilo sci-fi militar em Português para o início da Onda ${wave} de uma invasão alienígena.
      Exemplo: "Detectando assinaturas de calor múltiplas no setor 7."
     `;
     
     const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text || "Inimigos detectados.";
  } catch (error) {
    return "Cuidado piloto, eles estão vindo.";
  }
}