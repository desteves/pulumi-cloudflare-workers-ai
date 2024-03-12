import * as pulumi from "@pulumi/pulumi";
import * as fs from 'fs';
import hashlib = require('hash.js');

// Define the shape of our resource inputs with this interface
export interface WranglerConfigArgs {
    name: pulumi.Input<string>;
    kvId: pulumi.Input<string>;
};

export class WranglerConfig extends pulumi.ComponentResource {
    constructor(name: string, args: WranglerConfigArgs, opts?: pulumi.ComponentResourceOptions) {
        super("cloudflare:WorkerScript:WranglerConfig", name, args, opts);
        pulumi.jsonStringify({
            "name": name,
            "main": "src/index.ts",
            "minify": true,
            "compatibility_date": "2024-03-12",
            "ai": {
                "binding": "AI"
            },
            "kv_namespaces": [
                {
                    "binding": "KV",
                    "id": args.kvId,
                }
            ],
            "workers_dev": false,
            "route": {
                "pattern": name + ".atxyall.com",
                "custom_domain": true,
            }
        }).apply(json => {
            let path = "../app/worker/wrangler.json"; // TODO - make this an arg so it can be set by the user
            fs.writeFileSync(path, json);
        });
    }
}
