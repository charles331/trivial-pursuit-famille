import { QUESTIONS_DATABASE } from '../../src/data/questions';
import { isBareYearCard } from '../../src/data/questionRules';
for (const lvl of ['enfant','ado','adulte'] as const) {
  const r = QUESTIONS_DATABASE.filter(q => q.difficulty === lvl && isBareYearCard(q.question, q.options));
  console.log(`${lvl}: ${r.length}`);
  for (const q of r) console.log(`   ${q.id.padEnd(28)} ${q.question}\n        → ${q.options.join(' | ')}`);
}
