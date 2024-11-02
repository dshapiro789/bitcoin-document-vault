import mongoose, { Schema, Document } from 'mongoose';

export interface IDocument extends Document {
  userId: string;  // This will now be the user's fingerprint
  fileName: string;
  fileType: string;
  fileSize: number;
  path: string;
  category: string;
  hash: string;
  uploadDate: Date;
  contractAddress?: string;
  unlockTime?: Date;
  redeemScript?: string;
}

const DocumentSchema: Schema = new Schema({
  userId: { type: String, required: true },  // This will now be the user's fingerprint
  fileName: { type: String, required: true },
  fileType: { type: String, required: true },
  fileSize: { type: Number, required: true },
  path: { type: String, required: true },
  category: { type: String, required: true },
  hash: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
  contractAddress: { type: String },
  unlockTime: { type: Date },
  redeemScript: { type: String }
});

export const DocumentModel = mongoose.model<IDocument>('Document', DocumentSchema);