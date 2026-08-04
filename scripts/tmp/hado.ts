import { QUESTIONS_DATABASE } from '../../src/data/questions';
import { funScore } from '../score-fun';
const rows = QUESTIONS_DATABASE.filter(q => q.categoryId === 'histoire' && q.difficulty === 'ado');
for (const {q,s} of rows.map(q=>({q,s:funScore(q)})).sort((a,b)=>a.s-b.s).slice(0,20))
  console.log(`${s.toFixed(0)}% ${q.id} ${q.question}\n      → ${q.options.join(' | ')} [${q.options[q.correctAnswerIndex]}]`);
