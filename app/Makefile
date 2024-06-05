# Makefile for deploying a Cloudflare Worker using Wrangler

WRANGLER = npx wrangler
JSON_FILE = wrangler.json

.PHONY: all
all: deploy

.PHONY: deploy
deploy: createjson
	$(WRANGLER) deploy --experimental-json-config --outdir ./dist --latest --compatibility-date "2024-03-01" > deploy.log

.PHONY: createjson
createjson:
	@echo '{' > $(JSON_FILE)
	@echo '  "name": "$(NAME)",' >> $(JSON_FILE)
	@echo '  "main": "./src/worker.ts",' >> $(JSON_FILE)
	@echo '  "minify": true,' >> $(JSON_FILE)
	@echo '  "ai": {"binding": "AI"},' >> $(JSON_FILE)
	@echo '  "kv_namespaces": [{' >> $(JSON_FILE)
	@echo '    "binding": "KV",' >> $(JSON_FILE)
	@echo '    "id": "$(KV_ID)"' >> $(JSON_FILE)
	@echo '  }],' >> $(JSON_FILE)
	@echo '  "workers_dev": false,' >> $(JSON_FILE)
	@echo '  "route": {' >> $(JSON_FILE)
	@echo '    "pattern": "$(NAME).atxyall.com",' >> $(JSON_FILE)
	@echo '    "custom_domain": true' >> $(JSON_FILE)
	@echo '  }' >> $(JSON_FILE)
	@echo '}' >> $(JSON_FILE)
	@cat $(JSON_FILE) | jq > /dev/null || (echo "Error: JSON file is not valid" && exit 1)


.PHONY: delete
delete:
	$(WRANGLER) delete --experimental-json-config > /dev/null || exit 0
