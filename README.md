# ColorSense AI Stylist

Personal color and outfit guidance — take a photo, pick the colors that matter, and get a seasonal palette that actually fits you.

**Live demo:** [colorsense-ai-stylist.vercel.app](https://colorsense-ai-stylist.vercel.app)

---

## What it does

1. **Photo in** — camera or gallery
2. **Pick colors** — tap the pixels that represent skin / hair / contrast (spot / dominant / auto)
3. **Season + palette** — two-stage LAB/LCH classifier: 4 season families, then 12 subseasons
4. **Outfit direction** — which hues to lean on, which to skip
5. **Optional account** — save results with Supabase auth

---

## Stack

Vite · React · TypeScript · Tailwind · shadcn/ui · Supabase (auth + edge functions) · Vitest

```
src/pages/          # home, picker, result
src/lib/            # color math, free analysis, season test
src/components/     # picker, season test, swatches
supabase/functions/ # analyze-color, cache, color-agent
docs/               # calibration, deploy, auth notes
```

---

## Local setup

```sh
git clone https://github.com/MANYI-anewbird/colorsense-ai-stylist.git
cd colorsense-ai-stylist
npm install
cp .env.example .env
```

Fill in `.env` from your [Supabase](https://app.supabase.com) project (**Settings → API**):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PROJECT_ID`
- `VITE_SUPABASE_PUBLISHABLE_KEY` (anon / publishable key only)

For login on a deployed URL, set Site URL + Redirect URLs in Supabase Auth — see [`docs/AUTH_SETUP.md`](docs/AUTH_SETUP.md).

```sh
npm run dev
```

---

## Scripts

| Command | |
|---|---|
| `npm run dev` | Dev server (port 8080) |
| `npm run build` | Production build |
| `npm test` | Vitest |
| `npm run lint` | ESLint |

Season-anchor calibration lives in `scripts/run-calibration-standalone.mjs` and [`docs/calibration/`](docs/calibration/).

---

## License

MIT. See [LICENSE](LICENSE).
