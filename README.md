# ColorSense

**The question:** You already have a closet. Why is “what colors suit me” still a mood board or a stranger’s seasonal quiz?

ColorSense is **colors and outfits that fit you.** Take a photo, tap the pixels that are actually your skin / hair / contrast, and get a seasonal palette plus what to lean on and what to skip.

**How we built that:** a two-stage **LAB / LCH** classifier in the browser — 4 season families, then 12 subseasons — with optional **Supabase** login and an edge **color-agent** for outfit language. Season anchors are regression-tested with **Vitest**.

**Live demo:** [colorsense-ai-stylist.vercel.app](https://colorsense-ai-stylist.vercel.app)

---

## Decision this supports

Generic “you’re an autumn” apps guess from a selfie they never let you correct. The waste is buying a palette that does not match the colors on your face.

Two decisions ColorSense is built for:

1. **Which season family, then which subseason** — from colors you picked, not from a 10-question personality test.
2. **What to wear toward** — hues to lean on and hues to skip, in plain language.

---

## What you get

1. **Photo in** — camera or gallery
2. **Pick colors** — Spot / Dominant / Auto on skin, hair, contrast
3. **Season + palette** — spring / summer / autumn / winter, then 12 subseasons
4. **Outfit direction** — via `color-agent` when the backend is configured
5. **Optional account** — save results with Supabase auth

---

## What it will not claim

Not a dermatologist. Not a shopping engine. Lighting and camera white-balance still move the pixels — you pick the spots so a bad auto-crop cannot invent a season. Historical git had a `.env` in old commits (anon key); rotate in Supabase if that project is still live.

---

## What’s in the repo

| Path | |
|---|---|
| `src/pages/` | Home, picker, result, reset-password |
| `src/lib/color-utils.ts` | Two-stage LAB classifier |
| `src/test/season-anchors.ts` | 24 calibration colors (2 per subseason) |
| `supabase/functions/` | `analyze-color`, `color-agent`, cache |
| [`docs/COLOR_CLASSIFICATION_2STAGE.md`](docs/COLOR_CLASSIFICATION_2STAGE.md) | Family scores (W / V / K) and subseason rules |
| [`docs/AUTH_SETUP.md`](docs/AUTH_SETUP.md) | Site URL + redirect URLs for Vercel |

---

## How we built it (technical)

Stack: **Vite** · **React** · **TypeScript** · **Tailwind** · **shadcn/ui** · **Supabase** (auth + edge functions) · **Vitest**. Dev server port **8080**.

**Classifier.** RGB → LAB. Features: L, a, b, chroma `C`, warmth `W` (sigmoid on b*), value `V = L/100`, clarity `K`. Stage 1 softmax over four families (warm/clear/light vs warm/soft vs cool/soft vs cool/clear). Stage 2 picks a subseason inside that family. Continuous scores in `[0,1]` — no boolean gates. Spec: `docs/COLOR_CLASSIFICATION_2STAGE.md`.

**Picker.** You tap pixels. Dominant / Auto modes exist; a later commit kept simple pixel picking as the reliable path when Dominant misfired on dark colors.

**Outfit copy.** `ResultPage` invokes the `color-agent` edge function. Analysis can cache (`color-analysis-cache`). Do not put `service_role` in the frontend.

**Calibration.** `scripts/run-calibration-standalone.mjs` and `docs/calibration/`. Tests: `npm test` against the 12-season anchors.

---

## Setup

```sh
git clone https://github.com/MANYI-anewbird/ColorSense.git
cd ColorSense
npm install
cp .env.example .env
```

From [Supabase](https://app.supabase.com) → **Settings → API**:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PROJECT_ID`
- `VITE_SUPABASE_PUBLISHABLE_KEY` (anon / publishable only)

For login on a deployed URL, set Site URL + Redirect URLs — [`docs/AUTH_SETUP.md`](docs/AUTH_SETUP.md).

```sh
npm run dev
```

| Command | |
|---|---|
| `npm run dev` | Dev server (8080) |
| `npm run build` | Production build |
| `npm test` | Vitest |
| `npm run lint` | ESLint |

---

## License

MIT. See [LICENSE](LICENSE).
