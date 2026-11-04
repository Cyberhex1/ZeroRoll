import { describe, it, expect } from 'vitest';
import { BANDS, bandFor, isInstalled, picksFor } from '../localModel';

describe('recommendations', () => {
  it('bands are ordered and every pick has an Ollama tag', () => {
    for (let i = 1; i < BANDS.length; i++) expect(BANDS[i].minVramGb).toBeGreaterThan(BANDS[i - 1].minVramGb);
    for (const b of BANDS) for (const p of [b.regular, b.uncensored]) expect(p.ollama).toMatch(/^(hf\.co\/[\w.-]+\/[\w.-]+:[\w.]+|[\w.-]+:[\w.-]+)$/);
  });

  it('a 12 GB card gets a 12B model; CPU-only gets the CPU band', () => {
    expect(bandFor({ usable_vram_gb: 12, backend: 'cuda' }).regular.name).toMatch(/12B/);
    expect(bandFor({ usable_vram_gb: 24, backend: 'cpu' }).id).toBe('cpu');
    expect(bandFor({ usable_vram_gb: 2, backend: 'vulkan' }).id).toBe('cpu');
  });

  it('uncensored models are offered only with Mature content on', () => {
    expect(picksFor(BANDS[2], false)).toHaveLength(1);
    expect(picksFor(BANDS[2], true)).toHaveLength(2);
  });
});

describe('installed models', () => {
  it('matches Ollama tags with or without :latest, ignoring case', () => {
    expect(isInstalled('gemma3:12b', ['gemma3:12b'])).toBe(true);
    expect(isInstalled('hf.co/TheDrummer/Rocinante-12B-v1.1-GGUF:Q4_K_M', ['hf.co/thedrummer/rocinante-12b-v1.1-gguf:Q4_K_M'])).toBe(true);
    expect(isInstalled('mistral', ['mistral:latest'])).toBe(true);
    expect(isInstalled('gemma3:12b', ['gemma3:4b'])).toBe(false);
  });
});
