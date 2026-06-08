const mongoose = require('mongoose');

const channelSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a channel name'],
      trim: true,
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

channelSchema.index({ workspace: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Channel', channelSchema);
