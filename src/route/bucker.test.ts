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

await app.listen(3000)
await db.delete(buckets);
const api = edenTreaty<typeof bucketRoute>('http://localhost:3000')



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





describe('Buckets', () => {

    beforeEach(async () => {
        await db.delete(buckets)
    })
    

    it('Create a bucket', async () => {
        const name = faker.string.alphanumeric(10)
        const response = await api.buckets.post({ name })
        expect(response.data).toEqual({ name: name.toLocaleLowerCase() })
        expect(response.status).toBe(200)
    })

    it('List a bucket', async () => {
        const {bucket} = await TestBed()
        const response = await api.buckets.get()
        expect(response.data?.length).toEqual(1)
        expect(response.status).toBe(200)
        expect(response.error).toBeNull()
        if(!response.error){
            expect(response.data.length).toEqual(1)
            expect(response.data).toEqual([bucket])
        }
    })

    it('Delete a bucket', async () => {
        const {bucket} = await TestBed()
        const response = await api.buckets[bucket.name].delete()
        expect(response.status).toBe(200)
        expect(response.error).toBeNull()
    })
})