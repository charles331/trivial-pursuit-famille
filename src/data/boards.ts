import { BoardConfig, BoardTile, CategoryId, BoardType } from '../types';

// Helper to generate coordinates on a circle
function circlePoint(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return {
    x: Math.round(cx + r * Math.cos(rad)),
    y: Math.round(cy + r * Math.sin(rad))
  };
}

const CATEGORIES_LIST: CategoryId[] = [
  'histoire',
  'geographie',
  'cinema',
  'sciences',
  'art',
  'sports'
];

function generateWheelBoard(): BoardTile[] {
  const tiles: BoardTile[] = [];
  const cx = 500;
  const cy = 500;
  const outerR = 380;
  const spokeStepR = outerR / 4; // spokes have 3 intermediate tiles

  // Hub / Center tile (ID 0)
  tiles.push({
    id: 0,
    type: 'hub',
    label: 'CENTRE',
    x: cx,
    y: cy,
    nextTileIds: [] // leads into spokes
  });

  let currentId = 1;
  const spokeOuterTileIds: number[] = [];

  // Create 6 spokes (Angles: 0, 60, 120, 180, 240, 300)
  for (let i = 0; i < 6; i++) {
    const angle = i * 60;
    const catId = CATEGORIES_LIST[i % CATEGORIES_LIST.length];

    const spokeStartId = currentId;
    // 3 spoke tiles going outwards
    for (let s = 1; s <= 3; s++) {
      const pt = circlePoint(cx, cy, s * spokeStepR, angle);
      const isLastSpoke = (s === 3);
      const tileId = currentId++;

      tiles.push({
        id: tileId,
        type: isLastSpoke ? 'camembert' : 'category',
        categoryId: catId,
        label: isLastSpoke ? 'CAMEMBERT' : `${CATEGORIES_LIST[(i + s) % 6]}`,
        x: pt.x,
        y: pt.y,
        nextTileIds: [], // linked later
        isCamembert: isLastSpoke
      });

      if (isLastSpoke) {
        spokeOuterTileIds.push(tileId);
      }
    }

    // Link spoke tiles in order 0 -> spoke1 -> spoke2 -> spoke3
    tiles[0].nextTileIds.push(spokeStartId);
    tiles.find(t => t.id === spokeStartId)!.nextTileIds.push(spokeStartId + 1);
    tiles.find(t => t.id === spokeStartId + 1)!.nextTileIds.push(spokeStartId + 2);
  }

  // Create outer circle connecting the 6 outer spoke tiles
  // Between each pair of outer spoke tiles, place 3 outer track tiles
  const outerTrackStartId = currentId;
  const outerNodesCount = 6 * 4; // 24 total tiles on outer ring

  for (let idx = 0; idx < outerNodesCount; idx++) {
    const angle = idx * (360 / outerNodesCount);
    const pt = circlePoint(cx, cy, outerR, angle);
    const isSpokeAngle = (idx % 4 === 0);

    if (isSpokeAngle) {
      // This corresponds to one of the outer spoke tiles created earlier
      const spokeIndex = idx / 4;
      const spokeCamembertId = spokeOuterTileIds[spokeIndex];
      // Update its coordinate precisely to match ring
      const t = tiles.find(tile => tile.id === spokeCamembertId);
      if (t) {
        t.x = pt.x;
        t.y = pt.y;
      }
    } else {
      // Normal outer track tile
      const catId = CATEGORIES_LIST[idx % CATEGORIES_LIST.length];
      const isSurprise = (idx % 7 === 0);
      const isReroll = (idx % 5 === 0);

      const tileId = currentId++;
      tiles.push({
        id: tileId,
        type: isSurprise ? 'surprise' : isReroll ? 'reroll' : 'category',
        categoryId: catId,
        label: isSurprise ? 'SURPRISE' : isReroll ? 'RE-LANCE' : catId.toUpperCase(),
        x: pt.x,
        y: pt.y,
        nextTileIds: []
      });
    }
  }

  // Now create bidirectional graph connectivity for all adjacent ring & spoke tiles
  // Re-map ring nodes in angular order
  const ringTileMap: number[] = [];
  for (let idx = 0; idx < outerNodesCount; idx++) {
    if (idx % 4 === 0) {
      ringTileMap.push(spokeOuterTileIds[idx / 4]);
    } else {
      // Find corresponding outer tile
      const angle = idx * (360 / outerNodesCount);
      const pt = circlePoint(cx, cy, outerR, angle);
      const t = tiles.find(tile => Math.abs(tile.x - pt.x) < 5 && Math.abs(tile.y - pt.y) < 5);
      if (t) ringTileMap.push(t.id);
    }
  }

  // Connect adjacent ring items
  for (let i = 0; i < ringTileMap.length; i++) {
    const currentTile = tiles.find(t => t.id === ringTileMap[i]);
    const nextRingId = ringTileMap[(i + 1) % ringTileMap.length];
    const prevRingId = ringTileMap[(i - 1 + ringTileMap.length) % ringTileMap.length];
    if (currentTile) {
      currentTile.nextTileIds = Array.from(new Set([...currentTile.nextTileIds, nextRingId, prevRingId]));
    }
  }

  // Connect spokes outwards & inwards towards hub
  for (let i = 0; i < 6; i++) {
    const spoke1 = 1 + i * 3;
    const spoke2 = 2 + i * 3;
    const spoke3 = 3 + i * 3; // Camembert

    // Hub <-> spoke1 <-> spoke2 <-> spoke3
    const t1 = tiles.find(t => t.id === spoke1);
    const t2 = tiles.find(t => t.id === spoke2);
    const t3 = tiles.find(t => t.id === spoke3);

    if (t1) t1.nextTileIds.push(0, spoke2);
    if (t2) t2.nextTileIds.push(spoke1, spoke3);
    if (t3) t3.nextTileIds.push(spoke2);
  }

  // Deduplicate all nextTileIds and remove self-references
  tiles.forEach(t => {
    t.nextTileIds = Array.from(new Set(t.nextTileIds.filter(id => id !== t.id)));
  });

  return tiles;
}

function generateSnakeBoard(): BoardTile[] {
  const tiles: BoardTile[] = [];
  const rows = 5;
  const cols = 6;
  let id = 0;

  for (let r = 0; r < rows; r++) {
    const isEven = (r % 2 === 0);
    for (let c = 0; c < cols; c++) {
      const colIndex = isEven ? c : (cols - 1 - c);
      const x = Math.round(150 + colIndex * 140);
      const y = Math.round(150 + r * 160);
      const catId = CATEGORIES_LIST[(id) % CATEGORIES_LIST.length];
      const isCamembert = (id > 0 && id % 5 === 0);
      const isHub = (id === rows * cols - 1);

      tiles.push({
        id: id,
        type: isHub ? 'hub' : isCamembert ? 'camembert' : 'category',
        categoryId: catId,
        label: isHub ? 'VICTOIRE' : isCamembert ? 'CAMEMBERT' : catId.toUpperCase(),
        x,
        y,
        nextTileIds: id < rows * cols - 1 ? [id + 1] : [0],
        isCamembert
      });
      id++;
    }
  }

  // Also add backward connections
  for (let i = 0; i < tiles.length; i++) {
    if (i > 0) {
      tiles[i].nextTileIds.push(i - 1);
    }
  }

  // Deduplicate all nextTileIds and remove self-references
  tiles.forEach(t => {
    t.nextTileIds = Array.from(new Set(t.nextTileIds.filter(id => id !== t.id)));
  });

  return tiles;
}

export const BOARD_PRESETS: Record<BoardType, BoardConfig> = {
  wheel: {
    id: 'wheel',
    name: 'Roue Classique 6 Branches',
    description: 'Le plateau de jeu emblématique avec hub central, 6 spokes et 6 cases camemberts.',
    suggestedDuration: '45-60 min',
    tiles: generateWheelBoard()
  },
  snake: {
    id: 'snake',
    name: 'Circuit Familial Express',
    description: 'Un serpentin dynamique idéal pour les parties rapides sur tablette ou mobile.',
    suggestedDuration: '25-35 min',
    tiles: generateSnakeBoard()
  },
  star: {
    id: 'star',
    name: 'Étoile des Champions',
    description: 'Un plateau à 4 branches courtes concentré sur la rapidité et la stratégie.',
    suggestedDuration: '20-30 min',
    tiles: generateWheelBoard() // reuse wheel logic with stylized star view
  }
};
