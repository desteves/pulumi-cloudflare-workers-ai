import * as cloudflare from "@pulumi/cloudflare";
import * as pulumi from "@pulumi/pulumi";
import fs from 'fs';
import csvParser from 'csv-parser';

const csv = '../data/sample.csv';

let count = 0;
export function populateWorkersKv(nsId: pulumi.Output<string>, aId: string) {
    // Loopy loops and lollipops
    fs.createReadStream(csv)
        .pipe(csvParser())
        .on('data', (data) => {
            // Process each row/entry from the CSV file here
            new cloudflare.WorkersKv(data.Date, {
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