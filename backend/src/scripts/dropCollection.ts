import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

async function dropUsersCollection() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');

    if (mongoose.connection.db) {
      const collections = await mongoose.connection.db.listCollections().toArray();
      const usersCollectionExists = collections.some(col => col.name === 'users');

      if (usersCollectionExists) {
        await mongoose.connection.db.collection('users').drop();
        console.log('Users collection dropped successfully');
      } else {
        console.log('Users collection does not exist, no need to drop');
      }
    } else {
      console.error('Database connection is not established');
    }
  } catch (error) {
    console.error('Error dropping users collection:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

dropUsersCollection();