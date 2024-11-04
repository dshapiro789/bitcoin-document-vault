import mongoose from 'mongoose';

async function dropCollection() {
  try {
    // Ensure connection exists
    if (!mongoose.connection || !mongoose.connection.db) {
      throw new Error('Database connection not established');
    }

    // Drop the collection
    await mongoose.connection.db.collection('users').drop();
    console.log('Users collection dropped successfully');
  } catch (error) {
    console.error('Error dropping collection:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
  }
}

export default dropCollection;