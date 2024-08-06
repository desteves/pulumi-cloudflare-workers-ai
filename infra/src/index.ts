import * as pulumi from "@pulumi/pulumi";
import * as cloudflare from "@pulumi/cloudflare";
import { populateDatabase } from './populate';
import * as fs from "fs";

///////////////////////////////////////////////////////////////////////////////
// Step 0 - Define constants + check for required configs
///////////////////////////////////////////////////////////////////////////////
const APPNAME = "quote";
const DEMOFLAG = pulumi.getStack() != "prod" ? "-demo" : "";
const resourceName = APPNAME + DEMOFLAG;
const config = new pulumi.Config();
const accountId = config.require("accountId");
const zoneId = config.require("zoneId");
const domain = config.require("domain");

///////////////////////////////////////////////////////////////////////////////
// Step 1  - Add DNS record for the Serverless App's subdomain
///////////////////////////////////////////////////////////////////////////////
// All domains and subdomains must have a DNS record to be proxied on 
// Cloudflare and used to invoke a Worker. 
const record = new cloudflare.Record(resourceName, {
  zoneId: zoneId,
  name: resourceName + "." + domain,
  value: "192.0.2.1",
  type: "A",
  proxied: true
});
// Export the URL as an Output for convenience
export const url = pulumi.interpolate`https://${record.name}`
// [Optional] RUN pulumi up -y

///////////////////////////////////////////////////////////////////////////////
// Step 2  - Create ALL the database-related Cloudflare resources
///////////////////////////////////////////////////////////////////////////////
// Step 2a - Add Key Value Namespace Cloudflare resource
const namespace = new cloudflare.WorkersKvNamespace(resourceName, {
  accountId: accountId,
  title: resourceName,
});

// Step 2b - Populate the Key Value Namespace resource with prod data, 2k+ entries
populateDatabase(namespace.id, accountId)
// RUN npm install fs csv-parser 

// Step 2c - Create the Worker Script that will acess the KV Namespace
const databaseWorker = new cloudflare.WorkerScript(resourceName + "-db", {
  name: resourceName + "-db",
  accountId: accountId,
  content: fs.readFileSync("../app-prod/database.ts", "utf8"),
  kvNamespaceBindings: [{
    name: "KV", /// <- super duper important!!!
    namespaceId: namespace.id,
  }],
  module: true, // ES6 module
  compatibilityDate: "2024-07-04",
});

// Step 2d - Create the Worker Route to access the DB Worker
// In order for a script to be active, a cloudflare.WorkerRoute is needed.
const databaseRoute = new cloudflare.WorkerRoute(resourceName + "-db", {
  zoneId: zoneId,
  pattern: resourceName + "." + domain + "/db",
  scriptName: databaseWorker.name,
});
// [Optional] RUN pulumi up -y

///////////////////////////////////////////////////////////////////////////////
// Step 3  - Create ALL the Cloudflare resources for the AI feature
///////////////////////////////////////////////////////////////////////////////
// Step 3a - Create the Worker Script that will run an AI model
const aiWorker = new cloudflare.WorkerScript(resourceName + "-ai", {
  name: resourceName + "-ai",
  accountId: accountId,
  content: fs.readFileSync("../app-prod/ai.ts", "utf8"),
  module: true, // ES6 module
  compatibilityDate: "2024-07-04",
  plainTextBindings: [{
    name: "AI_MODEL_ENDPOINT",
    text: "@cf/bytedance/stable-diffusion-xl-lightning"
    // text: "@cf/stabilityai/stable-diffusion-xl-base-1.0"
  }, {
    // Created ahead of time in the Cloudflare dashboard
    // Once available in the Provider, create the resource in Pulumi
    name: "GATEWAY_ID",
    text: "ai"
  }],
  secretTextBindings: [{
    // a Cloudflare API token with Workers AI Read access
    // defined in Pulumi ESC
    name: "AI_MODEL_SECRET_KEY",
    text: config.require("AI_MODEL_SECRET_KEY"),
  }, {
    name: "ACCOUNT_ID",
    text: accountId,
  }],
});

// Step 3b - Create the Worker Route to access the AI Worker
// Route pattern matching considers the entire request URL, 
// including the query parameter string. Since route patterns may not 
// contain query parameters, the only way to have a route pattern match 
// URLs with query parameters is to terminate it with a wildcard, *.
const aiRoute = new cloudflare.WorkerRoute(resourceName + "-ai", {
  zoneId: zoneId,
  pattern: resourceName + "." + domain + "/ai/*",
  scriptName: aiWorker.name,
});
// [Optional] RUN pulumi up -y

///////////////////////////////////////////////////////////////////////////////
// Step 4 - Create ALL the Cloudflare resources for the front-end
///////////////////////////////////////////////////////////////////////////////
// Step 4a - Add Key Value Namespace Cloudflare resource
// https://developers.cloudflare.com/workers/configuration/routing/custom-domains/#worker-to-worker-communication
// On the same zone, the only way for a Worker to communicate with another
//  Worker running on a route, or on a workers.dev subdomain,
//  is via service bindings.
const frontendWorker = new cloudflare.WorkerScript(resourceName, {
  name: resourceName,
  accountId: accountId,
  content: fs.readFileSync("../app-prod/frontend.ts", "utf8"),
  module: true, // ES6 module
  compatibilityDate: "2024-07-04",
  serviceBindings: [{
    name: "WORKER_AI_SERVICE",
    service: aiWorker.name
  }, {
    name: "WORKER_DB_SERVICE",
    service: databaseWorker.name
  }],
});
// Step 4b - Create the Worker Route
const frontendRoute = new cloudflare.WorkerRoute(resourceName, {
  zoneId: zoneId,
  pattern: resourceName + "." + domain,
  scriptName: frontendWorker.name,
});
