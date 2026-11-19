# quiz-worker

Cloudflare Worker that grades the blog quizzes and issues PDF certificates.

The blog page (`content/quiz/*`) only has the questions. The answer key lives in
Cloudflare D1, so it can't be read from the page source.

```
Hugo page ──POST /quizzes/:id/submit──▶ Worker ──▶ D1 (answer key)
                                           │
          ◀── { passed, score, certificateUrl }
                                           │
          ──GET /certificates/:id──────▶ PDF rendered on the fly (pdf-lib)
```

## Endpoints

| Method | Path                          | Description                                                  |
|--------|-------------------------------|--------------------------------------------------------------|
| POST   | `/quizzes/:quizId/submit`     | `{ name, answers: { q1: 2, ... }, turnstile? }` → score; issues a certificate when `score >= min_score` |
| GET    | `/certificates/:id`           | Certificate PDF                                              |
| GET    | `/certificates/:id/verify`    | Certificate data as JSON (`{ valid, name, quiz, score, issuedAt }`) |

Only the score goes back to the page, never which questions were wrong.

## Local development

```bash
cd quiz-worker
npm install
npm run db:migrate:local
npm run db:seed:local
npm run dev                # http://localhost:8787
npm test                   # unit tests (grading / validation)
```

Then, from the repository root, run `make quiz_server`. It starts Hugo pointing at
`http://localhost:8787`. Open http://localhost:1313/quiz/rabbitmq-fundamentos/.

## Deploy

```bash
npx wrangler login
npx wrangler d1 create quiz-db           # copy the database_id into wrangler.toml
npm run db:migrate:remote
npm run db:seed:remote
npm run deploy                           # prints the *.workers.dev URL
```

Put the deployed URL in `config.toml` → `[Params.quiz] endpoint`.

### Optional: Turnstile (anti-bot)

1. Create a Turnstile widget in the Cloudflare dashboard for the blog domain.
2. `npx wrangler secret put TURNSTILE_SECRET` with the secret key.
3. Set `[Params.quiz] turnstileSiteKey` in `config.toml` with the site key.

When `TURNSTILE_SECRET` is not set, the Worker skips the check.

## Adding a new quiz

1. Create `content/quiz/<quiz-id>/index.md` (copy `rabbitmq-fundamentos`). Keep the
   `build.list: never`, `sitemap.disable` and `noindex` front matter so the page stays
   reachable only through its URL.
2. Create `seeds/<quiz-id>.sql` with the quiz and its answer key. The `id` of each `mcq`
   shortcode must match `questions.id`, and options are numbered from 1 in the order
   written.
3. Run it: `npx wrangler d1 execute quiz-db --remote --file=seeds/<quiz-id>.sql`.
   You don't need to redeploy the Worker.

## Useful queries

```bash
# certificates issued
npx wrangler d1 execute quiz-db --remote --command "SELECT id, name, score, issued_at FROM certificates ORDER BY issued_at DESC LIMIT 20"
# revoke a certificate
npx wrangler d1 execute quiz-db --remote --command "UPDATE certificates SET revoked = 1 WHERE id = '<uuid>'"
```

## Known limitations

- A person can retry until they pass. Turnstile stops bots, not people. If that becomes
  a problem, consider a [rate limiting binding](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)
  or a limit on attempts per IP.
- Standard PDF fonts only cover Latin-1. Accented Portuguese names work; other scripts
  are degraded (accents stripped, or `?`). Embedding a TTF font would fix that.
- Personal data (LGPD): only the name is stored, and only for issued certificates.
