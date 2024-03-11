import * as pulumi from "@pulumi/pulumi";
import { local } from "@pulumi/command"; // in preview
import * as cloudflare from "@pulumi/cloudflare";
import { populateWorkersKv } from './populate';

const APPNAME = "quote"
const DEMOFLAG = "-wrcmd"
///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
// Step 1 -  //////////////////////////////////////////////////////
// Check needed environment variables are set up
const config = new pulumi.Config();
const accountId = config.require("accountId");
const zoneId = config.require("zoneId");
const domain = config.require("domain");
const token =  config.requireSecret("cloudflare:apiToken");
///////////////////////////////////////////////////////////////////
// RUN pulumi up -y
// (No infra just yet, but it will check the environment variables are set up correctly.)

///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
// Step 2 -  //////////////////////////////////////////////////////
// A Key Value Namespace
const namespace = new cloudflare.WorkersKvNamespace(APPNAME + DEMOFLAG, {
  accountId: accountId,
  title: APPNAME + DEMOFLAG,
});

// A sample entry to the Key Value Namespace
// const kv = new cloudflare.WorkersKv("elarroyo-test" + DEMOFLAG, {
//   accountId: accountId,
//   namespaceId: namespace.id,
//   key: "test",
//   value: "test test test 123",
// });
///////////////////////////////////////////////////////////////////
// RUN pulumi up -y
// [Optional] OPEN https://dash.cloudflare.com

///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
// Step 3 -  //////////////////////////////////////////////////////
// Populate the Key Value Namespace with El Arroyo submissions
populateWorkersKv(namespace.id, accountId)
///////////////////////////////////////////////////////////////////
// RUN npm install fs   
// RUN npm install csv-parser 
// RUN pulumi up -y
// [Optional] OPEN https://dash.cloudflare.com

///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
// Step 4 -  //////////////////////////////////////////////////////
// Create the wrangler config file for the Worker Script
// https://developers.cloudflare.com/workers/wrangler/configuration/#source-of-truth
const workerScriptName = APPNAME + DEMOFLAG;
const wranglerConfig = pulumi.jsonStringify({
  name: workerScriptName,
  main: "src/index.ts",
  minify: true,
  compatability_date: "2024-03-08",
  ai: {
    binding: "AI"
  },
  kv_namespaces: [
    {
      binding: "KV",
      id: pulumi.interpolate`${namespace.id}`,
      preview_id: pulumi.interpolate`${namespace.id}`
    }
  ],
});

// Create a local file using the command provider
const crudWranglerConfig = new local.Command("crudWranglerConfig", {
  create: `echo ` + wranglerConfig + ` > wrangler.json`,
  delete: `rm wrangler.json`,
  dir: "../app/worker",
},
  {
    protect: true,

    //   dependsOn: wranglerConfig, // HOW TO ENSURE THIS?
  }
);


let cf = new cloudflare.Provider("cf", {}, {});
///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
// Step 5 -  //////////////////////////////////////////////////////
// https://developers.cloudflare.com/workers/wrangler/api/
// Deploy the Worker with Wrangler
const crudWorkerScript = new local.Command("crudWorkerScript", {
  create: "npx wrangler deploy -j --outdir ./dest --keep-vars=true",
  delete: "npx wrangler delete -j",
  //update: "",
  dir: "../app/worker",
  environment: {
    "CLOUDFLARE_ACCOUNT_ID": accountId,
    "CLOUDFLARE_API_TOKEN": token,
  },
},
  {
    provider: cf,
    dependsOn: crudWranglerConfig,
    protect: true,
  }
);


///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
// Step 6 -  //////////////////////////////////////////////////////
// // A Worker script to invoke with access to the Key Value Namespace
// const script = new cloudflare.WorkerScript(APPNAME + DEMOFLAG, {
//   accountId: accountId,
//   name: APPNAME + DEMOFLAG,
//   content: fs.readFileSync("../app/dist/bundle.mjs", "utf8"),
//   kvNamespaceBindings: [{
//     name: "KV_NAMESPACE_BINDING",
//     namespaceId: namespace.id,
//   }],
//   module: true, // ES6 module
//   // compatibilityFlags: ["nodejs_compat"],
//   compatibilityDate: "2024-02-28",
//   serviceBindings: [{
//     name: "AI_BINDING",
//     service: "Todo ----- !!!",
//   }],
// }, { protect: true });

///////////////////////////////////////////////////////////////////
// EDIT app/worker.ts to use a random KV entry
// RUN pulumi up -y
// [Optional] OPEN https://dash.cloudflare.com/24725f46259aa3c2a1d7810649cd7428/workers-and-pages
// Note, no route...yet!

///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
// Step 6 -  //////////////////////////////////////////////////////
// A Worker route to serve requests and the Worker script
const route = new cloudflare.WorkerRoute(APPNAME + DEMOFLAG, {
  zoneId: zoneId,
  pattern: APPNAME + DEMOFLAG + "." + domain,
  scriptName: workerScriptName, //crudWorkerScript.id, // ???????
}, {
  dependsOn: crudWorkerScript,

});
// An Output displaying the url for the app
export const url = route.pattern
///////////////////////////////////////////////////////////////////
// RUN pulumi up -y
// [Optional] OPEN https://dash.cloudflare.com/24725f46259aa3c2a1d7810649cd7428/workers-and-pages
// Note, no dns record...yet!

///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
// Step 7 -  //////////////////////////////////////////////////////
// A DNS record to access the route from the domain
const record = new cloudflare.Record(APPNAME + DEMOFLAG, {
  zoneId: zoneId,
  name: APPNAME + DEMOFLAG,
  value: "192.0.2.1",
  type: "A",
  proxied: true
},
  {
    dependsOn: route,
  });
///////////////////////////////////////////////////////////////////
// RUN pulumi up -y
// [Optional] OPEN https://dash.cloudflare.com/24725f46259aa3c2a1d7810649cd7428/atxyall.com/dns/records


///////////////////////   END OF DEMO    /////////////////////////
///////////////////////////////////////////////////////////////////
// Step 7 -  //////////////////////////////////////////////////////
// A Caching Rule to avoid caching. 
// Caching itself will still depend on the cache-control header 
// const caching = new cloudflare.Ruleset(APPNAME + DEMOFLAG, {
//   zoneId: zoneId,
//   name: 'default', //APPNAME + DEMOFLAG,
//   description: "Avoid caching",
//   kind: "zone",
//   phase: "http_request_cache_settings",
//   rules: [{
//     action: "set_cache_settings",
//     actionParameters: {
//       cache: false,
//       edgeTtl:
//       {
//         mode: "bypass_by_default",
//       },
//       browserTtl: {
//         mode: "bypass",
//       },
//     },
//     expression: "(http.request.full_uri contains \"" + APPNAME + DEMOFLAG + "\")",
//     description: "Set cache settings and custom cache key for " + route.pattern,
//     enabled: true
//   }]
// })
