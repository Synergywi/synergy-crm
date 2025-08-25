const { CosmosClient } = require("@azure/cosmos");

const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const dbName = process.env.COSMOS_DB || "crm";
const containerName = process.env.COSMOS_CONTAINER || "companies";

if (!endpoint || !key) {
  console.warn("[cosmos] Missing COSMOS_ENDPOINT or COSMOS_KEY environment variables.");
}

const client = new CosmosClient({ endpoint, key });
const db = client.database(dbName);
const container = db.container(containerName);

module.exports = { client, db, container };
