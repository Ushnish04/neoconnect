import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  text: { type: String, required: true },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const caseSchema = new mongoose.Schema({
  trackingId: { type: String, unique: true },
  category: { type: String, enum: ['Safety', 'Policy', 'Facilities', 'HR', 'Other'], required: true },
  department: { type: String, required: true },
  location: { type: String, required: true },
  severity: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
  description: { type: String, required: true },
  attachments: [{ type: String }],
  anonymous: { type: Boolean, default: false },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status: { type: String, enum: ['New', 'Assigned', 'In Progress', 'Pending', 'Resolved', 'Escalated'], default: 'New' },
  notes: [noteSchema],
  aiSummary: { type: String, default: null },
  summarizedAt: { type: Date, default: null },
  lastResponseAt: { type: Date, default: Date.now },
}, { timestamps: true });

caseSchema.index({ status: 1 });
caseSchema.index({ department: 1 });
caseSchema.index({ assignedTo: 1 });
caseSchema.index({ createdAt: 1 });

export default mongoose.model('Case', caseSchema);