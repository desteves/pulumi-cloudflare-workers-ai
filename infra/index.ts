import * as pulumi from "@pulumi/pulumi";
import { local } from "@pulumi/command"; // in preview
import * as cloudflare from "@pulumi/cloudflare";
import { populateWorkersKv } from './populate';
import { WranglerConfig } from './wranglerConfig';
import hashlib = require('hash.js');
import * as fs from 'fs';

const APPNAME = "quote";
const DEMOFLAG = "-demo";
const resourceName = APPNAME + DEMOFLAG;

///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
// Step 1 -  //////////////////////////////////////////////////////
// Check needed environment variables are set up
const config = new pulumi.Config();
const accountId = config.require("accountId");
// const zoneId = config.require("zoneId");
// const domain = config.require("domain");
///////////////////////////////////////////////////////////////////
// RUN pulumi up -y
// (No infra just yet, but it will check the environment variables are set up correctly.)

///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
// Step 2 -  //////////////////////////////////////////////////////
// A Key Value Namespace
const namespace = new cloudflare.WorkersKvNamespace(resourceName, {
  accountId: accountId,
  title: resourceName,
});


///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
// Step 3 -  //////////////////////////////////////////////////////
// Populate the Key Value Namespace
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
const wranglerConfig = new WranglerConfig(resourceName, {
  name: resourceName,
  kvId: namespace.id,
}, 
// {
//   replaceOnChanges: ["*"], Not possible for custom resources
// }
);

const hash = hashlib.sha256().update(fs.readFileSync("../app/worker/src/index.ts", "utf8")).digest('hex');
///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
// Step 5 -  //////////////////////////////////////////////////////
// https://developers.cloudflare.com/workers/wrangler/api/
// Deploy the Worker with Wrangler
const crud = "npx wrangler deploy --keep-vars=true --experimental-json-config --outdir ./dist";
const wranglerDeploy = new local.Command(resourceName, {
  create: crud,
  update: crud,
  delete: "", //"npx wrangler delete --experimental-json-config",
  dir: "../app/worker",
  environment: {
    "CLOUDFLARE_ACCOUNT_ID": accountId,
    "CLOUDFLARE_API_TOKEN": cloudflare.config.apiToken,
    "MAIN_SHA256": hash,
  },
  triggers: [wranglerConfig],
},
  {
    dependsOn: wranglerConfig,
    replaceOnChanges: ["environment"],
  }
);

export const wranglerDeployOutput = pulumi.interpolate`${wranglerDeploy.stdout}`;
