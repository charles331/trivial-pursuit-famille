import { GoogleGenAI, Type } from '@google/genai';
import { CATEGORY_IDS } from '../data/categories';
import {
  MAX_ADULT_OPTION_LENGTH,
  MAX_ADULT_QUESTION_LENGTH,
} from '../data/questionRules';

export type AiProvider = 'gemini' | 'openai';

export interface AiProviderConfig {
  provider: AiProvider;
  apiKey: string;
  apiKeyName: 'GEMINI_API_KEY' | 'OPENAI_API_KEY';
  model: string;
}

export interface QuestionGenerator {
  provider: AiProvider;
  model: string;
  generateBatch: (themeName: string, count: number, angle?: string) => Promise<any[]>;
}

const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';
// La génération de quiz est un travail équilibré qualité/coût : Terra est plus
// adapté que le modèle Sol, orienté vers les tâches les plus difficiles.
const DEFAULT_OPENAI_MODEL = 'gpt-5.6-terra';

const CARD_JSON_SCHEMA = {
  type: 'object',
  properties: {
    categoryId: {
      type: 'string',
      enum: [...CATEGORY_IDS],
    },
    question: { type: 'string' },
    // Le nombre de propositions dépend du format : quatre pour un QCM, deux pour
    // un vrai/faux, aucune pour une question ouverte. La validation aval
    // (editorialRejectionReason) contrôle la forme propre à chaque format.
    options: {
      type: 'array',
      items: { type: 'string' },
    },
    correctAnswerIndex: {
      type: 'integer',
      minimum: 0,
      maximum: 3,
    },
    explanation: { type: 'string' },
    difficulty: {
      type: 'string',
      enum: ['enfant', 'ado', 'adulte'],
    },
    format: {
      type: 'string',
      enum: ['mcq', 'boolean', 'open'],
    },
    // Réponse attendue d'une carte ouverte ; chaîne vide pour les autres formats.
    answer: { type: 'string' },
  },
  required: [
    'categoryId',
    'question',
    'options',
    'correctAnswerIndex',
    'explanation',
    'difficulty',
    'format',
    'answer',
  ],
  additionalProperties: false,
} as const;

const GEMINI_PACK_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      categoryId: {
        type: Type.STRING,
        enum: [...CATEGORY_IDS],
      },
      question: { type: Type.STRING },
      options: { type: Type.ARRAY, items: { type: Type.STRING } },
      correctAnswerIndex: { type: Type.INTEGER },
      explanation: { type: Type.STRING },
      difficulty: { type: Type.STRING, enum: ['enfant', 'ado', 'adulte'] },
      format: { type: Type.STRING, enum: ['mcq', 'boolean', 'open'] },
      answer: { type: Type.STRING },
    },
    required: [
      'categoryId',
      'question',
      'options',
      'correctAnswerIndex',
      'explanation',
      'difficulty',
      'format',
      'answer',
    ],
  },
};

export const OPENAI_PACK_SCHEMA = {
  type: 'object',
  properties: {
    questions: {
      type: 'array',
      items: CARD_JSON_SCHEMA,
    },
  },
  required: ['questions'],
  additionalProperties: false,
} as const;

export function resolveAiProviderConfig(
  env: NodeJS.ProcessEnv = process.env,
): AiProviderConfig {
  const rawProvider = (env.AI_PROVIDER || 'gemini').trim().toLowerCase();
  if (rawProvider !== 'gemini' && rawProvider !== 'openai') {
    throw new Error('AI_PROVIDER doit valoir "gemini" ou "openai".');
  }

  if (rawProvider === 'openai') {
    return {
      provider: 'openai',
      apiKey: env.OPENAI_API_KEY?.trim() || '',
      apiKeyName: 'OPENAI_API_KEY',
      model: env.OPENAI_MODEL?.trim() || DEFAULT_OPENAI_MODEL,
    };
  }

  return {
    provider: 'gemini',
    apiKey: env.GEMINI_API_KEY?.trim() || '',
    apiKeyName: 'GEMINI_API_KEY',
    model: env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL,
  };
}

export function buildQuestionGenerationPrompt(
  themeName: string,
  count: number,
  angle?: string,
): string {
  const perLevel = Math.max(1, Math.floor(count / 3));
  const anglePart = angle
    ? `\n- Angle prioritaire de ce lot : ${angle}. D'autres lots couvrent les autres angles du thème en parallèle — ne t'en écarte que si le thème ne s'y prête vraiment pas.`
    : '';

  return `Génère exactement ${count} questions de quiz captivantes, amusantes et FACTUELLEMENT EXACTES en français sur le thème "${themeName}", pour un jeu familial de type Trivial Pursuit.

Structure imposée :${anglePart}
- Répartis les questions entre les catégories du jeu (${CATEGORY_IDS.join(', ')}) en choisissant celles qui collent le mieux au thème. Chaque question doit réellement porter sur "${themeName}".
- Respecte strictement le sujet réellement testé par la question : histoire = événements et personnages historiques ; geographie = pays, lieux et reliefs ; cinema = films, séries, acteurs, rôles et réalisateurs ; sciences = phénomènes scientifiques, nature, corps, animaux et espace ; art = arts visuels et littérature ; sports = disciplines, compétitions et loisirs ; popculture = musique, BD, jeux vidéo et web ; gastronomie = plats, ingrédients et cuisine.
- Le décor ne détermine jamais la catégorie : une question sur un acteur, un rôle ou un personnage de film de science-fiction appartient à "cinema", pas à "sciences". Exemple : une question sur Rutger Hauer dans Blade Runner doit être classée "cinema".
- Répartis les difficultés : environ ${perLevel} questions "enfant" (6-10 ans, très simples), ${perLevel} "ado" (11-16 ans) et le reste "adulte".
- Exactement 4 options par question, une seule correcte (correctAnswerIndex entre 0 et 3), distracteurs plausibles et de même famille sémantique.
- "explanation" : une anecdote courte qui APPREND quelque chose de neuf, absent de l'énoncé et de la bonne réponse. Une explication qui répète la question est refusée.

Format des cartes (champ "format") :
- Par défaut "mcq" : quatre propositions comme ci-dessus, "answer" laissé vide ("").
- Tu peux, pour une petite part des cartes (environ une sur six au maximum), choisir un autre format lorsqu'il sert mieux le fait :
  - "boolean" : une affirmation à trancher. Mets "options" à ["Vrai", "Faux"] exactement et "correctAnswerIndex" à 0 (Vrai) ou 1 (Faux), "answer" vide. Idéal pour un fait surprenant qui n'a pas trois distracteurs crédibles.
  - "open" : aucune proposition. Mets "options" à [], "correctAnswerIndex" à 0, et la réponse attendue dans "answer" (courte, sans ambiguïté, 80 caractères maximum). La réponse ne doit jamais figurer dans l'énoncé. Réserve ce format aux questions dont la réponse tient en un mot ou une expression.

Calibrage des niveaux :
- "enfant" : fait concret et visuel, énoncé de 12 mots maximum.
- "ado" : pas plus long qu'une carte enfant, mais plus daté et plus situé (une année, un lieu, un nom précis).
- "adulte" : culture générale grand public, où un adulte informé répond juste à peu près une fois sur deux. Pas de pointe d'expert, pas de fait isolé qu'on oublie aussitôt.

Contraintes de forme, éliminatoires :
- Énoncé autoportant : la question doit se comprendre seule et nommer explicitement son sujet (l'animal, l'œuvre, le lieu, la personne ou l'époque dont elle parle). Le joueur ne voit que l'énoncé et les options, jamais l'explication ni un contexte implicite. Interdit : « Chez quel sexe les antennes sont-elles les plus plumeuses ? » (quel animal ?) ; écris plutôt « Chez le moustique, quel sexe porte les antennes les plus plumeuses ? ».
- Énoncé de ${MAX_ADULT_QUESTION_LENGTH} caractères maximum, chaque option de ${MAX_ADULT_OPTION_LENGTH} caractères maximum.
- Interdit : le format « quelle association question-réponse est correcte ? », les paires dans les options, les questions à trou, les préfixes décoratifs (« Question flash : »).
- Interdit : révéler la bonne réponse dans l'énoncé, et les quatre options réduites à quatre nombres nus.
- Deux options ne doivent jamais être identiques.
- Aucune question en double ni reformulation d'une autre question du lot.

Ancrage : varie les époques, les pays et les disciplines ; évite un tropisme exclusivement français, la Belgique, l'Europe et le reste du monde ont leur place. Contenu familial, aucune question polémique ou choquante.`;
}

export function buildOpenAiRequest(
  model: string,
  prompt: string,
  reasoningEffort?: string,
): Record<string, unknown> {
  const request: Record<string, unknown> = {
    model,
    input: prompt,
    store: false,
    text: {
      format: {
        type: 'json_schema',
        name: 'generated_question_pack',
        strict: true,
        schema: OPENAI_PACK_SCHEMA,
      },
    },
  };

  if (reasoningEffort) {
    request.reasoning = { effort: reasoningEffort };
  }
  return request;
}

export function extractOpenAiOutputText(response: any): string {
  if (typeof response?.output_text === 'string' && response.output_text.trim()) {
    return response.output_text;
  }

  for (const item of response?.output ?? []) {
    for (const content of item?.content ?? []) {
      if (content?.type === 'output_text' && typeof content.text === 'string') {
        return content.text;
      }
    }
  }
  throw new Error('Réponse vide ou incomplète d’OpenAI.');
}

async function generateWithOpenAi(
  config: AiProviderConfig,
  prompt: string,
  fetchImpl: typeof fetch,
  reasoningEffort?: string,
): Promise<any[]> {
  const response = await fetchImpl('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(buildOpenAiRequest(config.model, prompt, reasoningEffort)),
  });

  const payload: any = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = typeof payload?.error?.message === 'string'
      ? payload.error.message
      : `erreur HTTP ${response.status}`;
    throw new Error(`OpenAI : ${detail}`);
  }

  const parsed = JSON.parse(extractOpenAiOutputText(payload));
  if (!Array.isArray(parsed?.questions)) {
    throw new Error('Réponse JSON invalide d’OpenAI.');
  }
  return parsed.questions;
}

export function createQuestionGenerator(
  env: NodeJS.ProcessEnv = process.env,
  fetchImpl: typeof fetch = fetch,
): QuestionGenerator {
  const config = resolveAiProviderConfig(env);
  if (!config.apiKey) {
    throw new Error(`${config.apiKeyName} non configurée pour AI_PROVIDER=${config.provider}.`);
  }

  if (config.provider === 'openai') {
    const reasoningEffort = env.OPENAI_REASONING_EFFORT?.trim() || undefined;
    return {
      provider: config.provider,
      model: config.model,
      generateBatch: (themeName, count, angle) => generateWithOpenAi(
        config,
        buildQuestionGenerationPrompt(themeName, count, angle),
        fetchImpl,
        reasoningEffort,
      ),
    };
  }

  const ai = new GoogleGenAI({ apiKey: config.apiKey });
  return {
    provider: config.provider,
    model: config.model,
    generateBatch: async (themeName, count, angle) => {
      const response = await ai.models.generateContent({
        model: config.model,
        contents: buildQuestionGenerationPrompt(themeName, count, angle),
        config: {
          responseMimeType: 'application/json',
          responseSchema: GEMINI_PACK_SCHEMA,
        },
      });

      const parsed = JSON.parse(response.text || '[]');
      if (!Array.isArray(parsed)) {
        throw new Error('Réponse JSON invalide de Gemini.');
      }
      return parsed;
    },
  };
}
