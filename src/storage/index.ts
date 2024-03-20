import { BunFile } from "bun";

export interface BuuStorage {
    upload(id: string, buffer: ArrayBuffer): Promise<void>;
    get(id: string): Promise<BunFile>;
}

