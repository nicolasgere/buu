import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import * as buckets from "./schema/bucket"
// for query purposes
export let queryClient = new Client({
    connectionString: process.env.PG_STRING || "postgres://dev:dev@127.0.0.1:5432/dev",
}
);
await queryClient.connect();
export let db = drizzle(queryClient, {schema: {...buckets}});
