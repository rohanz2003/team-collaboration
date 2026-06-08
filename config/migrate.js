const Workspace = require('../models/Workspace');

async function migrateWorkspaceMembers() {
  try {
    const workspaces = await Workspace.find({});
    let migrated = 0;

    for (const ws of workspaces) {
      let needsSave = false;

      ws.members = ws.members.map((m) => {
        if (m instanceof require('mongoose').Types.ObjectId || typeof m === 'string') {
          needsSave = true;
          return {
            user: m,
            role: ws.owner.toString() === m.toString() ? 'owner' : 'member',
          };
        }
        if (!m.role) {
          needsSave = true;
          m.role = ws.owner.toString() === m.user.toString() ? 'owner' : 'member';
        }
        return m;
      });

      if (needsSave) {
        await ws.save();
        migrated++;
      }
    }

    if (migrated > 0) {
      console.log(`Migrated ${migrated} workspace(s) to new members format`);
    }
  } catch (err) {
    console.warn('Migration check failed (non-critical):', err.message);
  }
}

module.exports = { migrateWorkspaceMembers };
