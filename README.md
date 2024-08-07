# Cloudflare Workers AI deployed with Pulumi

The app displays a random quote and a text-to-image AI background representative of such.

![Screenshot](./docs/images/hero.png)

## Overview

- [App Dev code  -- Single Worker](./app/)
- [App Prod code -- Multiple Workers](./app=prod/)
- [Infra Test+Prod code](./infra/)

## Pre-reqs

- npm
- Pulumi CLI
- Wrangler
- Pulumi Cloud account
- Cloudflare account with a Zone configured.

### Local development (Wrangler)

- Use the Wrangler CLI to test the Worker

### Testing (Pulumi)

- Using the `test` Pulumi stack to incrementally add the Cloudflare Resources.
- Uses a sample size for the data
- Adds a `DEMO` flag to the Cloudflare resources
- Triggered manually via `pulumi up` commands
- Stores all secrets + config in Pulumi ESC
- Running under [`quote-demo.atxyall.com`](https://quote-demo.atxyall.com/)

### Production (GitHub Actions + Pulumi)

- Uses GitHub Actions
  - preview prod on GitHub commit to a PR against main
  - update prod on GitHub merge to the main branch
- Uses GitHub OIDC to auth against Pulumi Cloud
- Uses the full prod size data, 2400+ CSV Entries
- Running under [`quote.atxyall.com`](https://quote.atxyall.com/)
