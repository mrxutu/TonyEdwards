# Tony’s memorial page

Open `site/index.html` in a browser to review the draft. The RSVP fields work in preview, with a message explaining that email delivery is off.

## GitHub Pages

Push this repository to `mrxutu/TonyEdwards` on `main`. In GitHub, choose Settings → Pages → Build and deployment → GitHub Actions. The workflow publishes only `site/` (including `.nojekyll`) at `https://mrxutu.github.io/TonyEdwards/`.

## Enable RSVP email

1. `worker/wrangler.toml` sets `PAGES_ORIGIN` to `https://mrxutu.github.io` and `RSVP_FROM` to `Tony’s Memorial <rsvp@ulcozens.com>`.
2. From `worker/`, run `npx wrangler deploy`, then `npx wrangler secret put RESEND_API_KEY` and enter your key at the prompt. Keep the key out of the repository.
3. In `site/index.html`, set the form’s empty `data-endpoint` to the deployed Worker URL followed by `/rsvp`. Publish the updated page and submit a test RSVP. A successful response means Resend accepted the email. Check that it arrives at p@ulcozens.com.
