import mongoose from 'mongoose';
import { User } from '../models/User';
import { hashPassphrase } from '../utils/crypto';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/your_database_name';

async function updateUserPassphrases() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({ passphrase: { $exists: false } });
    console.log(`Found ${users.length} users without passphrases`);

    for (const user of users) {
      const defaultPassphrase = 'default_passphrase'; // You might want to use a more secure default
      const hashedPassphrase = await hashPassphrase(defaultPassphrase);
      user.passphrase = hashedPassphrase;
      await user.save();
      console.log(`Updated user ${user._id}`);
    }

    console.log('Finished updating user passphrases');
  } catch (error) {
    console.error('Error updating user passphrases:', error);
  } finally {
    await mongoose.disconnect();
  }
}

updateUserPassphrases();