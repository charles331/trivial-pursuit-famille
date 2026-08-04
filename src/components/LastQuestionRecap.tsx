import React, { useEffect, useState } from 'react';
import { CheckCircle2, HelpCircle, XCircle } from 'lucide-react';
import { GameState } from '../types';
import { CATEGORIES } from '../data/categories';

interface LastQuestionRecapProps {
  recap: NonNullable<GameState['lastQuestionRecap']>;
}

/**
 * Rappel de la carte qui vient d'être jouée, affiché sur le plateau.
 *
 * Le « Le saviez-vous ? » ne vivait que dans le modal de question : dès que
 * quelqu'un cliquait sur « Passer au joueur suivant », il disparaissait de tous
 * les écrans à la fois. Signalé en partie : « je n'ai pas le temps de lire le
 * saviez-vous ». À trois joueurs c'est systématique, puisque celui qui n'a ni
 * répondu ni lu la carte ne décide pas du moment où l'on passe.
 *
 * Le rappel reste donc là jusqu'à ce que la carte suivante soit tirée, et chacun
 * peut le replier de son côté sans rien imposer aux autres — le pli est local,
 * pas dans l'état partagé.
 */
export const LastQuestionRecap: React.FC<LastQuestionRecapProps> = ({ recap }) => {
  const [collapsed, setCollapsed] = useState(false);
  const category = CATEGORIES[recap.categoryId] ?? CATEGORIES.histoire;

  // Une nouvelle carte rouvre le rappel : le pli ne vaut que pour celle qu'on
  // vient de lire.
  useEffect(() => setCollapsed(false), [recap.question]);

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => setCollapsed(false)}
        className="mx-auto mb-2 flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-[11px] font-bold text-slate-300 hover:text-white"
      >
        <HelpCircle className="h-3.5 w-3.5 text-amber-400" /> Revoir la carte précédente
      </button>
    );
  }

  return (
    <div className="mx-auto mb-2 w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900/95 p-3 shadow-lg">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-slate-950"
            style={{ backgroundColor: category.color }}
          >
            {category.name}
          </span>
          <span className="flex min-w-0 items-center gap-1 text-[11px] font-bold text-slate-400">
            {recap.isCorrect
              ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
              : <XCircle className="h-3.5 w-3.5 shrink-0 text-red-400" />}
            <span className="truncate">{recap.playerName}</span>
          </span>
        </div>
        <button
          type="button"
          aria-label="Replier le rappel"
          onClick={() => setCollapsed(true)}
          className="shrink-0 rounded-lg px-1.5 text-sm font-black text-slate-500 hover:text-slate-200"
        >
          ✕
        </button>
      </div>

      <p className="mt-1.5 text-xs font-semibold leading-snug text-slate-300">
        {recap.question}
      </p>
      <p className="mt-1 text-sm font-black leading-snug text-emerald-300">
        {recap.answer}
      </p>

      {recap.explanation && (
        <div className="mt-2 space-y-0.5 rounded-xl border border-amber-800/60 bg-amber-950/40 p-2">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-amber-400">
            <HelpCircle className="h-3 w-3" /> Le saviez-vous ?
          </div>
          <p className="text-[11px] font-medium leading-relaxed text-slate-300">
            {recap.explanation}
          </p>
        </div>
      )}
    </div>
  );
};
