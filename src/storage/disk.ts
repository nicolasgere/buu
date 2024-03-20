import {join} from 'path'
import { BuuStorage } from '.'
import { BunFile } from 'bun'

export class DiskStorage implements BuuStorage {
    constructor(private dataPath: string) {
    }
    private getPathFromId(id: string): string {
        
        return join(this.dataPath, id)
    }
    async upload(id: string, buffer: ArrayBuffer): Promise<void> {
        // write to disk
        await Bun.write(this.getPathFromId(id), buffer)
    }
    async get(id: string): Promise<BunFile> {
        const file = Bun.file(this.getPathFromId(id))
       const exist = await file.exists()
         if(!exist){
              throw new Error('File not found')
            }
        return file
    }
}