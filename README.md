# Store (monorepo)

Features
- Monorepo with `web` (Next.js) and `api` (Express + Prisma)
- Product CSV export/import endpoints
- Admin, shop, checkout, and delivery flows (see `web/app`)

Quick start (local)
1. Install dependencies:

```bash
pnpm install
```

2. Add env (copy `.env.example`):

```bash
cp .env.example .env.local
# edit .env.local and fill values
```

3. Run development (root uses Turborepo):

```bash
pnpm dev
```

Build (API only)

```bash
cd apps/api
pnpm run build
```

Tests

```bash
pnpm --filter web test
```

Deploy to Vercel
1. Create a Vercel project and connect to this GitHub repository.
2. Add the environment variables listed in `.env.example` on the Vercel project settings (Production/Preview/Development as needed).
3. Vercel will run `pnpm install` and `turbo run build` by default. If you see warnings about missing env vars in `turbo.json`, add those keys under `pipeline` for the relevant tasks or ensure Vercel project env settings are set.

Notes
- If TypeScript build fails with implicit `any` errors, annotate the parameter types or enable `noImplicitAny: false` temporarily in `tsconfig.json` while you fix types.
- Prisma postinstall may warn if it cannot find a schema in default location; run `prisma generate --schema=./path/to/schema.prisma` if your schema is elsewhere.

Need help?
If you want, I can run the TypeScript build locally in the workspace or open a PR with typed fixes for other implicit any errors.
# Store

