Azure Functions API for Lado Beta

This folder contains a minimal Azure Function to receive subscription emails and store them in Azure Table Storage.

Environment variables (set in Azure Static Web App / Function App configuration):

- STORAGE_CONN: Azure Storage account connection string (used by @azure/data-tables)

How it works:

- POST /api/subscribe with JSON { "email": "user@example.com" }
- The function validates the email and stores it in table `Subscribers` with PartitionKey `Subscribers` and RowKey = sha256(email).

Notes:
- Do NOT check in secrets. Configure `STORAGE_CONN` in the Azure portal (Configuration) or in local.settings.json for local development.
- Install dependencies before deploying: run `npm install` inside the `api` folder.
