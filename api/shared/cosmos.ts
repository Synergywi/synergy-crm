// api/shared/cosmos.ts
import { CosmosClient, Container, Database, PartitionKeyDefinition } from "@azure/cosmos";

// Re-export http so existing imports like
//   import { http, getContainer } from "../shared/cosmos"
// keep working without touching the routes.
export { http } from "./http";

const endpoint   = process.env.COSMOS_CONNECTION_STRING ?? process.env.COSMOS_ENDPOINT;
const connString = process.env.COSMOS_CONNECTION_STRING;
const dbName     = process.env.COSMOS_DB_NAME || "synergycrm";

// Lazily create a client once
let client: CosmosClient | null = null;
function getClient(): CosmosClient {
  if (client) return client;
  if (connString) {
    client = new CosmosClient(connString);
  } else if (endpoint) {
    // fallback if someone used endpoint/key style (not typical for SWA)
    client = new CosmosClient(endpoint);
  } else {
    throw new Error("COSMOS_CONNECTION_STRING is not set.");
  }
  return client!;
}

let dbPromise: Promise<Database> | null = null;
async function getDb(): Promise<Database> {
  if (!dbPromise) {
    const c = getClient();
    dbPromise = c.databases.createIfNotExists({ id: dbName }).then(r => r.database);
  }
  return dbPromise!;
}

// NOTE: keep the signature compatible with existing calls.
// Many of your routes do getContainer("cases", req).
// We ignore the second parameter, it’s just for backwards-compat.
export async function getContainer<T = unknown>(
  containerName: string,
  _unused?: unknown
): Promise<Container> {
  const db = await getDb();
  const pk: PartitionKeyDefinition = { paths: ["/companyId"] }; // no "kind" property
  const { container } = await db.containers.createIfNotExists({ id: containerName, partitionKey: pk });
  return container;
}
