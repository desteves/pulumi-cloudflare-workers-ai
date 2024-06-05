import * as pulumi from "@pulumi/pulumi";
import * as cloudflare from "@pulumi/cloudflare";
import { populateWorkersKv } from './populate';
import { WranglerConfig } from './wranglerConfig';

///////////////////////////////////////////////////////////////////////////////
// Step 0 - Define Constants
const APPNAME = "quote";
const DEMOFLAG = "";
const resourceName = APPNAME + DEMOFLAG;

///////////////////////////////////////////////////////////////////////////////
// Step 1 Check needed environment variables are set up
const config = new pulumi.Config();
const accountId = config.require("accountId");
const zoneId = config.require("zoneId");
const domain = config.require("domain");

// RUN pulumi up -y
// (No infra just yet, but it will check the environment variables are set up correctly.)

///////////////////////////////////////////////////////////////////////////////
// Step 2 -  Add Key Value Namespace
const namespace = new cloudflare.WorkersKvNamespace(resourceName, {
  accountId: accountId,
  title: resourceName,
});

///////////////////////////////////////////////////////////////////////////////
// Step 3 - Populate the Key Value Namespace
populateWorkersKv(namespace.id, accountId)
// RUN npm install fs   
// RUN npm install csv-parser 
// RUN pulumi up -y
// [Optional] OPEN https://dash.cloudflare.com

///////////////////////////////////////////////////////////////////////////////
// Step 4 -  Create the Wrangler config file for the Worker Script
// https://developers.cloudflare.com/workers/wrangler/configuration/#source-of-truth
const worker = new WranglerConfig(resourceName, {
  name: resourceName,
  kvId: namespace.id,
  accountId: accountId,
});
const script = cloudflare.WorkerScript.get(resourceName, accountId+"/"+resourceName)
export const url =  pulumi.interpolate`https://${script.name}.${domain}`