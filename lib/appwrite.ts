
import { Client, Databases, Storage, ID } from 'appwrite';

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('6989d52a000d7d636ea8');

export const databases = new Databases(client);
export const storage = new Storage(client);
export const APPWRITE_CONFIG = {
    projectId: '6989d52a000d7d636ea8',
    databaseId: '6989fca50035ccde437a',
    collectionId: 'fairy',
    gallerieCollectionId: 'gallerie',
    bucketId: '698dad88000372c2fe4c'
};
export { ID };
