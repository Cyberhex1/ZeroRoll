# ZeroRoll Workspace Rules

1. **User Premise & Choices are Authoritative**:
   - Never override the user's custom story concept, character name, chosen gender/pronouns, or player choices with preset defaults.
   - Seedlist materials and narrative profiles serve to enrich *how* the story is narrated, paced, and styled.

2. **D&D 5e Mechanical Rigor**:
   - Maintain proper D&D 5e checks with valid DC values (10-20), ability modifiers, advantage/disadvantage, and HP calculations.
   - Output structured blocks (`---STATE_UPDATE---`, `---AVATAR_EVOLUTION---`, `---COURSE_TRIGGER---`, `---CHECK_REQUIRED---`, `---OPTIONS---`) cleanly.

3. **Avatar & Visual Integrity**:
   - Avatars must use the dramatic cartoon / graphic novel cel-shaded profile portrait style.
   - Never replace AI avatar rendering with crude placeholders.

4. **UI & Scrolling Stability**:
   - Scrolling in `NarrativeStream` must remain strictly container-scoped and only trigger when new logs arrive. Never cause full-page or window jumps on action submission.

5. **Code & Build Quality**:
   - Always run `npx tsc --noEmit` and `npx vite build` after making modifications.
