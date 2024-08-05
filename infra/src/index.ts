import * as pulumi from "@pulumi/pulumi";
import * as cloudflare from "@pulumi/cloudflare";
import { populateWorkersKv } from './populate';
import { WranglerConfig } from '../../RECYCLE_BIN/wranglerConfig';
import * as fs from "fs";

///////////////////////////////////////////////////////////////////////////////
// Step 0 - Define Constants
const APPNAME = "quote";
const DEMOFLAG = "";
const resourceName = APPNAME + DEMOFLAG;

///////////////////////////////////////////////////////////////////////////////
// Step 1 Check environment variables
const config = new pulumi.Config();
const accountId = config.require("accountId");
const zoneId = config.require("zoneId");
const domain = config.require("domain");

// RUN pulumi up -y
// (No infra just yet, but it will check the environment variables are set up correctly.)

///////////////////////////////////////////////////////////////////////////////
// Step 2 -  Add Key Value Namespace resource
const namespace = new cloudflare.WorkersKvNamespace(resourceName, {
  accountId: accountId,
  title: resourceName,
});

///////////////////////////////////////////////////////////////////////////////
// Step 3 - Populate the Key Value Namespace resource with prod data, 2k+ entries
populateWorkersKv(namespace.id, accountId)
// RUN npm install fs   
// RUN npm install csv-parser 
// RUN pulumi up -y
// [Optional] OPEN https://dash.cloudflare.com

///////////////////////////////////////////////////////////////////////////////
// Step 4 - Create the Worker that will acess the KV Namespace
const databaseWorker = new cloudflare.WorkerScript(resourceName + "-db", {
  name: resourceName,
  accountId: accountId,
  content: fs.readFileSync("./app-prod/database.ts", "utf8"),
  kvNamespaceBindings: [{
    name: "KV", /// <- super duper important!!!
    namespaceId: namespace.id,
  }],
});

///////////////////////////////////////////////////////////////////////////////
// Step 5 - Create the Worker that will perform the AI feature
const worker = new WranglerConfig(resourceName, {
  name: resourceName,
  kvId: namespace.id,
  accountId: accountId,
});

const script = cloudflare.WorkerScript.get(resourceName, accountId + "/" + resourceName)

const aiWorker = new cloudflare.WorkerScript(resourceName + "-ai", {
  name: resourceName,
  accountId: accountId,
  content: fs.readFileSync("./app-prod/ai.ts", "utf8"),
  serviceBindings: [{
    name: databaseWorker.name,
    service: databaseWorker.name
  }],

});

///////////////////////////////////////////////////////////////////////////////
// Step 6 - Create the Worker that will render the HTML front-end
const frontEndWorker = new cloudflare.WorkerScript(resourceName + "-fe", {
  name: resourceName,
  accountId: accountId,
  content: fs.readFileSync("./app-prod/frontend.ts", "utf8"),
  serviceBindings: [{
    name: aiWorker.name,
    service: aiWorker.name
  }],
});


///////////////////////////////////////////////////////////////////////////////
// Step 7 - Create the Worker Route



///////////////////////////////////////////////////////////////////////////////
// Step 5 -  Create the Wrangler config file for the Worker Script
// https://developers.cloudflare.com/workers/wrangler/configuration/#source-of-truth



// Step 8 - Export the URL as an Output
export const url = pulumi.interpolate`https://${script.name}.${domain}`