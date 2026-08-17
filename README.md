# ColorSense AI Stylist

Personal color and outfit guidance — take a photo, pick the colors that matter, and get a seasonal palette that actually fits you.

**Live demo:** [colorsense-ai-stylist.vercel.app](https://colorsense-ai-stylist.vercel.app)

---

## What it does

- **Photo in** — camera or gallery
- **Pick colors** — tap the pixels that represent skin / hair / contrast
- **Season + palette** — two-stage color classification (LAB / LCH) into seasonal types
- **Outfit direction** — which hues to lean on, which to skip
- **Optional account** — save results with Supabase auth

---

## Stack

Vite · React · TypeScript · Tailwind · shadcn/ui · Supabase · Vitest

```
src/pages/          # home, picker, result
src/lib/            # color math, free analysis, season test
src/components/     # picker, season test, swatches
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
- `VITE_SUPABASE_PUBLISHABLE_KEY` (anon / publishable key)

```sh
npm run dev
```

---

## Scripts

| Command | |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm test` | Vitest |
| `npm run lint` | ESLint |

---

## License

MIT. See [LICENSE](LICENSE).
