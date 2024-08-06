import * as pulumi from "@pulumi/pulumi";
import * as cloudflare from "@pulumi/cloudflare";
import { populateDatabase } from './populate';
import * as fs from "fs";

///////////////////////////////////////////////////////////////////////////////
// Step 0 - Define constants + check for required configs
const APPNAME = "quote";
const DEMOFLAG = pulumi.getStack() != "prod" ? "-demo" : "";
const resourceName = APPNAME + DEMOFLAG;

const config = new pulumi.Config();
const accountId = config.require("accountId");
const zoneId = config.require("zoneId");
const domain = config.require("domain");
// [Optional] RUN `pulumi up -y`
// (No infra just yet, but it will check the environment variables are set up correctly.)


///////////////////////////////////////////////////////////////////////////////
// Step 1  - Create all the database-related Cloudflare resources
// Step 1a - Add Key Value Namespace Cloudflare resource
const namespace = new cloudflare.WorkersKvNamespace(resourceName, {
  accountId: accountId,
  title: resourceName,
});

// Step 1b - Populate the Key Value Namespace resource with prod data, 2k+ entries
populateDatabase(namespace.id, accountId)
// RUN npm install fs csv-parser 
// [Optional] RUN pulumi up -y
// [Optional] OPEN https://dash.cloudflare.com

// Step 1c - Create the Worker that will acess the KV Namespace
const databaseWorker = new cloudflare.WorkerScript(resourceName + "-db", {
  name: resourceName,
  accountId: accountId,
  content: fs.readFileSync("../app-prod/database.ts", "utf8"),
  kvNamespaceBindings: [{
    name: "KV", /// <- super duper important!!!
    namespaceId: namespace.id,
  }],
});
// [Optional] RUN pulumi up -y

///////////////////////////////////////////////////////////////////////////////
// Step 2 - Create the Cloudflare resources for the AI feature
// const aiWorker = new cloudflare.WorkerScript(resourceName + "-ai", {
//   name: resourceName,
//   accountId: accountId,
//   content: fs.readFileSync("../app-prod/ai.ts", "utf8"),
//   serviceBindings: [{
//     name: databaseWorker.name,
//     service: databaseWorker.name
//   }],
//   plainTextBindings: [{
//     name: "AI_MODEL_ENDPOINT",
//     text: "namespace.id",
//   }],
//   secretTextBindings: [{
//     name: "AI_MODEL_SECRET",
//     text: config.require("AI_MODEL_SECRET"),
//   }],
// });
// [Optional] RUN pulumi up -y

///////////////////////////////////////////////////////////////////////////////
// Step 3 - Create the Cloudflare resources for the front-end
// Step 3a - Add Key Value Namespace Cloudflare resource
// const frontEndWorker = new cloudflare.WorkerScript(resourceName + "-fe", {
//   name: resourceName,
//   accountId: accountId,
//   content: fs.readFileSync("../app-prod/frontend.ts", "utf8"),
//   serviceBindings: [{
//     name: aiWorker.name,
//     service: aiWorker.name
//   }],
// });
// Step 3b - Create the Worker Route
// TODO
// Step 3c - Export the URL as an Output for convenience
// export const url = pulumi.interpolate`https://${script.name}.${domain}`
// RUN pulumi up -y 
// 