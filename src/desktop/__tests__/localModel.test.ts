import { describe, it, expect } from 'vitest';
import { BANDS, bandFor, picksFor, resolveHfFile, resolveLlamaBuild, SystemInfo } from '../localModel';

const SHA = 'a'.repeat(64);
const fakeFetch = (body: unknown, status = 200) => (async () => ({ ok: status === 200, status, json: async () => body })) as unknown as typeof fetch;
const info = (o: Partial<SystemInfo>): SystemInfo => ({ os: 'windows', arch: 'x86_64', cpu_threads: 8, ram_gb: 32, gpus: [], backend: 'cuda', usable_vram_gb: 12, ...o });

describe('recommendations', () => {
  it('bands are ordered and every pick is a GGUF file', () => {
    for (let i = 1; i < BANDS.length; i++) expect(BANDS[i].minVramGb).toBeGreaterThan(BANDS[i - 1].minVramGb);
    for (const b of BANDS) for (const p of [b.regular, b.uncensored]) expect(p.file).toMatch(/\.gguf$/i);
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

describe('download sources', () => {
  it('reads the checksum Hugging Face lists for the file', async () => {
    const f = await resolveHfFile('org/repo', 'm.gguf', fakeFetch([{ path: 'm.gguf', lfs: { oid: SHA, size: 5 } }]));
    expect(f).toMatchObject({ sha256: SHA, url: 'https://huggingface.co/org/repo/resolve/main/m.gguf' });
  });

  it('refuses a file without a checksum, or one that is gone', async () => {
    await expect(resolveHfFile('org/repo', 'm.gguf', fakeFetch([{ path: 'm.gguf' }]))).rejects.toThrow(/checksum/);
    await expect(resolveHfFile('org/repo', 'm.gguf', fakeFetch([]))).rejects.toThrow(/no longer/);
  });

  const release = {
    tag_name: 'b9999',
    assets: [
      { name: 'llama-b9999-bin-win-cpu-x64.zip', browser_download_url: 'https://x/cpu.zip', digest: `sha256:${SHA}` },
      { name: 'llama-b9999-bin-win-cuda-12.4-x64.zip', browser_download_url: 'https://x/cuda.zip', digest: `sha256:${SHA}` },
      { name: 'cudart-llama-bin-win-cuda-12.4-x64.zip', browser_download_url: 'https://x/rt.zip', digest: `sha256:${SHA}` },
      { name: 'llama-b9999-bin-ubuntu-vulkan-x64.zip', browser_download_url: 'https://x/vk.zip', digest: `sha256:${SHA}` },
    ],
  };

  it('picks the CUDA build plus its runtime on Windows with an NVIDIA card', async () => {
    const files = await resolveLlamaBuild(info({}), fakeFetch(release));
    expect(files.map((f) => f.url)).toEqual(['https://x/cuda.zip', 'https://x/rt.zip']);
  });

  it('uses Vulkan on Linux and CPU when there is no GPU', async () => {
    expect((await resolveLlamaBuild(info({ os: 'linux' }), fakeFetch(release)))[0].url).toBe('https://x/vk.zip');
    expect((await resolveLlamaBuild(info({ backend: 'cpu' }), fakeFetch(release)))[0].url).toBe('https://x/cpu.zip');
  });

  it('refuses an asset without a digest', async () => {
    const noDigest = { ...release, assets: release.assets.map((a) => ({ ...a, digest: undefined })) };
    await expect(resolveLlamaBuild(info({ backend: 'cpu' }), fakeFetch(noDigest))).rejects.toThrow(/checksum/);
  });
});
