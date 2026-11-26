# Scene art

Pictures of the moment, painted by Google's image models with the player's own Gemini key and shown under the Game Master's text a few seconds after the reply. Code: `src/art/sceneArt.ts` (settings, probing, key moments, prompt, painting) and `src/art/ui/` (the picture slot and the Settings panel). Wired in `src/components/ExperienceView.tsx`; `NarrativeStream` renders it through `renderAfterMessage`.

## When a picture is painted

Settings, Scene art, has three modes. It is **off by default** because every picture costs money on the player's key (Google has no free tier for image models).

- **Key moments**: the opening scene, a new place (the `LOCATION` line changed), a chapter change, a twist, an ambush or crisis, a hero transformation (`AVATAR_EVOLUTION`), and the ending. Chapter changes, the opening and the ending always paint; the others wait at least 3 turns after the last picture. Capped per day (default 20, editable); over the cap the player sees a note with a Retry that paints anyway.
- **Only when I ask**: a "Paint this scene" button under the newest reply.
- **Off**: nothing.

The key moments come from blocks the Game Master already writes, so the play prompt is unchanged.

## Models

Only image models that answered a probe with this key are offered (the probe asks for a one-word text reply, so it costs a few text tokens, not a picture). Test Connection runs it, and so does "Check image models" in the panel. Default is the cheapest usable one.

| Model | Name | About per picture |
|---|---|---|
| gemini-3.1-flash-lite-image | Nano Banana 2 Lite | 3.4¢, ~3 s |
| gemini-nano-banana-2.1 | Nano Banana 2.1 | 3.4¢ |
| gemini-3.1-flash-image | Nano Banana 2 | 6.7¢, ~8 s |
| gemini-3-pro-image | Nano Banana Pro | 13¢ |

Prices from https://ai.google.dev/gemini-api/docs/pricing (Nov 2026), about 1,120 output tokens per 1K picture. The usage meter counts image requests, and the panel shows today's pictures and an estimated spend.

## The prompt

`buildScenePrompt`: the reply text (up to 1,800 characters), a per-category anime look, what to focus on for this kind of moment, the current place, the hero's appearance (shown from behind or at a distance unless the moment is about them), no text in the image, and a content line that follows the mature-content setting.

## Storage and failures

Google returns a ~900 KB JPEG; it is shrunk to a ~1024 px WebP and kept in IndexedDB (`images` store) like portraits. The message keeps a `zr-img:` reference in `LogMessage.sceneArt`, so saves stay small. Another device shows "painted on another device". A refused or failed picture shows the reason with Retry; nothing is substituted.
