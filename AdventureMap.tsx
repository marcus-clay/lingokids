import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Star, Lock, MapPin, ChevronLeft, Settings, Gift } from 'lucide-react';

// --- TYPES ---
type LevelStatus = 'locked' | 'active' | 'completed';

interface LevelData {
  id: number;
  status: LevelStatus;
  stars: number; // 0 à 3
  type: 'normal' | 'boss' | 'chest';
}

// --- CONSTANTES DE CONFIGURATION ---
const CONFIG = {
  levelHeight: 120, // Distance verticale entre les niveaux
  amplitude: 100,   // Amplitude de la courbe sinusoïdale (largeur du virage)
  frequency: 0.8,   // Fréquence de la courbe
  pathWidth: 40,    // Largeur du chemin SVG
  colors: {
    path: '#e2e8f0',
    pathActive: '#fbbf24',
    bg: '#f0f9ff', // Ciel très clair
  }
};

// --- UTILITAIRES MATHÉMATIQUES ---

/**
 * Calcule la position X d'un niveau basé sur une onde sinusoïdale
 * pour créer l'effet de chemin serpentin.
 */
const getPosition = (index: number) => {
  // On inverse l'index pour commencer du bas si nécessaire,
  // mais ici on dessine de haut en bas et on scrollera au bas.
  const x = Math.sin(index * CONFIG.frequency) * CONFIG.amplitude;
  return x;
};

/**
 * Génère un chemin SVG fluide (Cubic Bezier) passant par tous les points
 */
const generatePath = (levels: LevelData[], width: number) => {
  if (levels.length === 0) return '';

  const centerX = width / 2;
  let path = `M ${centerX + getPosition(0)} ${CONFIG.levelHeight / 2}`;

  for (let i = 0; i < levels.length - 1; i++) {
    const currentX = centerX + getPosition(i);
    const currentY = i * CONFIG.levelHeight + (CONFIG.levelHeight / 2);
    
    const nextX = centerX + getPosition(i + 1);
    const nextY = (i + 1) * CONFIG.levelHeight + (CONFIG.levelHeight / 2);

    // Points de contrôle pour la courbe de Bézier (lissage vertical)
    const cp1x = currentX;
    const cp1y = currentY + (CONFIG.levelHeight * 0.5);
    const cp2x = nextX;
    const cp2y = nextY - (CONFIG.levelHeight * 0.5);

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${nextX} ${nextY}`;
  }

  return path;
};

// --- SOUS-COMPOSANTS ---

const StarRating = ({ stars }: { stars: number }) => (
  <div className="flex gap-0.5 absolute -bottom-3 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm border border-slate-100 transform scale-75">
    {[1, 2, 3].map((i) => (
      <Star
        key={i}
        size={12}
        className={`${i <= stars ? 'fill-yellow-400 text-yellow-400' : 'fill-slate-200 text-slate-200'}`}
      />
    ))}
  </div>
);

const LevelNode = ({ 
  level, 
  x, 
  y, 
  onClick 
}: { 
  level: LevelData; 
  x: number; 
  y: number; 
  onClick: (id: number) => void 
}) => {
  const isLocked = level.status === 'locked';
  const isActive = level.status === 'active';
  const isBoss = level.type === 'boss';

  // Styles dynamiques basés sur l'état
  let baseClasses = "relative z-10 flex items-center justify-center transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95 shadow-[0_8px_0_rgb(0,0,0,0.1)]";
  let sizeClasses = isBoss ? "w-20 h-20 rounded-3xl" : "w-16 h-16 rounded-full";
  
  let colorClasses = "";
  if (isLocked) colorClasses = "bg-slate-200 text-slate-400 border-4 border-slate-300";
  else if (isActive) colorClasses = "bg-sky-500 text-white border-4 border-white ring-4 ring-sky-200 animate-pulse-slow";
  else colorClasses = "bg-green-500 text-white border-4 border-green-600"; // Completed

  if (level.type === 'chest') {
    sizeClasses = "w-14 h-14 rounded-2xl";
    colorClasses = isLocked ? "bg-slate-300" : "bg-amber-400 border-b-4 border-amber-600";
  }

  return (
    <div 
      className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
      style={{ left: x, top: y }}
      onClick={() => !isLocked && onClick(level.id)}
    >
      {/* Indicateur "Start" ou "Current" flottant au-dessus */}
      {isActive && (
        <div className="absolute -top-12 animate-bounce bg-white px-3 py-1 rounded-lg shadow-md text-xs font-bold text-sky-600 mb-2 whitespace-nowrap z-20">
          C'est parti !
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rotate-45"></div>
        </div>
      )}

      <button className={`${baseClasses} ${sizeClasses} ${colorClasses}`}>
        {isLocked ? (
          <Lock size={20} className="opacity-50" />
        ) : level.type === 'chest' ? (
          <Gift size={24} className="text-white drop-shadow-md" />
        ) : (
          <span className={`text-xl font-black ${isBoss ? 'text-3xl' : ''}`}>
            {level.id}
          </span>
        )}
      </button>

      {/* Étoiles si complété */}
      {level.status === 'completed' && level.type !== 'chest' && (
        <StarRating stars={level.stars} />
      )}
    </div>
  );
};

const Decoration = ({ x, y, type }: { x: number, y: number, type: number }) => {
  // Styles de décor aléatoires (arbres, rochers, fleurs)
  // En production, utiliser des SVG ou images de haute qualité
  const decorStyles = [
    <div key="tree1" className="text-4xl absolute transform -translate-x-1/2 -translate-y-1/2 opacity-90 drop-shadow-sm">🌲</div>,
    <div key="tree2" className="text-3xl absolute transform -translate-x-1/2 -translate-y-1/2 opacity-80 drop-shadow-sm">🌳</div>,
    <div key="rock" className="text-2xl absolute transform -translate-x-1/2 -translate-y-1/2 opacity-60">🪨</div>,
    <div key="flower" className="text-xl absolute transform -translate-x-1/2 -translate-y-1/2 opacity-80">🍄</div>,
    <div key="cloud" className="text-5xl absolute transform -translate-x-1/2 -translate-y-1/2 opacity-30 text-white blur-[1px]">☁️</div>,
  ];

  return (
    <div style={{ left: x, top: y }} className="absolute pointer-events-none transition-transform hover:scale-110 duration-700">
      {decorStyles[type % decorStyles.length]}
    </div>
  );
};

// --- COMPOSANT PRINCIPAL ---

export default function App() {
  const [activeLevelId, setActiveLevelId] = useState(8); // L'utilisateur est au niveau 8
  const containerRef = useRef<HTMLDivElement>(null);
  const containerWidth = 400; // Largeur virtuelle du canvas de jeu

  // Génération des données de niveaux (Simulé)
  const levels: LevelData[] = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => {
      const id = i + 1;
      let status: LevelStatus = 'locked';
      let stars = 0;
      
      if (id < activeLevelId) {
        status = 'completed';
        stars = Math.floor(Math.random() * 3) + 1;
      } else if (id === activeLevelId) {
        status = 'active';
      }

      let type: LevelData['type'] = 'normal';
      if (id % 5 === 0) type = 'boss';
      else if (id % 3 === 0 && id % 5 !== 0) type = 'chest';

      return { id, status, stars, type };
    }).reverse(); // On reverse pour que le niveau 1 soit en bas
  }, [activeLevelId]);

  // Scroll automatique vers le niveau actif au chargement
  useEffect(() => {
    if (containerRef.current) {
      // Trouver l'index du niveau actif dans le tableau inversé
      const activeIndex = levels.findIndex(l => l.id === activeLevelId);
      if (activeIndex !== -1) {
        const yPos = activeIndex * CONFIG.levelHeight;
        containerRef.current.scrollTop = yPos - (containerRef.current.clientHeight / 2) + CONFIG.levelHeight;
      }
    }
  }, [activeLevelId, levels]);

  // Calcul du chemin SVG
  const svgPath = useMemo(() => generatePath(levels, containerWidth), [levels]);
  const totalHeight = levels.length * CONFIG.levelHeight;

  return (
    <div className="w-full h-screen bg-slate-900 flex items-center justify-center font-sans">
      
      {/* Conteneur Mobile-First */}
      <div className="relative w-full max-w-md h-full max-h-[850px] bg-[#8cd6ff] overflow-hidden shadow-2xl md:rounded-[40px] border-8 border-slate-800 flex flex-col">
        
        {/* Header UI */}
        <div className="absolute top-0 left-0 right-0 z-50 p-4 flex justify-between items-start pointer-events-none">
          <div className="flex flex-col gap-2 pointer-events-auto">
            <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-slate-100 active:scale-95 transition-transform">
              <ChevronLeft size={24} className="text-slate-600" />
            </button>
          </div>
          
          <div className="flex gap-3 pointer-events-auto">
             <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-2xl shadow-lg border-2 border-amber-100 flex items-center gap-2">
               <span className="text-amber-500 font-bold">💎</span>
               <span className="font-black text-slate-700">1,240</span>
             </div>
             <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-slate-100 active:scale-95 transition-transform">
               <Settings size={20} className="text-slate-600" />
             </button>
          </div>
        </div>

        {/* Scrollable Map Area */}
        <div 
          ref={containerRef}
          className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide relative"
          style={{ scrollBehavior: 'smooth' }}
        >
          {/* Background Elements (Parallax simulé ou statique) */}
          <div className="absolute inset-0 pointer-events-none opacity-20" 
               style={{ 
                 backgroundImage: 'radial-gradient(circle at 50% 50%, #ffffff 2px, transparent 2px)', 
                 backgroundSize: '30px 30px',
                 height: totalHeight + 400 // Extra space
               }} 
          />

          {/* Canvas de jeu */}
          <div 
            className="relative mx-auto"
            style={{ width: containerWidth, height: totalHeight + 200 }} // Padding bas
          >
            {/* Décorations d'arrière plan (Arbres, etc) */}
            {levels.map((_, i) => {
               // Générer des décors aléatoires sur les côtés
               const y = i * CONFIG.levelHeight + (CONFIG.levelHeight / 2);
               const xBase = (containerWidth / 2) + getPosition(i);
               const isLeft = Math.random() > 0.5;
               const decorX = isLeft ? xBase - 120 : xBase + 120;
               return <Decoration key={`decor-${i}`} x={decorX} y={y} type={i} />
            })}

            {/* SVG Path - La route */}
            <svg 
              className="absolute top-0 left-0 w-full h-full pointer-events-none drop-shadow-xl"
              style={{ overflow: 'visible' }}
            >
              {/* Ombre du chemin */}
              <path 
                d={svgPath} 
                fill="none" 
                stroke="rgba(0,0,0,0.1)" 
                strokeWidth={CONFIG.pathWidth + 4} 
                strokeLinecap="round"
                className="translate-y-2"
              />
              {/* Bordure blanche du chemin */}
              <path 
                d={svgPath} 
                fill="none" 
                stroke="white" 
                strokeWidth={CONFIG.pathWidth} 
                strokeLinecap="round"
              />
               {/* Intérieur du chemin (tiretés) */}
              <path 
                d={svgPath} 
                fill="none" 
                stroke="#dbeafe" 
                strokeWidth={CONFIG.pathWidth - 10} 
                strokeLinecap="round"
                strokeDasharray="20 20"
              />
            </svg>

            {/* Noeuds des niveaux */}
            {levels.map((level, index) => {
              const y = index * CONFIG.levelHeight + (CONFIG.levelHeight / 2);
              const x = (containerWidth / 2) + getPosition(index);
              
              return (
                <LevelNode 
                  key={level.id}
                  level={level}
                  x={x}
                  y={y}
                  onClick={(id) => {
                    console.log(`Niveau ${id} cliqué`);
                    if (id === activeLevelId) {
                        alert("Lancement du niveau " + id + " ! 🚀");
                    }
                  }}
                />
              );
            })}
            
            {/* Zone de départ en bas */}
            <div 
               className="absolute left-1/2 transform -translate-x-1/2 text-center pb-20"
               style={{ top: totalHeight + 20 }}
            >
               <div className="bg-emerald-600 text-white px-6 py-2 rounded-full font-bold shadow-lg border-4 border-emerald-400">
                 START
               </div>
            </div>

          </div>
        </div>
        
        {/* Footer Navigation */}
        <div className="bg-white border-t border-slate-100 p-3 pb-6 flex justify-around items-center shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-50">
           <button className="flex flex-col items-center gap-1 text-sky-500 transition-colors">
              <MapPin size={28} fill="currentColor" />
              <span className="text-xs font-bold">Aventure</span>
           </button>
           <button className="flex flex-col items-center gap-1 text-slate-300 hover:text-slate-400 transition-colors">
              <div className="w-7 h-7 rounded-lg border-2 border-current flex items-center justify-center">
                 <span className="font-bold text-sm">Aa</span>
              </div>
              <span className="text-xs font-bold">Leçons</span>
           </button>
           <button className="flex flex-col items-center gap-1 text-slate-300 hover:text-slate-400 transition-colors">
               <div className="relative">
                 <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
                 <Gift size={28} />
               </div>
              <span className="text-xs font-bold">Shop</span>
           </button>
        </div>

      </div>
    </div>
  );
}