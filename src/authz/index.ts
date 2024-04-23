import { BucketConfiguration } from "../database/schema/bucket";



interface Actor {
    anonymous: boolean;
}

interface Resource {
    configuration: BucketConfiguration;
}



interface Action {
    name: 'blob_get' | 'blob_list' | 'blob_upload' | 'bucket_create' | 'bucket_list' | 'bucket_delete' | 'bucket_get';
}




export class Authz {
   static async can(actor: Actor, action: Action, resource: Resource): Promise<boolean> {
        if (resource.configuration.public !== true && actor.anonymous === true) {
            return false;
        }
        return true
    }
}