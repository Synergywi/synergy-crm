import { CosmosClient, Database, Container } from '@azure/cosmos';

const conn = process.env.COSMOS_CONNECTION_STRING!;
const dbName = process.env.COSMOS_DB_NAME!;
const PARTITION_KEY = '/companyId';

if (!conn) throw new Error('Missing COSMOS_CONNECTION_STRING');
if (!dbName) throw new Error('Missing COSMOS_DB_NAME');

const client = new CosmosClient(conn);

// cache the Database object after first creation
let dbPromise: Promise<Database> | undefined;

async function getDb(): Promise<Database> {
  if (!dbPromise) {
    const { database } = await client.databases.createIfNotExists({ id: dbName });
    dbPromise = Promise.resolve(database);
  }
  return dbPromise;
}

export async function getContainer(id: string): Promise<Container> {
  const db = await getDb();
  const { container } = await db.containers.createIfNotExists({
    id,
    // NOTE: v4 types do NOT use { kind: 'Hash' } — just paths
    partitionKey: { paths: [PARTITION_KEY] }
  });
  return container;
}
