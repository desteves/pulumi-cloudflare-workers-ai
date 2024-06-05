# Pulumi-deployed Cloudflare Workers AI serverless app

The app displays a random quote and a text-to-image AI background representative of such.

![Screenshot](./docs/images/hero.png)

## Overview

- [App code](./app/)
- [Infra code](./infra/)

## Pre-reqs

### Local development

- Use the Wrangler CLI via Makefile

```bash
cd app
npx wrangler kv:namespace create "KV" 
#  ensure to update wrangler.toml

# KV_NS_ID=$( npx wrangler kv:namespace list  |  jq '.[] | select(.title == "kv-wrangler") | .id' -r )
KV_NS_ID=3dfdfc3f927c4698a3fbac85363eb419
npx wrangler kv:key put '1' 'one I uno un' --namespace-id="${KV_NS_ID}"
npx wrangler kv:key put '2' 'two II dos deux' --namespace-id="${KV_NS_ID}"
npx wrangler kv:key put '3' 'three III tres trois' --namespace-id="${KV_NS_ID}"
npx wrangler kv:key put 'count' '3' --namespace-id="${KV_NS_ID}"


# TODO
```

### E2E Testing && Production

#### Infra code

- Use Pulumi and CI/CD to adhere to GitOps best practices

```bash
```
