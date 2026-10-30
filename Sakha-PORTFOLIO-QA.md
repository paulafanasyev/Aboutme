# Sakha portfolio: QA and implementation notes

## Permanent identity

- Keep **АЛГЫС КЫТЫЛЫТ** visible in the header, section markers, and footer in every interface language.
- The existing interface language options remain Russian (`RU`), English (`EN`), and Vietnamese (`VI`).
- The language switch may translate the supporting name and page content, but must never hide or replace the Sakha wordmark.

## Interactive alas

- The CSS landscape is the fallback layer; Three.js is loaded only when the alas is within 240 px of the viewport.
- Keyboard: move with `WASD` or arrow keys when the pointer is over or focus is within the map; press `E` to open the nearest linked section.
- Touch: hold the on-screen directional controls to move; tap a landmark in the scene or the matching accessible navigation card to open a section.
- The scene bounds movement to the visible landscape, pauses its animation outside the viewport, and respects `prefers-reduced-motion`.
- Do not describe this as a finished free-roaming 3D game: it is an interactive portfolio landscape without full character physics, collision, or a full mobile-device acceptance test.

## Hosting paths

- GitHub Pages uses `/Aboutme/` as the Vite base path.
- Vercel uses `/` when `VERCEL=1` so built assets resolve at the domain root.
- A plain HTTP 200 for `index.html` is not sufficient: verify that the JS and CSS asset URLs referenced by the HTML also return HTTP 200.

## CI checks

The validation workflow should run:
1. `npm ci`
2. `npm run build` for the GitHub Pages base path
3. `npm run build` with `VERCEL=1`
4. A separate TypeScript check for `api/chat.ts` with Node and DOM types
5. `npm run lint`

## Remaining release gates

- Verify the actual Vercel Preview for the latest commit, including JS/CSS asset requests and the AI chat endpoint.
- Test keyboard movement, tap-and-hold controls, landmark activation, reduced-motion behavior, and layout at narrow mobile widths.
- Confirm the final Sakha wording with a fluent Sakha speaker before treating it as linguistically approved.
