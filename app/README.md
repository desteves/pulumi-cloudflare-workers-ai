 npx wrangler dev --remote

--experimental-json-config // because of validation json support natively in typescript/






```bash`
mkdir worker 
cd worker
npm create cloudflare@latest .
# Hello World Worker
# Typescript
# No Deploy.


npx wrangler dev --remote     

```

<!-- # Cloudflare Workers

App that randomly displays a quote and its AI Image. Uses various Worker Scripts

Breaking down the functionaly across workers per

*"Split your Workers into service-oriented architecture using  Service bindings to make your application more modular, easier to maintain, and more performant."*
 
# With Wrangler **Recommended**

## Test locally

### AI Worker

1. Run the worker `npx wrangler dev`
2. Use `curl` or Postman
```bash
curl --location 'http://localhost:8787/' \
--header 'Content-Type: application/json' \
--data-raw '{
    "model": "@cf/bytedance/stable-diffusion-xl-lightning",
    "prompt": "cyberpunk cat"
}'
```

<!-- npx wrangler dev --remote      -->
### KV Worker

1. Run the worker `npx wrangler dev`
2. Add dummy KV entries
```bash
npx wrangler kv:namespace create kv --preview


KV_NS_ID=$( npx wrangler kv:namespace list  |  jq '.[] | select(.title == "quote-demo-kv-worker-wrangler-quote-demo-kv-dev") | .id' -r )

npx wrangler kv:key put "1" "one I uno un" --namespace-id="${KV_NS_ID}"
npx wrangler kv:key put "2" "two II dos deux" --namespace-id="${KV_NS_ID}"
npx wrangler kv:key put "3" "three III tres trois" --namespace-id="${KV_NS_ID}"
npx wrangler kv:key put "count" "3" --namespace-id="${KV_NS_ID}"
```

3. Use `curl` or Postman
```bash
curl --location 'http://localhost:8787/' \
--header 'Content-Type: application/json' \
--data-raw '{
    "model": "@cf/bytedance/stable-diffusion-xl-lightning",
    "prompt": "cyberpunk cat"
}'
```


<!-- # Sans Wrangler
## Deploy AI Worker 
`npx wrangler deploy`
`npm run build:display` --> -->