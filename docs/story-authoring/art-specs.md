# Art specs

- **Format**: WebP, 1024 px wide (portraits 768 x 768), 250 KB or less each.
  `story:import` refuses larger files.
- **Names**: lowercase letters, digits, `-` and `_`, ending in `.webp`. The file name is
  listed in the story's `art` map with an id and alt text:
  `"bell": { "file": "bell.webp", "alt": "A bronze bell hanging in a flooded chamber." }`
- **Alt text** is read aloud by screen readers and shown if the image cannot load, so it
  describes what is in the picture in one sentence.
- **What to make for each story**: one cover (`meta.cover`), one portrait per cast member
  (`cast[].portrait`), and one image per art cue (8 to 12 cues for a typical story). A
  background image is optional (`skin.backgroundArt`); it is shown dimmed behind the chat.
- **Consistency**: generate portraits first and reuse the same character descriptions
  (the `appearance` lines) in every scene prompt, so faces, hair and clothes match.
- **Hosting**: the import uploads images to Cloudflare R2. Players' devices cache each image
  after its first view, so stories played once work offline in the PC app.
