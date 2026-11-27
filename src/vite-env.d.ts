/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** "true" shows the Story mode route (/story). Off by default until story content ships. */
  readonly VITE_STORY_MODE?: string;
  /** Public base URL of the story art bucket (Cloudflare R2); defaults to /story-art. */
  readonly VITE_STORY_ART_BASE?: string;
}

/** `<storyId>/<file>` for each story art file in public/story-art (set by scripts/vite-story-index.ts). */
declare const __BUNDLED_STORY_ART__: string[];

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'virtual:story-index' {
  const index: Array<{ meta: import('./story/schema').Story['meta']; cover: import('./story/schema').StoryArt | null }>;
  export default index;
}
