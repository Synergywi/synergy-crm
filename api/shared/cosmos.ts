import { CosmosClient, Container, Database } from "@azure/cosmos";

const conn = process.env.COSMOS_CONNECTION_STRING!;
const dbName = process.env.COSMOS_DB_NAME!;
const PARTITION_KEY = "/companyId";

if (!conn) throw new Error("Missing COSMOS_CONNECTION_STRING");
if (!dbName) throw new Error("Missing COSMOS_DB_NAME");

const client = new CosmosClient(conn);

let dbPromise: Promise<Database> | undefined;
async function getDb(): Promise<Database> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const { database } = await client.databases.createIfNotExists({ id: dbName });
      return database;
    })();
  }
  return dbPromise;
}

export async function getContainer(id: string): Promise<Container> {
  const db = await getDb();
  const { container } = await db.containers.createIfNotExists({
    id,
    partitionKey: { kind: "Hash", paths: [PARTITION_KEY] },
  });
  return container;
}
