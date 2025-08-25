import { CosmosClient, Container } from "@azure/cosmos";

const connectionString = process.env.COSMOS_CONNECTION_STRING || "";
if (!connectionString) {
  console.warn("[contacts api] COSMOS_CONNECTION_STRING not set. The API will fail until it's configured.");
}

const dbName = process.env.COSMOS_DB || "synergycrm";
// Default container name can be overridden via env var
const containerName = process.env.COSMOS_CONTAINER_CONTACTS || "contacts";

let _container: Container | null = null;

export function getContactsContainer(): Container {
  if (_container) return _container;
  const client = new CosmosClient(connectionString);
  _container = client.database(dbName).container(containerName);
  return _container;
}
