# infra (opentofu)

The royashbrook.com Cloudflare "clicky-layer" as code: dns records, zone settings, the www->apex
redirect. State lives in R2 (`royashbrook-tfstate`). Changes flow plan-on-PR / apply-on-merge via
`.github/workflows/infra.yml`.

## ownership boundary (so wrangler + tofu never fight)

- **wrangler** owns: the worker code + bindings (`../wrangler.jsonc`) and the **apex** custom domain
  (the proxied `AAAA 100::` apex record is wrangler's, NOT imported here).
- **tofu** owns: dns records (the o365 mail stack + `www`), zone settings (`always_use_https`), the
  `www`->apex redirect ruleset.
- HSTS is NOT a zone setting here; it rides in the site's `public/_headers` (the worker serves it).
- email is on **o365** (plain dns records). CF Email Routing is staged commented in `email.tf` for a
  future receive-only catch-all cutover.

## secrets (never in tofu state)

Three values, kept in the macOS keychain via the `secrets` skill, never printed:
`cf-tofu-token`, `r2-tofu-key-id`, `r2-tofu-secret`. They're also pushed to GH Actions secrets as
`TF_CLOUDFLARE_API_TOKEN`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` for CI.

## running locally

```sh
S=~/.claude/skills/secrets/scripts/secret
$S run CLOUDFLARE_API_TOKEN=cf-tofu-token AWS_ACCESS_KEY_ID=r2-tofu-key-id AWS_SECRET_ACCESS_KEY=r2-tofu-secret \
  -- tofu -chdir=infra plan
```
