import mongoose from 'mongoose';

// Intervention Schema
const InterventionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User' // Reference to BetterAuth User
  },
  type: {
    type: String,
    default: 'intervention',
    enum: ['intervention']
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  entrepriseName: {
    type: String,
    required: true
  },
  responsable: {
    type: String,
    required: true
  },
  teamMembers: [{
    type: String,
    required: true
  }],
  siteName: {
    type: String,
    required: true
  },
  photoUrl: {
    type: String,
    required: false
  },
  recipientEmails: [{
    type: String,
    required: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Reclamation Schema
const ReclamationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User' // Reference to BetterAuth User
  },
  type: {
    type: String,
    default: 'reclamation',
    enum: ['reclamation']
  },
  date: {
    type: Date,
    required: true
  },
  stationName: {
    type: String,
    required: true
  },
  reclamationType: {
    type: String,
    required: true,
    enum: ['hydraulic', 'electric', 'mechanic']
  },
  description: {
    type: String,
    required: true
  },
  photoUrl: {
    type: String,
    required: false
  },
  recipientEmails: [{
    type: String,
    required: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create models if they don't exist
export const Intervention = mongoose.models.Intervention || mongoose.model('Intervention', InterventionSchema);
export const Reclamation = mongoose.models.Reclamation || mongoose.model('Reclamation', ReclamationSchema);

// Type definitions
export interface IIntervention {
  _id: string;
  userId: string;
  type: 'intervention';
  startDate: Date;
  endDate: Date;
  entrepriseName: string;
  responsable: string;
  teamMembers: string[];
  siteName: string;
  photoUrl?: string;
  recipientEmails: string[];
  createdAt: Date;
}

export interface IReclamation {
  _id: string;
  userId: string;
  type: 'reclamation';
  date: Date;
  stationName: string;
  reclamationType: 'hydraulic' | 'electric' | 'mechanic';
  description: string;
  photoUrl?: string;
  recipientEmails: string[];
  createdAt: Date;
}
