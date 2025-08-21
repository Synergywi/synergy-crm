import { CosmosClient, Database, Container } from "@azure/cosmos";

const CONNECTION_STRING = process.env.COSMOS_CONNECTION_STRING as string | undefined;
const DB_NAME = process.env.COSMOS_DB_NAME || "synergycrm";

if (!CONNECTION_STRING) {
  throw new Error("COSMOS_CONNECTION_STRING not configured");
}

const client = new CosmosClient(CONNECTION_STRING);

export async function getDb(): Promise<Database> {
  const { database } = await client.databases.createIfNotExists({ id: DB_NAME });
  return database;
}

export async function getContainer(name: string, partitionKey: string): Promise<Container> {
  const db = await getDb();
  const { container } = await db.containers.createIfNotExists({
    id: name,
    partitionKey: { paths: [partitionKey] }
  });
  return container;
}

export type HttpResult = { status: number; body?: unknown };

export const http = {
  ok: (body: unknown): HttpResult => ({ status: 200, body }),
  created: (body: unknown): HttpResult => ({ status: 201, body }),
  bad: (msg: string): HttpResult => ({ status: 400, body: { error: msg } }),
  notfound: (): HttpResult => ({ status: 404, body: { error: "Not found" } })
};
