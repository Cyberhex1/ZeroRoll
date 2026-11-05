/**
 * Reads a game master reply: the narration plus its structured blocks. Every block of a
 * kind is read (two STATE_UPDATEs are merged), a block cut off by the length limit is
 * dropped rather than shown as raw tags, trigger types are normalised, and only tagged
 * blocks count: a check mentioned in prose is not a check (S8, M12).
 */
import { uid } from '../lib/ids';
import type { AvatarEvolution, CourseChangeAlert, PendingCheck, StateDelta } from '../types';

export type GmDelta = StateDelta;

export interface ParsedGmReply {
  text: string;
  delta: GmDelta | null;
  /** Every trigger in the reply, in order. */
  alerts: CourseChangeAlert[];
  check: PendingCheck | null;
  avatarEvolution: AvatarEvolution | null;
  options: string[];
}

const ALERT_TYPES = ['course_change', 'ambush', 'crisis', 'opportunity', 'twist', 'chapter_transition', 'story_conclusion'] as const;

export function normaliseAlertType(raw: string | undefined): CourseChangeAlert['type'] {
  const t = (raw ?? '').toLowerCase().trim().replace(/[\s-]+/g, '_').replace(/[^a-z_]/g, '');
  if ((ALERT_TYPES as readonly string[]).includes(t)) return t as CourseChangeAlert['type'];
  if (/conclu|ending|finale|epilog/.test(t)) return 'story_conclusion';
  if (/chapter/.test(t)) return 'chapter_transition';
  return 'course_change';
}

const field = (block: string, name: string) => block.match(new RegExp(`^\\s*${name}:\\s*(.+)$`, 'im'))?.[1].trim();

export function parseList(str?: string): string[] {
  if (!str) return [];
  const s = str.trim();
  if (/^(none|n\/a|-|\[\s*\])$/i.test(s)) return [];
  if (s.startsWith('[')) {
    try {
      const v = JSON.parse(s);
      if (Array.isArray(v)) return v.map((x) => (typeof x === 'string' ? x : x?.name)).filter((x): x is string => typeof x === 'string' && !!x.trim()).map((x) => x.trim());
    } catch (_) {
      /* fall through to comma split */
    }
  }
  return s.split(',').map((x) => x.replace(/[[\]"']/g, '').trim()).filter(Boolean);
}

const num = (s?: string) => {
  const m = s?.match(/[+-]?\d+/);
  return m ? parseInt(m[0], 10) : 0;
};

const END: Record<string, string> = { COURSE_TRIGGER: 'END_TRIGGER', CHECK_REQUIRED: 'END_CHECK' };
const endOf = (name: string) => END[name] ?? `END_${name}`;
const BLOCK_NAMES = ['STATE_UPDATE', 'COURSE_TRIGGER', 'CHECK_REQUIRED', 'AVATAR_EVOLUTION'];

/**
 * Block markers as models really write them: any case, with or without spaces, two or
 * more dashes (---state_update---, --- STATE UPDATE ---). They become the canonical form.
 */
export function normaliseMarkers(text: string): string {
  return text.replace(/-{2,}\s*([A-Za-z][A-Za-z _]*?)\s*-{2,}/g, (whole, raw: string) => {
    const name = raw.trim().toUpperCase().replace(/\s+/g, '_');
    const known = name === 'OPTIONS' || BLOCK_NAMES.includes(name) || BLOCK_NAMES.some((b) => endOf(b) === name);
    return known ? `---${name}---` : whole;
  }).replace(INLINE_FIELD, '\n$1:');
}

const FIELD_NAMES = 'HP_DELTA|ITEMS_GAINED|ITEMS_LOST|CONDITIONS_ADDED|CONDITIONS_REMOVED|GOLD_DELTA|XP_GAINED|SPELLS_GAINED|LOCATION|TITLE|TYPE|SUBTITLE|DESCRIPTION|SKILL|STAT|DC|REASON|ADVANTAGE|EVOLVED|PHYSICAL_DESCRIPTION';
/** Fields written on one line ("HP_DELTA: -40 ITEMS_LOST: [...]") are split onto their own lines. */
const INLINE_FIELD = new RegExp(`[ \\t]+(${FIELD_NAMES}):`, 'g');

/**
 * Every block of a kind. A block whose end marker is missing runs to the next block, the
 * options or the end of the reply, so its changes still apply (playtest D19).
 */
function blockSpans(text: string, name: string): Array<{ start: number; end: number; body: string }> {
  const out: Array<{ start: number; end: number; body: string }> = [];
  const open = `---${name}---`;
  const close = `---${endOf(name)}---`;
  let from = 0;
  for (;;) {
    const start = text.indexOf(open, from);
    if (start === -1) break;
    const bodyAt = start + open.length;
    const closeAt = text.indexOf(close, bodyAt);
    const next = text.slice(bodyAt).search(/---[A-Z_]+---/);
    const nextAt = next === -1 ? -1 : bodyAt + next;
    if (closeAt !== -1 && (nextAt === -1 || closeAt <= nextAt)) {
      out.push({ start, end: closeAt + close.length, body: text.slice(bodyAt, closeAt) });
      from = closeAt + close.length;
    } else {
      // No end marker: the block's fields are the "KEY: value" lines right after it.
      const stop = nextAt === -1 ? text.length : nextAt;
      const rest = text.slice(bodyAt, stop);
      const lines = rest.split('\n');
      let used = 0;
      let len = 0;
      for (const l of lines) {
        if (used > 0 && l.trim() && !/^\s*[A-Z][A-Z_ ]*:/.test(l)) break;
        len += l.length + 1;
        used++;
      }
      const end = Math.min(stop, bodyAt + len);
      out.push({ start, end, body: text.slice(bodyAt, end) });
      from = end;
    }
  }
  return out;
}

const blocks = (text: string, name: string) => blockSpans(text, name).map((b) => b.body);

/** "DM: With a firm grip..." is the log's format leaking into the reply (playtest D11). */
const LEADING_SPEAKER = /^\s*(?:\*\*)?(?:DM|GM|Game Master|Dungeon Master|Narrator)(?:\*\*)?\s*:\s*/i;

export function parseGmReply(raw: string): ParsedGmReply {
  let text = normaliseMarkers(raw.replace(/\r\n/g, '\n')).replace(LEADING_SPEAKER, '');

  // Options run to the end of the reply and have no end marker.
  let options: string[] = [];
  const optAt = text.indexOf('---OPTIONS---');
  if (optAt !== -1) {
    const after = text.slice(optAt + '---OPTIONS---'.length);
    // A block after the options (the model sometimes puts one there) is still read below.
    const nextBlock = after.search(/^---[A-Z_]+---/m);
    const optionText = nextBlock === -1 ? after : after.slice(0, nextBlock);
    options = optionText
      .split('\n')
      .map((l) => l.trim().replace(/^\[\d+\]\s*/, '').replace(/^\d+[.)]\s*/, '').replace(/^[-*]\s*/, '').trim())
      .filter((l) => l && !/^---/.test(l));
    text = text.slice(0, optAt) + (nextBlock === -1 ? '' : `\n${after.slice(nextBlock)}`);
  }

  let delta: GmDelta | null = null;
  for (const b of blocks(text, 'STATE_UPDATE')) {
    const d: GmDelta = delta ?? {};
    d.hpDelta = (d.hpDelta ?? 0) + num(field(b, 'HP_DELTA'));
    d.goldDelta = (d.goldDelta ?? 0) + num(field(b, 'GOLD_DELTA'));
    d.xpGained = (d.xpGained ?? 0) + Math.max(0, num(field(b, 'XP_GAINED')));
    d.itemsGained = [...(d.itemsGained ?? []), ...parseList(field(b, 'ITEMS_GAINED'))];
    d.itemsLost = [...(d.itemsLost ?? []), ...parseList(field(b, 'ITEMS_LOST'))];
    d.conditionsAdded = [...(d.conditionsAdded ?? []), ...parseList(field(b, 'CONDITIONS_ADDED'))];
    d.conditionsRemoved = [...(d.conditionsRemoved ?? []), ...parseList(field(b, 'CONDITIONS_REMOVED'))];
    d.spellsGained = [...(d.spellsGained ?? []), ...parseList(field(b, 'SPELLS_GAINED'))];
    const loc = field(b, 'LOCATION');
    if (loc && !/^(none|unchanged|same|n\/a)$/i.test(loc)) d.locationUpdate = loc.replace(/^<|>$/g, '');
    delta = d;
  }

  const alerts: CourseChangeAlert[] = blocks(text, 'COURSE_TRIGGER').map((b) => ({
    id: `alert_${uid()}`,
    title: field(b, 'TITLE') || 'Story Shift',
    type: normaliseAlertType(field(b, 'TYPE')),
    subtitle: field(b, 'SUBTITLE') || 'A turning point unfolds',
    description: field(b, 'DESCRIPTION') || 'The circumstances of your adventure have evolved.',
    timestamp: new Date().toISOString()
  }));

  const checkBlock = blocks(text, 'CHECK_REQUIRED')[0];
  const check: PendingCheck | null = checkBlock
    ? {
        skill: field(checkBlock, 'SKILL') || 'Perception',
        stat: (field(checkBlock, 'STAT') || '').toLowerCase().slice(0, 3) || undefined,
        dc: Math.min(30, Math.max(5, num(field(checkBlock, 'DC')) || 12)),
        reason: field(checkBlock, 'REASON') || 'Resolve the challenge.',
        ...(/^adv/i.test(field(checkBlock, 'ADVANTAGE') ?? '') ? { roll: 'advantage' as const } : /^dis/i.test(field(checkBlock, 'ADVANTAGE') ?? '') ? { roll: 'disadvantage' as const } : {})
      }
    : null;

  let avatarEvolution: AvatarEvolution | null = null;
  for (const b of blocks(text, 'AVATAR_EVOLUTION')) {
    if (!/EVOLVED:\s*(true|yes)/i.test(b)) continue;
    avatarEvolution = {
      evolved: true,
      visualChangeReason: field(b, 'REASON') || 'Hero visually transformed after a pivotal story beat.',
      updatedPhysicalDescription: field(b, 'PHYSICAL_DESCRIPTION')
    };
  }

  // Remove every block, including ones with no end marker.
  for (const name of BLOCK_NAMES) {
    for (const b of blockSpans(text, name).reverse()) text = `${text.slice(0, b.start)}\n\n${text.slice(b.end)}`;
  }
  text = text.replace(/---END_[A-Z_]+---/g, '').replace(/\n{3,}/g, '\n\n').trim();

  return { text, delta, alerts, check, avatarEvolution, options };
}

/** The alert to show: a conclusion or chapter change outranks any other kind. */
export function leadAlert(alerts: CourseChangeAlert[]): CourseChangeAlert | null {
  return alerts.find((a) => a.type === 'story_conclusion') ?? alerts.find((a) => a.type === 'chapter_transition') ?? alerts[0] ?? null;
}
