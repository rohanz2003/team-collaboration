const mongoose = require('mongoose');
const crypto = require('crypto');

const inviteSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    token: {
      type: String,
      unique: true,
      default: () => crypto.randomBytes(32).toString('hex'),
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'expired', 'cancelled'],
      default: 'pending',
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    acceptedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

inviteSchema.index({ token: 1 });
inviteSchema.index({ email: 1, workspace: 1 });
inviteSchema.index({ workspace: 1, status: 1 });

inviteSchema.methods.isExpired = function () {
  return this.expiresAt < new Date() || this.status === 'expired';
};

module.exports = mongoose.model('Invite', inviteSchema);
