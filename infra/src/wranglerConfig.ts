import * as pulumi from "@pulumi/pulumi";
import { local } from "@pulumi/command";
import * as cloudflare from "@pulumi/cloudflare";

// Interim solution while we wait for the cloudflare-go SDK to be updated
// https://github.com/cloudflare/cloudflare-go/issues/1507


// Define the shape of our resource inputs with this interface
export interface WranglerConfigArgs {
    name: pulumi.Input<string>;
    kvId: pulumi.Input<string>;
    accountId: pulumi.Input<string>;
};

// https://www.pulumi.com/docs/concepts/resources/components/
// Create a new ComponentResource to represent our WranglerConfig
// Calls the makefile to create the Worker script
export class WranglerConfig extends pulumi.ComponentResource {

    // public url: pulumi.Output<string>;
    public globs: pulumi.Output<local.RunResult>;

    constructor(name: string, args: WranglerConfigArgs, opts?: pulumi.ComponentResourceOptions) {
        super("cloudflare:WorkerScript:WranglerConfig", name, args, opts);

        this.globs = local.runOutput({
            dir: "../app/",
            command: "cat Makefile",
            assetPaths: ["Makefile", "src/**", "public/**"],
        });

        const wrangler = new local.Command("wrangler", {
            create: "make",
            delete: "make delete",
            dir: "../app/",

            environment: {
                "NAME": name,
                "KV_ID": args.kvId,
                "CLOUDFLARE_ACCOUNT_ID": args.accountId,
                "CLOUDFLARE_API_TOKEN": cloudflare.config.apiToken,
                // "RANDOM": Math.random().toString(), // Forces a change
            },
            assetPaths: ["Makefile", "wrangler.json", "deploy.log"],
            triggers: [this.globs],
        },
            {
                parent: this,
                deleteBeforeReplace: true,
                replaceOnChanges: ["environment"], // Force a replacement if the environment changes
            });
    }
}
