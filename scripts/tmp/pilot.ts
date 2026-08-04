import { QUESTIONS_DATABASE } from '../../src/data/questions';
import { funScore } from '../score-fun';
const rows = QUESTIONS_DATABASE.filter(q => q.id.startsWith('his_adulte_pilot'));
for (const {q,s} of rows.map(q=>({q,s:funScore(q)})).sort((a,b)=>a.s-b.s))
  console.log(`${s.toFixed(0)}% ${q.id.slice(-3)} ${q.question}\n      → ${q.options.join(' | ')} [${q.options[q.correctAnswerIndex]}]`);
