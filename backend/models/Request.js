import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
  department: String,
  machine: String,
  machineId: String,
  description: String,
  priority: String,
  status: { type: String, default: 'Pending' },
  attachment: String,
  submittedBy: String,
  assignedTo: String,
  createdAt: { type: Date, default: Date.now },
  resolvedAt: Date,
  comments: [
    {
      text: String,
      by: String,
      timestamp: { type: Date, default: Date.now }
    }
  ]
});

export default mongoose.model('Request', requestSchema);
