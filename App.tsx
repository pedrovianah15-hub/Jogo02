import React, { useState, useEffect } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { Button } from './components/Button';
import { getGameOverCommentary, getGameLore } from './services/geminiService';
import { GameState, ObstacleType } from './types';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [score, setScore] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [aiMessage, setAiMessage] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [newRecord, setNewRecord] = useState(false);
  const [lore, setLore] = useState<string>('');

  // Training Mode State
  const [trainingConfig, setTrainingConfig] = useState<ObstacleType[]>([ObstacleType.NORMAL]);
  const [isTrainingMode, setIsTrainingMode] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('arrowDodgeHighScore');
    if (stored) {
      setHighScore(parseInt(stored, 10));
    }

    // Carregar história
    const fetchLore = async () => {
      const story = await getGameLore();
      setLore(story);
    };
    fetchLore();
  }, []);

  const handleGameOver = async (scoreResult: number) => {
    setFinalScore(scoreResult);
    
    // Don't save record in training mode
    let isRecord = false;
    if (!isTrainingMode && scoreResult > highScore) {
      setHighScore(scoreResult);
      localStorage.setItem('arrowDodgeHighScore', scoreResult.toString());
      isRecord = true;
      setNewRecord(true);
    } else {
      setNewRecord(false);
    }

    setLoadingAi(true);
    setAiMessage('A IA está analisando seu desempenho...');
    
    const commentary = await getGameOverCommentary(scoreResult, isRecord);
    setAiMessage(commentary);
    setLoadingAi(false);
  };

  const startArcadeGame = () => {
    setIsTrainingMode(false);
    setGameState(GameState.PLAYING);
    setScore(0);
    setAiMessage('');
    setNewRecord(false);
  };

  const startTrainingGame = () => {
    if (trainingConfig.length === 0) {
      alert("Selecione pelo menos um obstáculo!");
      return;
    }
    setIsTrainingMode(true);
    setGameState(GameState.PLAYING);
    setScore(0);
    setAiMessage('');
    setNewRecord(false);
  };

  const toggleTrainingObstacle = (type: ObstacleType) => {
    setTrainingConfig(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  const goToTrainingMenu = () => {
    setGameState(GameState.TRAINING_MENU);
  }

  const goToMenu = () => {
    setGameState(GameState.MENU);
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 font-sans">
      <div className="relative w-full max-w-4xl">
        {/* Header / Score HUD */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10 pointer-events-none">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-white tracking-widest uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
              RUSH <span className="text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">ARROW</span>
            </h1>
            <div className="text-xs text-slate-400 font-mono mt-1">
              RECORDE: <span className="text-yellow-400 text-lg drop-shadow-[0_0_5px_rgba(250,204,21,0.8)]">{highScore}</span>
            </div>
            {isTrainingMode && (
              <div className="bg-purple-600/50 text-purple-100 text-xs px-2 py-1 rounded mt-1 w-fit border border-purple-400/50">
                MODO TREINO
              </div>
            )}
          </div>
          
          {gameState === GameState.PLAYING && (
            <div className="flex flex-col items-end">
              <div className={`text-4xl font-mono font-bold drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] transition-colors duration-300 ${score > highScore && highScore > 0 && !isTrainingMode ? 'text-yellow-400 animate-pulse' : 'text-white'}`}>
                {score.toString().padStart(6, '0')}
              </div>
            </div>
          )}
        </div>

        {/* Game Canvas */}
        <GameCanvas 
          gameState={gameState} 
          setGameState={setGameState} 
          onScoreUpdate={setScore}
          onGameOver={handleGameOver}
          highScore={highScore}
          isTrainingMode={isTrainingMode}
          allowedObstacles={trainingConfig}
        />

        {/* Start Menu Overlay */}
        {gameState === GameState.MENU && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-center rounded-lg p-8 z-20">
            <div className="mb-8 p-6 border-4 border-cyan-500 rounded-full w-32 h-32 flex items-center justify-center shadow-[0_0_50px_rgba(34,211,238,0.6)] animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,1)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </div>
            <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-2 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">RUSH ARROW</h2>
            
            {/* Dynamic Lore Section */}
            <div className="max-w-md w-full mb-8 bg-slate-900/50 border border-slate-700 p-4 rounded text-left font-mono text-xs relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-1">
                 <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
               </div>
               <p className="text-slate-500 uppercase text-[10px] mb-1">Intercepting Transmission...</p>
               <p className="text-cyan-300 leading-relaxed typewriter">
                 {lore ? `> ${lore}` : "> DECODIFICANDO SINAL..."}
               </p>
            </div>

            <div className="flex gap-4 mb-2 text-sm font-mono text-cyan-200/70 tracking-widest">
              <span>NEON SPEED</span> • <span>REFLEXOS</span> • <span>CYBERPUNK</span>
            </div>
            
            <div className="flex flex-col gap-4 w-64">
              <Button onClick={startArcadeGame} className="bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.6)] border border-cyan-400">
                ARCADE MODE
              </Button>
              <Button onClick={goToTrainingMenu} className="bg-transparent border border-purple-500 text-purple-400 hover:bg-purple-900/30 hover:text-white hover:shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                CAMPO DE TREINO
              </Button>
            </div>
          </div>
        )}

        {/* Training Menu Overlay */}
        {gameState === GameState.TRAINING_MENU && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center text-center rounded-lg p-8 z-20">
             <h2 className="text-3xl font-black text-purple-400 mb-2 uppercase tracking-widest drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]">Configurar Treino</h2>
             <p className="text-slate-400 mb-8 text-sm">Selecione os obstáculos que deseja enfrentar</p>
             
             <div className="grid grid-cols-2 gap-4 mb-8 w-full max-w-md">
                {[
                  { id: ObstacleType.NORMAL, label: 'NORMAL', color: 'border-slate-400' },
                  { id: ObstacleType.SINE, label: 'CURVAS', color: 'border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.4)]' },
                  { id: ObstacleType.DIAGONAL, label: 'DIAGONAL', color: 'border-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.4)]' },
                  { id: ObstacleType.CHASER, label: 'PERSEGUIDOR', color: 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]' },
                  { id: ObstacleType.ZIGZAG, label: 'ZIG-ZAG', color: 'border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]' },
                  { id: ObstacleType.PULSING, label: 'PULSANTE', color: 'border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => toggleTrainingObstacle(opt.id)}
                    className={`
                      p-3 rounded-xl border-2 transition-all duration-200 font-bold text-xs sm:text-sm uppercase
                      ${trainingConfig.includes(opt.id) 
                        ? `bg-slate-800 text-white ${opt.color} scale-105` 
                        : 'bg-transparent text-slate-600 border-slate-700 hover:border-slate-500'}
                    `}
                  >
                    {opt.label}
                  </button>
                ))}
             </div>

             <div className="flex gap-4">
                <Button onClick={goToMenu} className="bg-slate-700 hover:bg-slate-600 text-white">
                  VOLTAR
                </Button>
                <Button onClick={startTrainingGame} className="bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_20px_rgba(147,51,234,0.6)] disabled:opacity-50" disabled={trainingConfig.length === 0}>
                  INICIAR TREINO
                </Button>
             </div>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState === GameState.GAME_OVER && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center text-center rounded-lg p-6 z-20 animate-fadeIn border-2 border-red-900/30">
            
            {newRecord && !isTrainingMode && (
              <div className="absolute top-10 animate-bounce">
                <span className="text-4xl">👑</span>
                <span className="block text-yellow-400 font-black text-2xl tracking-widest drop-shadow-lg">NOVO RECORDE!</span>
              </div>
            )}

            <h2 className="text-6xl font-black text-red-600 mb-2 drop-shadow-[0_0_20px_rgba(220,38,38,0.8)] tracking-tighter">CRASHED</h2>
            <p className="text-slate-300 text-xl mb-6">
              Pontuação: <span className={`font-mono font-bold text-2xl ${newRecord ? 'text-yellow-400' : 'text-white'}`}>{finalScore}</span>
            </p>
            
            <div className={`bg-slate-900 border p-6 rounded-xl max-w-lg w-full mb-8 relative overflow-hidden transition-all duration-500 ${newRecord ? 'border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.3)]' : 'border-slate-700 shadow-[0_0_15px_rgba(0,0,0,0.5)]'}`}>
               <div className={`absolute top-0 left-0 w-1 h-full ${newRecord ? 'bg-yellow-400' : 'bg-gradient-to-b from-purple-600 to-pink-600'}`}></div>
               <p className="text-xs uppercase text-slate-500 font-bold tracking-widest mb-2 flex items-center gap-2">
                 <span className={`w-2 h-2 rounded-full ${loadingAi ? 'bg-cyan-400 animate-ping' : 'bg-green-400 shadow-[0_0_5px_rgba(74,222,128,0.8)]'}`}></span>
                 Comentário da IA
               </p>
               <p className={`text-lg italic leading-relaxed ${loadingAi ? 'text-slate-500' : newRecord ? 'text-yellow-100' : 'text-purple-100'}`}>
                 "{aiMessage}"
               </p>
            </div>

            <div className="flex flex-col gap-3 w-64">
              <Button onClick={isTrainingMode ? startTrainingGame : startArcadeGame} className="bg-white hover:bg-slate-200 text-slate-900 text-xl shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                TENTAR NOVAMENTE
              </Button>
              <Button onClick={goToMenu} className="bg-transparent border border-slate-600 text-slate-400 hover:text-white hover:border-white">
                MENU PRINCIPAL
              </Button>
            </div>
          </div>
        )}
      </div>

      <footer className="mt-8 text-slate-600 text-xs flex gap-4 uppercase tracking-widest font-mono">
        <span>🖱️ Mouse/Touch para mover</span>
        <span>⚡ Evite Colisão</span>
      </footer>
    </div>
  );
};

export default App;