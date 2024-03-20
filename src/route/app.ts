import { Elysia } from "elysia";
import { bucketRoute } from "./bucket";
import { blobRoute } from "./blob";
export const app = new Elysia().use(blobRoute).use(bucketRoute)
