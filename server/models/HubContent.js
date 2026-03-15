import mongoose from 'mongoose';

const hubContentSchema = new mongoose.Schema({
  type: { type: String, enum: ['digest', 'impact', 'minutes'], required: true },
  title: { type: String, required: true },
  content: { type: String },
  quarter: { type: String },
  raised: { type: String },
  action: { type: String },
  outcome: { type: String },
  fileUrl: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('HubContent', hubContentSchema);