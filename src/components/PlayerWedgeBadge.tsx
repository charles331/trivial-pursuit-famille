import React from 'react';
import { CategoryId } from '../types';
import { CATEGORIES } from '../data/categories';
import { withAlpha } from '../utils/motion';

interface PlayerWedgeBadgeProps {
  wedges: CategoryId[];
  size?: number;
  showLabels?: boolean;
  /**
   * Les six catégories du plateau, dans l'ordre. Comme le porte-camemberts du pion,
   * ce badge dessinait un ordre figé : un camembert gagné dans une catégorie hors
   * de cette liste n'avait aucune part où s'afficher.
   */
  categories?: CategoryId[];
}

export const PlayerWedgeBadge: React.FC<PlayerWedgeBadgeProps> = ({ 
  wedges, 
  size = 48,
  showLabels = false,
  categories
}) => {
  const categoryKeys: CategoryId[] = categories ?? [
    'histoire',
    'geographie',
    'cinema',
    'sciences',
    'art',
    'sports'
  ];

  const center = size / 2;
  const radius = (size / 2) - 2;

  const isComplete = categoryKeys.every(key => wedges.includes(key));

  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="drop-shadow-sm"
      >
        {/* Outer Circle Ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="#0F172A"
          stroke={isComplete ? '#FDE047' : '#475569'}
          strokeWidth="2"
        />

        {/* 6 Pie Wedges */}
        {categoryKeys.map((catKey, index) => {
          const startAngle = (index * 60 - 90) * (Math.PI / 180);
          const endAngle = ((index + 1) * 60 - 90) * (Math.PI / 180);

          const x1 = center + radius * Math.cos(startAngle);
          const y1 = center + radius * Math.sin(startAngle);
          const x2 = center + radius * Math.cos(endAngle);
          const y2 = center + radius * Math.sin(endAngle);

          const pathData = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;

          const hasWedge = wedges.includes(catKey);
          // Empty slots keep a faint tint of their category so the six targets
          // stay visible instead of reading as one dark disc.
          const fillColor = hasWedge ? CATEGORIES[catKey].color : withAlpha(CATEGORIES[catKey].color, 0.18);

          return (
            <path
              key={catKey}
              d={pathData}
              fill={fillColor}
              stroke="#0F172A"
              strokeWidth="1.5"
              className="transition-colors duration-300"
            />
          );
        })}

        {/* Center Pin */}
        <circle cx={center} cy={center} r={size * 0.12} fill="#F8FAFC" stroke="#0F172A" strokeWidth="1" />
      </svg>

      {showLabels && (
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
          {wedges.length}/{categoryKeys.length} Camemberts
        </span>
      )}
    </div>
  );
};
