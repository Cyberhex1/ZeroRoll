/**
 * Play-screen skins. Each category has a base skin; a story's `skin` block overrides any
 * part of it. The resolved skin becomes CSS variables on the play screen's root, and the
 * play screen's components use only those variables, so one screen renders every story.
 * D&D mode will reuse the category skins (one per category).
 */
import type { ExperienceCategory } from '../types';
import type { SkinOverride } from './schema';

export interface Skin {
  palette: { background: string; surface: string; accent: string; text: string; muted: string; playerBubble: string; narratorBubble: string };
  fonts: { heading: 'serif' | 'sans' | 'mono' | 'display' | 'hand'; body: 'serif' | 'sans' | 'mono' };
  bubble: 'rounded' | 'square' | 'soft' | 'scroll';
  pattern: 'none' | 'dots' | 'grid' | 'grain' | 'stars' | 'waves';
  backgroundArt?: string;
  particles: 'none' | 'embers' | 'snow' | 'petals' | 'rain' | 'motes' | 'ash';
  ambient?: string;
}

const P = (background: string, surface: string, accent: string, text: string, muted: string, playerBubble: string, narratorBubble: string): Skin['palette'] => ({
  background, surface, accent, text, muted, playerBubble, narratorBubble
});

export const CATEGORY_SKINS: Record<ExperienceCategory, Skin> = {
  fantasy: { palette: P('#120f1a', '#1c1728', '#e0a84f', '#ece4d4', '#a89c88', '#3a2b14', '#1b1626'), fonts: { heading: 'display', body: 'serif' }, bubble: 'scroll', pattern: 'stars', particles: 'motes' },
  adventure: { palette: P('#0f1712', '#17221b', '#7fc77a', '#e6efe4', '#98ab95', '#23402a', '#162019'), fonts: { heading: 'display', body: 'sans' }, bubble: 'rounded', pattern: 'grid', particles: 'none' },
  historical_adventure: { palette: P('#17130e', '#221c14', '#c9a464', '#eee4cf', '#a8977a', '#3d301c', '#211b13'), fonts: { heading: 'serif', body: 'serif' }, bubble: 'scroll', pattern: 'grain', particles: 'none' },
  horror: { palette: P('#0b0909', '#151010', '#b3261e', '#e8dede', '#9a8a8a', '#3a1210', '#140f0f'), fonts: { heading: 'serif', body: 'serif' }, bubble: 'square', pattern: 'grain', particles: 'ash' },
  cozy_ghibli: { palette: P('#14201c', '#1d2c27', '#f2b880', '#f4efe3', '#b8b39f', '#46553a', '#1c2a25'), fonts: { heading: 'hand', body: 'sans' }, bubble: 'soft', pattern: 'dots', particles: 'petals' },
  romantic: { palette: P('#1a0f16', '#261620', '#f08bb0', '#f6e6ee', '#b7959f', '#4a1f33', '#24141d'), fonts: { heading: 'hand', body: 'serif' }, bubble: 'soft', pattern: 'none', particles: 'petals' },
  revenge: { palette: P('#0d0b0b', '#181313', '#d4442e', '#efe5e2', '#a08f8b', '#3b1610', '#171212'), fonts: { heading: 'display', body: 'sans' }, bubble: 'square', pattern: 'none', particles: 'embers' },
  apocalypse: { palette: P('#15120c', '#211c13', '#e08a2c', '#ece2cf', '#a69779', '#43301a', '#1f1a12'), fonts: { heading: 'mono', body: 'sans' }, bubble: 'square', pattern: 'grain', particles: 'ash' },
  zombie: { palette: P('#0e120c', '#171d14', '#9bc53d', '#e4ebd9', '#97a487', '#2d3d1a', '#161c13'), fonts: { heading: 'mono', body: 'sans' }, bubble: 'square', pattern: 'grain', particles: 'none' },
  cosmic_horror: { palette: P('#07080f', '#10121f', '#6fd3c1', '#dde3ef', '#8b93a8', '#16303a', '#0f111c'), fonts: { heading: 'serif', body: 'serif' }, bubble: 'square', pattern: 'waves', particles: 'motes' },
  psychedelic_trip: { palette: P('#12081c', '#1d0f2c', '#ff5fd2', '#f5e9ff', '#b79fcc', '#3a1856', '#1a0d27'), fonts: { heading: 'display', body: 'sans' }, bubble: 'soft', pattern: 'waves', particles: 'motes' },
  tiktok_drama: { palette: P('#0c0c10', '#17171e', '#25f4ee', '#f2f2f7', '#9d9daa', '#3a1430', '#16161d'), fonts: { heading: 'sans', body: 'sans' }, bubble: 'rounded', pattern: 'none', particles: 'none' },
  ancient_greek: { palette: P('#0f1420', '#18202f', '#d9b55a', '#eef0f4', '#9ea7b8', '#2b3550', '#172031'), fonts: { heading: 'display', body: 'serif' }, bubble: 'scroll', pattern: 'grid', particles: 'none' },
  mythology: { palette: P('#100d18', '#1a1525', '#c79bff', '#ece6f5', '#a197b3', '#2f2147', '#191423'), fonts: { heading: 'display', body: 'serif' }, bubble: 'scroll', pattern: 'stars', particles: 'motes' },
  real_life: { palette: P('#111214', '#1b1d20', '#6aa9ff', '#eceef2', '#9aa0a8', '#22344f', '#1a1c1f'), fonts: { heading: 'sans', body: 'sans' }, bubble: 'rounded', pattern: 'none', particles: 'none' }
};

export function resolveSkin(category: ExperienceCategory, override: SkinOverride = {}): Skin {
  const base = CATEGORY_SKINS[category] ?? CATEGORY_SKINS.fantasy;
  return {
    palette: { ...base.palette, ...override.palette },
    fonts: { ...base.fonts, ...override.fonts },
    bubble: override.bubble ?? base.bubble,
    pattern: override.pattern ?? base.pattern,
    backgroundArt: override.backgroundArt ?? base.backgroundArt,
    particles: override.particles ?? base.particles,
    ambient: override.ambient ?? base.ambient
  };
}

const FONT_STACKS: Record<string, string> = {
  serif: 'Georgia, "Iowan Old Style", "Times New Roman", serif',
  sans: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  mono: 'ui-monospace, "Cascadia Mono", Consolas, "SFMono-Regular", monospace',
  display: '"Palatino Linotype", "Book Antiqua", Palatino, Georgia, serif',
  hand: '"Segoe Print", "Bradley Hand", "Comic Neue", ui-rounded, cursive'
};

const RADII: Record<Skin['bubble'], string> = { rounded: '14px', square: '3px', soft: '22px', scroll: '6px 18px' };

const PATTERNS: Record<Skin['pattern'], (accent: string) => string> = {
  none: () => 'none',
  dots: (a) => `radial-gradient(${a}22 1px, transparent 1px)`,
  grid: (a) => `linear-gradient(${a}14 1px, transparent 1px), linear-gradient(90deg, ${a}14 1px, transparent 1px)`,
  grain: () => 'repeating-radial-gradient(circle at 30% 40%, #ffffff06 0 1px, transparent 1px 3px)',
  stars: (a) => `radial-gradient(${a}33 1px, transparent 1.5px), radial-gradient(#ffffff22 1px, transparent 1px)`,
  waves: (a) => `repeating-linear-gradient(135deg, ${a}10 0 2px, transparent 2px 22px)`
};

/** The CSS variables for a skin. Contrast is the author's job; the validator does not check it. */
export function skinVars(skin: Skin): Record<string, string> {
  const p = skin.palette;
  return {
    '--sk-bg': p.background,
    '--sk-surface': p.surface,
    '--sk-accent': p.accent,
    '--sk-text': p.text,
    '--sk-muted': p.muted,
    '--sk-player': p.playerBubble,
    '--sk-narrator': p.narratorBubble,
    '--sk-font-heading': FONT_STACKS[skin.fonts.heading],
    '--sk-font-body': FONT_STACKS[skin.fonts.body],
    '--sk-radius': RADII[skin.bubble],
    '--sk-pattern': PATTERNS[skin.pattern](p.accent),
    '--sk-pattern-size': skin.pattern === 'stars' ? '37px 37px, 89px 89px' : skin.pattern === 'grid' ? '28px 28px' : '18px 18px'
  };
}
