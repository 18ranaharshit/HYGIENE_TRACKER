import mongoose, { Schema, Document } from 'mongoose';

export interface IExpense extends Document {
  toiletId: mongoose.Types.ObjectId;
  category: 'cleaning' | 'repair' | 'supplies' | 'inspection';
  amount: number;
  currency: string;
  description: string;
  date: Date;
  addedBy: mongoose.Types.ObjectId;
  receipt?: string;
  createdAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    toiletId:    { type: Schema.Types.ObjectId, ref: 'Toilet', required: true },
    category:    { type: String, enum: ['cleaning', 'repair', 'supplies', 'inspection'], required: true },
    amount:      { type: Number, required: true, min: 0 },
    currency:    { type: String, default: 'INR' },
    description: { type: String, required: true },
    date:        { type: Date, required: true },
    addedBy:     { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receipt:     { type: String },
  },
  { timestamps: true },
);

export const Expense = mongoose.model<IExpense>('Expense', ExpenseSchema);
