# Tony’s memorial page

The public site is published from `site/`. The RSVP form sends to the Cloudflare Worker after its `RESEND_API_KEY` secret is configured.

## GitHub Pages

This repository uses GitHub Actions as its Pages source. Pushing `main` publishes only `site/` (including `.nojekyll`) at `https://mrxutu.github.io/TonyEdwards/`.

## Enable RSVP email

1. `worker/wrangler.toml` sets `PAGES_ORIGIN` to `https://mrxutu.github.io` and `RSVP_FROM` to `Tony’s Memorial <p@ulcozens.com>`.
2. The Worker is deployed at `https://tony-memorial-rsvp.p-666.workers.dev`. From `worker/`, run `npx wrangler secret put RESEND_API_KEY` and enter the key at the prompt. Keep it out of the repository.
3. The form points to the Worker’s `/rsvp` endpoint. Submit a test RSVP. A successful response means Resend accepted the email; check that it arrives at mrxutu@icloud.com.
