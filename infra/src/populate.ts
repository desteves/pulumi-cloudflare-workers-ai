import * as cloudflare from "@pulumi/cloudflare";
import * as pulumi from "@pulumi/pulumi";
import fs from 'fs';
import csvParser from 'csv-parser';

// Yes, if the CSV file changes, 
// on the next pulumi up, 
// the Workers KV will be updated accordingly
const csv = (pulumi.getStack() === "prod") ? '../data/prod.csv' : '../data/sample.csv';

let count = 0;
export function populateDatabase(nsId: pulumi.Output<string>, aId: string) {
    fs.createReadStream(csv)
        .pipe(csvParser())
        .on('data', (data) => {
            // Process each row/entry from the CSV file here
            new cloudflare.WorkersKv(data.Id, {
                accountId: aId,
                namespaceId: nsId,
                key: data.Id,
                value: data.Text,
            });
            count++;
        })
        .on('error', (error) => {
            console.error('Error reading CSV file:', error);
        });
}