import mongoose, { Schema, Document } from 'mongoose';

export interface IMaintenanceTicket extends Document {
  toiletId: mongoose.Types.ObjectId;
  issue: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'resolved';
  reportedBy: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MaintenanceTicketSchema = new Schema<IMaintenanceTicket>(
  {
    toiletId:   { type: Schema.Types.ObjectId, ref: 'Toilet', required: true },
    issue:      { type: String, required: true },
    severity:   { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    status:     { type: String, enum: ['open', 'in-progress', 'resolved'], default: 'open' },
    reportedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: { type: Date },
    notes:      { type: String },
  },
  { timestamps: true },
);

export const MaintenanceTicket = mongoose.model<IMaintenanceTicket>('MaintenanceTicket', MaintenanceTicketSchema);
