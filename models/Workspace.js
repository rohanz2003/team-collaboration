const mongoose = require('mongoose');

const memberSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member'],
      default: 'member',
    },
  },
  { _id: false }
);

const workspaceSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a workspace name'],
      trim: true,
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [memberSchema],
  },
  {
    timestamps: true,
  }
);

workspaceSchema.pre('save', function (next) {
  this.members = this.members.map((m) => {
    if (m instanceof mongoose.Types.ObjectId || typeof m === 'string') {
      return { user: m, role: this.owner.toString() === m.toString() ? 'owner' : 'member' };
    }
    return m;
  });

  const ownerExists = this.members.some(
    (m) => m.user.toString() === this.owner.toString() && m.role === 'owner'
  );
  if (!ownerExists) {
    this.members.push({ user: this.owner, role: 'owner' });
  }
  next();
});

workspaceSchema.methods.getMemberIds = function () {
  return this.members.map((m) => (m.user ? m.user : m));
};

workspaceSchema.methods.getUserRole = function (userId) {
  const member = this.members.find((m) => {
    const uid = m.user ? m.user.toString() : m.toString();
    return uid === userId.toString();
  });
  if (!member) return null;
  return member.role || 'member';
};

workspaceSchema.methods.isOwner = function (userId) {
  return this.owner.toString() === userId.toString();
};

workspaceSchema.methods.isAdminOrOwner = function (userId) {
  const role = this.getUserRole(userId);
  return role === 'owner' || role === 'admin';
};

module.exports = mongoose.model('Workspace', workspaceSchema);
