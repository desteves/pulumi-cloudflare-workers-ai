# Pulumi-deployed Cloudflare Workers AI serverless app

The app displays a random quote and a text-to-image AI background representative of such.

![Screenshot](./docs/images/hero.png)

# Run

1. Build the app

    ```bash
    cd app
    npm run build:display
    ```

2. Deploy the app

    ```bash
    cd infra
    # edit the Pulumi.test.yaml values as needed
    pulumi up
    ```
