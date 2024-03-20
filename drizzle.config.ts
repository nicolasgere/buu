import type { Config } from "drizzle-kit";

export default {
	schema: "./src/database/schema/*",
	out: "./migration",
	driver: "pg",
	dbCredentials: {
		connectionString:
			process.env.PG_STRING || "postgres://dev:dev@localhost:5432/dev",
	},
} satisfies Config;