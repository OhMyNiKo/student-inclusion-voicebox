# Student Inclusion Voicebox

An anonymous student feedback portal with a moderated public Q&A board.

The public GitHub Pages frontend is served from `docs/` at:

`https://ohmyniko.github.io/student-inclusion-voicebox/`

It uses the deployed application as a database and authentication API because
GitHub Pages only hosts static files and cannot run server code.

## What it does

- Accepts feedback without requiring a name, account, or sign-in.
- Keeps every new submission private until a moderator replies.
- Publishes approved questions and official replies in a newest-first card grid.
- Gives moderators an oldest-first queue with reply, update, and permanent delete controls.
- Opens the moderation desk when the configured server-side passphrase is submitted through the main voicebox.

## Security model

The moderation passphrase is never included in client-side source. It is checked on the server and exchanged for an eight-hour, signed, HTTP-only, same-site session cookie. The session signing secret must be at least 32 characters.

Set these production runtime secrets:

```text
ADMIN_PASSPHRASE=<private passphrase>
SESSION_SECRET=<at least 32 random characters>
```

Do not commit real values. Local environment files are ignored by Git.

## Data

Questions and replies are stored in Cloudflare D1. The schema and generated migration are in `db/schema.ts` and `drizzle/`.

## Development

```bash
pnpm install
pnpm db:generate
pnpm dev
```

The production build is created with:

```bash
pnpm build
```

## Routes

- `/` — anonymous submission form
- `/voices` — published questions and replies
- `/admin` — protected moderation desk
