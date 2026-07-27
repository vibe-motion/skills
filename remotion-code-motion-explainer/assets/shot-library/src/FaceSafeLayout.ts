export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type SpeakerSide = 'left' | 'right' | 'both' | 'none';
export type MediaShape = 'portrait' | 'square' | 'landscape';
export type FaceSafeSlot = 'left' | 'right' | 'center-narrow' | 'center-lower';

export type FaceSafeLayoutInput = {
  frameWidth?: number;
  frameHeight?: number;
  speakerSide: SpeakerSide;
  mediaShape: MediaShape;
  faceBoxes: Rect[];
  reservedZones?: Rect[];
  padding?: number;
};

export type FaceSafeLayoutResult = Rect & {
  slot: FaceSafeSlot;
  overlapArea: number;
};

const overlapArea = (a: Rect, b: Rect) => {
  const width = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x));
  const height = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
  return width * height;
};

const expand = (rect: Rect, padding: number, frameWidth: number, frameHeight: number): Rect => ({
  x: Math.max(0, rect.x - padding),
  y: Math.max(0, rect.y - padding),
  width: Math.min(frameWidth, rect.x + rect.width + padding) - Math.max(0, rect.x - padding),
  height: Math.min(frameHeight, rect.y + rect.height + padding) - Math.max(0, rect.y - padding),
});

/**
 * Selects a PIP slot from detected face boxes instead of hard-coded left/right
 * coordinates. Face boxes are expanded before scoring so hair, gestures and
 * natural head movement stay inside the no-go area.
 */
export const resolveFaceSafeLayout = ({
  frameWidth = 1920,
  frameHeight = 1080,
  speakerSide,
  mediaShape,
  faceBoxes,
  reservedZones = [],
  padding = 72,
}: FaceSafeLayoutInput): FaceSafeLayoutResult => {
  const candidates: Record<FaceSafeSlot, Rect> = {
    left: {x: 82, y: 245, width: 560, height: 420},
    right: {x: frameWidth - 642, y: 245, width: 560, height: 420},
    'center-narrow':
      mediaShape === 'portrait'
        ? {x: frameWidth / 2 - 143, y: 270, width: 286, height: 496}
        : mediaShape === 'square'
          ? {x: frameWidth / 2 - 218, y: 315, width: 436, height: 436}
          : {x: frameWidth / 2 - 268, y: 365, width: 536, height: 309},
    'center-lower': {x: frameWidth / 2 - 300, y: 540, width: 600, height: 338},
  };
  const preference: FaceSafeSlot[] =
    speakerSide === 'left'
      ? ['right', 'center-lower', 'center-narrow', 'left']
      : speakerSide === 'right'
        ? ['left', 'center-lower', 'center-narrow', 'right']
        : speakerSide === 'both'
          ? ['center-narrow', 'center-lower', 'left', 'right']
          : ['right', 'left', 'center-narrow', 'center-lower'];
  const protectedZones = [
    ...faceBoxes.map((box) => expand(box, padding, frameWidth, frameHeight)),
    ...reservedZones,
  ];

  return preference
    .map((slot, rank) => {
      const rect = candidates[slot];
      const overlap = protectedZones.reduce((sum, zone) => sum + overlapArea(rect, zone), 0);
      return {...rect, slot, overlapArea: overlap, score: overlap * 100 + rank};
    })
    .sort((a, b) => a.score - b.score)[0];
};
