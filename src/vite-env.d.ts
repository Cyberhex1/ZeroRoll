/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** "true" shows the Story mode route (/story). Off by default until story content ships. */
  readonly VITE_STORY_MODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
