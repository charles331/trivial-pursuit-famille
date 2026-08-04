import { QUESTIONS_DATABASE } from '../../src/data/questions';
import { isAttributionLotteryCard, isPersonNameLotteryCard } from '../../src/data/questionRules';
import { funScore } from '../score-fun';
const mean = (a: number[]) => a.length ? a.reduce((x,y)=>x+y,0)/a.length : 0;
const ANGLO = /britannique|américain|anglais|anglaise|écossais|irlandais|australien|états-unis|angleterre|royaume-uni|londres|new york/i;
const FRANCO = /belg|bruxell|wallon|flandre|flamand|liège|anvers|gand|français|france|paris|québec|francophone/i;
const his = QUESTIONS_DATABASE.filter(q => q.categoryId === 'histoire');
for (const lvl of ['enfant','ado','adulte'] as const) {
  const r = his.filter(q => q.difficulty === lvl);
  const yearOf = (q:any)=>{const m=[...`${q.question} ${q.options.join(' ')} ${q.explanation??''}`.matchAll(/\b(1[0-9]{3}|20[0-2][0-9])\b/g)].map(x=>+x[1]);return m.length?Math.min(...m):null;};
  console.log(`${lvl.padEnd(7)} ${r.length} cartes  fun ${mean(r.map(funScore)).toFixed(1)}%  attrib=${r.filter(q=>isAttributionLotteryCard(q.question,q.options)).length} loterie=${r.filter(q=>isPersonNameLotteryCard(q.question,q.options)).length} anglo=${r.filter(q=>ANGLO.test(q.question+q.options.join(' '))).length} franco=${r.filter(q=>FRANCO.test(q.question+q.options.join(' ')+(q.explanation??''))).length} avant1900=${r.filter(q=>{const y=yearOf(q);return y!==null&&y<1900;}).length}`);
}
console.log('\n--- blocs adultes ---');
const ad = his.filter(q=>q.difficulty==='adulte');
const g: Record<string, typeof ad> = {};
for (const q of ad) { const k=q.id.replace(/_?\d+$/,''); (g[k] ??= []).push(q); }
for (const [k,rows] of Object.entries(g).sort((a,b)=>mean(a[1].map(funScore))-mean(b[1].map(funScore))))
  console.log(`${mean(rows.map(funScore)).toFixed(1)}%  ${String(rows.length).padStart(3)}  anglo=${String(rows.filter(q=>ANGLO.test(q.question+q.options.join(' '))).length).padStart(2)}  ${k}`);
