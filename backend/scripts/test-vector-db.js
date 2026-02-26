import dotenv from 'dotenv';
import { processAllPdfs } from './vectorDb.js';

dotenv.config();
console.log('Starting PDF processing test...');
console.log('Using Pinecone API Key:', process.env.PINECONE_API_KEY ? 'Found' : 'Missing');
console.log('Using Pinecone Environment:', process.env.PINECONE_ENVIRONMENT);
console.log('Using Pinecone Index:', process.env.PINECONE_INDEX_NAME);

processAllPdfs()
    .then(() => {
        console.log('PDF processing completed successfully');
    })
    .catch((error) => {
        console.error('Error during PDF processing:', error);
    });