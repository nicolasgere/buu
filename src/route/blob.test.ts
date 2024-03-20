// test/index.test.ts
import { beforeEach, describe, expect, it } from 'bun:test'
import fc from 'fast-check';
import { edenTreaty } from '@elysiajs/eden'
import { bucketRoute } from './bucket'
import { app } from './app'
import { db } from '../database';
import { buckets, selectBucketSchema } from '../database/schema/bucket';
import { Static } from 'elysia';
import { faker } from '@faker-js/faker';
import { desc } from 'drizzle-orm';

await app.listen(3000)
await db.delete(buckets);
const api = edenTreaty<typeof app>('http://localhost:3000')

// Test bed
async function TestBed(): Promise<{ bucket: Static<typeof selectBucketSchema>}>{
    // Create a bucket
    const name = faker.string.alphanumeric(10)

    const response = await api.buckets.post({ name})
    if (response.error){
        throw new Error("Failed to create a bucket")
    }
    return { bucket: response.data }
}





describe('Blobs', () => {
    beforeEach(async () => {
        await db.delete(buckets)
    })
    describe('Upload', () => {
        it('Should upload new file', async () => {
            const {bucket} =  await TestBed()
            const response = await api.buckets[bucket.name].blobs.upload.post({
              path: '/test/test.txt',
              file: new File(['test'], 'test.txt')
            })
            expect(response.status).toBe(200)
            expect(response.error).toBeNull()
            expect(response.data).toEqual({ directory: 'test', name: 'test', extension: 'txt', content_size: 4 })
          })
    })

    it('Get', async () => {
        const {bucket} =  await TestBed()
        await api.buckets[bucket.name].blobs.upload.post({
          path: '/test/test.txt',
          file: new File(['foo'], 'bar.txt')
        })
        const response = await fetch(`http://localhost:3000/buckets/${bucket.name}/blobs/test/test.txt`)
        expect(response.status).toBe(200)
        expect(await response.text()).toEqual('foo')    
      })
})