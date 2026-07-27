import { QUESTIONS_DATABASE } from '../src/data/questions';
import { CategoryId, DifficultyLevel, Question } from '../src/types';

const CATEGORIES: CategoryId[] = [
  'histoire',
  'geographie',
  'cinema',
  'sciences',
  'art',
  'sports',
  'popculture',
  'gastronomie',
];
const DIFFICULTIES: DifficultyLevel[] = ['enfant', 'ado', 'adulte'];

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const errors: string[] = [];
const ids = new Set<string>();
const adultTextsByCategory = new Map<CategoryId, Set<string>>();

for (const question of QUESTIONS_DATABASE) {
  if (ids.has(question.id)) errors.push(`Identifiant dupliqué : ${question.id}`);
  ids.add(question.id);

  if (!CATEGORIES.includes(question.categoryId)) {
    errors.push(`Catégorie invalide pour ${question.id}`);
  }
  if (!DIFFICULTIES.includes(question.difficulty)) {
    errors.push(`Difficulté invalide pour ${question.id}`);
  }
  if (!question.question.trim()) errors.push(`Question vide : ${question.id}`);
  if (question.options.length !== 4) errors.push(`Il faut 4 choix : ${question.id}`);
  if (new Set(question.options.map(normalize)).size !== 4) {
    errors.push(`Choix dupliqué : ${question.id}`);
  }
  if (
    !Number.isInteger(question.correctAnswerIndex)
    || question.correctAnswerIndex < 0
    || question.correctAnswerIndex > 3
  ) {
    errors.push(`Bonne réponse invalide : ${question.id}`);
  }

  if (question.difficulty === 'adulte') {
    const texts = adultTextsByCategory.get(question.categoryId) ?? new Set<string>();
    const signature = `${normalize(question.question)}|${question.options.map(normalize).join('|')}`;
    if (texts.has(signature)) errors.push(`Question adulte dupliquée : ${question.id}`);
    texts.add(signature);
    adultTextsByCategory.set(question.categoryId, texts);
  }
}

console.log('Catégorie       Enfant  Ado  Adulte  Total');
console.log('--------------------------------------------');
for (const categoryId of CATEGORIES) {
  const rows = QUESTIONS_DATABASE.filter((q) => q.categoryId === categoryId);
  const counts = DIFFICULTIES.map(
    (difficulty) => rows.filter((q) => q.difficulty === difficulty).length,
  );
  console.log(
    `${categoryId.padEnd(15)}${String(counts[0]).padStart(6)}${String(counts[1]).padStart(5)}`
      + `${String(counts[2]).padStart(8)}${String(rows.length).padStart(7)}`,
  );
  if (counts[2] !== 400) {
    errors.push(`${categoryId} contient ${counts[2]} questions adultes au lieu de 400`);
  }
  if (counts[0] !== 135 || counts[1] !== 135) {
    errors.push(`${categoryId} doit contenir 135 questions enfant et 135 questions ado`);
  }
}

if (errors.length > 0) {
  console.error(`\nAudit échoué (${errors.length} erreur(s)) :`);
  console.error(errors.slice(0, 50).map((error) => `- ${error}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log(`\nAudit réussi : ${QUESTIONS_DATABASE.length} questions valides.`);
}
