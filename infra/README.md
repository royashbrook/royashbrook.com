# infra (opentofu)

The royashbrook.com Cloudflare "clicky-layer" as code: dns records, zone settings, the www->apex
redirect. State lives in R2 (`royashbrook-tfstate`). Pull requests run credential-free
validation; pushes to main apply through `.github/workflows/infra.yml`.

## ownership boundary (so wrangler + tofu never fight)

- **wrangler** owns: the worker code + bindings (`../wrangler.jsonc`) and the **apex** custom domain
  (the proxied `AAAA 100::` apex record is wrangler's, NOT imported here).
- **tofu** owns: dns records (the o365 mail stack + `www`), zone settings (`always_use_https`), the
  `www`->apex redirect ruleset.
- HSTS is NOT a zone setting here; it rides in the site's `public/_headers` (the worker serves it).
- email is on **o365** (plain dns records). CF Email Routing is staged commented in `email.tf` for a
  future receive-only catch-all cutover.

## secrets (never in tofu state)

Three values, kept in the OS keychain via [hush](https://github.com/royashbrook/hush), never printed:
`royashbrook-cf-tofu-token`, `royashbrook-r2-tofu-key-id`, `royashbrook-r2-tofu-secret` (default `hush`
namespace, project-prefixed names). CI reads them from the `infrastructure` environment as
`TF_CLOUDFLARE_API_TOKEN`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`. Restrict that
environment to the `main` branch. Remove repository-level copies after secure recovery,
environment installation and a successful main apply; repository secrets remain available
to changed pull-request workflows.

Before releasing this workflow, recover both R2 credentials into Hush and install them in
the protected environment. Do not remove the only working copies before recovery succeeds.
Pull-request validation disables the backend and cannot produce a state-backed plan.

## running locally

```sh
hush run CLOUDFLARE_API_TOKEN=royashbrook-cf-tofu-token \
         AWS_ACCESS_KEY_ID=royashbrook-r2-tofu-key-id \
         AWS_SECRET_ACCESS_KEY=royashbrook-r2-tofu-secret \
  -- tofu -chdir=infra plan
```
