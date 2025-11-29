import React, { useState, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import { GameState, GameMetrics } from './types';
import { generateBattleReport } from './services/geminiService';

// Simple Icon Components
const ShipIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-400 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 22h20L12 2z" />
    <path d="M12 10v12" />
  </svg>
);

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [metrics, setMetrics] = useState<GameMetrics | null>(null);
  const [aiReport, setAiReport] = useState<string>('');
  const [loadingReport, setLoadingReport] = useState(false);

  const handleGameOver = async (finalMetrics: GameMetrics) => {
    setMetrics(finalMetrics);
    setGameState(GameState.GAME_OVER);
    
    // Fetch AI Report
    setLoadingReport(true);
    setAiReport('');
    const report = await generateBattleReport(finalMetrics);
    setAiReport(report);
    setLoadingReport(false);
  };

  const startGame = () => {
    setGameState(GameState.PLAYING);
    setMetrics(null);
    setAiReport('');
  };

  return (
    <div className="w-full h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden font-mono">
      {/* Scanline Overlay */}
      <div className="scanline pointer-events-none"></div>

      {/* Main Game Canvas */}
      <div className="absolute inset-0 z-0">
        <GameCanvas 
          gameState={gameState} 
          setGameState={setGameState} 
          onGameOver={handleGameOver}
        />
      </div>

      {/* Menus Overlay */}
      {gameState !== GameState.PLAYING && (
        <div className="absolute z-10 bg-slate-900/90 border border-slate-700 p-8 rounded-lg shadow-2xl backdrop-blur-sm max-w-md w-full text-center mx-4">
          
          {gameState === GameState.MENU && (
            <div>
              <ShipIcon />
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
                GUARDIÃO ESTELAR
              </h1>
              <div className="flex items-center justify-center gap-2 mb-8">
                <span className="text-slate-400 text-sm tracking-wider">DEFESA ORBITAL</span>
                <span className="bg-yellow-500/20 text-yellow-300 text-xs px-2 py-0.5 rounded border border-yellow-500/50 font-bold">v1.0</span>
              </div>
              
              <div className="space-y-4">
                <p className="text-xs text-slate-500 mb-4">
                  USE [←][→] PARA MOVER <br/>
                  [ESPAÇO] PARA ATIRAR
                </p>
                <button 
                  onClick={startGame}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded transition-all transform hover:scale-105 active:scale-95 border-b-4 border-blue-800"
                >
                  INICIAR MISSÃO
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-800/50">
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Créditos</p>
                <p className="text-sm text-slate-300">Desenvolvimento & Design</p>
                <p className="text-lg text-white font-bold my-1">Alves</p>
                <p className="text-xs text-blue-400 mt-1">Sistema Tático Offline</p>
              </div>
            </div>
          )}

          {gameState === GameState.GAME_OVER && metrics && (
            <div>
              <h2 className="text-3xl font-bold text-red-500 mb-2 animate-pulse">SINAL PERDIDO</h2>
              <div className="grid grid-cols-2 gap-4 my-6 text-left bg-slate-800/50 p-4 rounded">
                <div>
                  <p className="text-xs text-slate-500">PONTUAÇÃO</p>
                  <p className="text-xl text-white">{metrics.score}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">ONDA</p>
                  <p className="text-xl text-yellow-400">{metrics.wave}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">ABATES</p>
                  <p className="text-xl text-green-400">{metrics.enemiesDestroyed}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">PRECISÃO</p>
                  <p className="text-xl text-blue-400">{Math.floor(metrics.accuracy * 100)}%</p>
                </div>
              </div>

              {/* AI Analysis Section */}
              <div className="mb-6 bg-black/40 p-4 rounded border-l-4 border-purple-500 text-left min-h-[80px]">
                <p className="text-xs text-purple-400 font-bold mb-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping"></span>
                  ANÁLISE DO COMANDO
                </p>
                {loadingReport ? (
                  <p className="text-sm text-slate-400 animate-pulse">Recebendo transmissão encriptada...</p>
                ) : (
                  <p className="text-sm text-slate-300 italic">"{aiReport}"</p>
                )}
              </div>

              <button 
                onClick={startGame}
                className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded transition-all transform hover:scale-105 active:scale-95 border-b-4 border-green-800"
              >
                REINICIAR SISTEMAS
              </button>
            </div>
          )}
        </div>
      )}

      <div className="absolute top-4 right-4 z-20 hidden md:block">
        <div className="text-right">
          <p className="text-xs text-slate-500">SISTEMA: ONLINE</p>
          <p className="text-xs text-slate-500">VERSÃO: 1.0</p>
        </div>
      </div>
    </div>
  );
};

export default App;