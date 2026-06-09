const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const { invalidateChannelCache, cacheAIResult } = require('../services/cacheService');
const { askAI } = require('../services/aiService');
const logger = require('../services/loggerService');

const CallHistory = require('../models/CallHistory');
const onlineUsers = new Map();
const activeCalls = new Map();

function setupSocket(io) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return next(new Error('User not found'));
      }
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;
    const userData = { userId: user._id.toString(), name: user.name, email: user.email, socketId: socket.id };
    onlineUsers.set(user._id.toString(), userData);

    io.emit('online-users', Array.from(onlineUsers.values()));

    socket.on('join-channel', (channelId) => {
      if (!channelId) return;
      socket.join(`channel:${channelId}`);
    });

    socket.on('leave-channel', (channelId) => {
      if (!channelId) return;
      socket.leave(`channel:${channelId}`);
    });

    socket.on('send-message', async (data, callback) => {
      try {
        const { channelId, text, fileUrl, fileName, fileType } = data;
        if (!channelId) return;

        const messageData = {
          sender: user._id,
          channel: channelId,
          messageType: fileUrl ? 'file' : 'text',
        };

        if (fileUrl) {
          messageData.fileUrl = fileUrl;
          messageData.fileName = fileName;
          messageData.fileType = fileType;
          messageData.text = text || null;
        } else {
          if (!text || !text.trim()) return;
          messageData.text = text.trim();
        }

        const message = await Message.create(messageData);

        const populated = await Message.findById(message._id)
          .populate('sender', 'name email')
          .populate('reactions.userId', 'name email')
          .populate({
            path: 'replyTo',
            populate: { path: 'sender', select: 'name email' },
          })
          .lean();

        await invalidateChannelCache(channelId);

        io.to(`channel:${channelId}`).emit('new-message', populated);

        const Channel = require('../models/Channel');
        const channel = await Channel.findById(channelId).populate('workspace');
        if (channel && channel.workspace) {
          const Workspace = require('../models/Workspace');
          const workspace = await Workspace.findById(channel.workspace._id || channel.workspace);
          if (workspace) {
            const memberIds = workspace.members
              .filter((m) => m.user.toString() !== user._id.toString())
              .map((m) => m.user);
            for (const memberId of memberIds) {
              const notification = await Notification.create({
                user: memberId,
                type: 'message_received',
                title: `New message in #${channel.name}`,
                message: `${user.name}: ${(messageData.text || '').substring(0, 100)}`,
                relatedWorkspace: workspace._id,
                relatedUser: user._id,
                link: `/workspace?workspaceId=${workspace._id}`,
              });
              const memberSocket = onlineUsers.get(memberId.toString());
              if (memberSocket) {
                io.to(memberSocket.socketId).emit('new-notification', notification);
              }
            }
          }
        }

        if (typeof callback === 'function') {
          callback({ success: true, message: populated });
        }
      } catch (error) {
        if (typeof callback === 'function') {
          callback({ success: false, error: error.message });
        }
      }
    });

    socket.on('react-message', async (data, callback) => {
      try {
        const { messageId, type } = data;
        if (!messageId || !type) return;

        const message = await Message.findById(messageId);
        if (!message) return;

        const existingIndex = message.reactions.findIndex(
          (r) => r.userId.toString() === user._id.toString() && r.type === type
        );

        if (existingIndex > -1) {
          message.reactions.splice(existingIndex, 1);
        } else {
          const existingUserReaction = message.reactions.find(
            (r) => r.userId.toString() === user._id.toString()
          );
          if (existingUserReaction) {
            existingUserReaction.type = type;
          } else {
            message.reactions.push({ userId: user._id, type });
          }
        }

        await message.save();

        const populated = await Message.findById(message._id)
          .populate('sender', 'name email')
          .populate('reactions.userId', 'name email')
          .lean();

        await invalidateChannelCache(message.channel);

        io.to(`channel:${message.channel}`).emit('message-updated', populated);

        if (typeof callback === 'function') {
          callback({ success: true, message: populated });
        }
      } catch (error) {
        if (typeof callback === 'function') {
          callback({ success: false, error: error.message });
        }
      }
    });

    socket.on('edit-message', async (data, callback) => {
      try {
        const { messageId, text } = data;
        if (!messageId || !text || !text.trim()) return;

        const message = await Message.findById(messageId);
        if (!message) return;

        if (message.sender.toString() !== user._id.toString()) return;

        message.text = text.trim();
        message.edited = true;
        await message.save();

        const populated = await Message.findById(message._id)
          .populate('sender', 'name email')
          .populate('reactions.userId', 'name email')
          .lean();

        await invalidateChannelCache(message.channel);

        io.to(`channel:${message.channel}`).emit('message-updated', populated);

        if (typeof callback === 'function') {
          callback({ success: true, message: populated });
        }
      } catch (error) {
        if (typeof callback === 'function') {
          callback({ success: false, error: error.message });
        }
      }
    });

    socket.on('delete-message', async (data, callback) => {
      try {
        const { messageId } = data;
        if (!messageId) return;

        const message = await Message.findById(messageId);
        if (!message) return;

        if (message.sender.toString() !== user._id.toString()) return;

        message.deleted = true;
        message.text = '';
        message.fileUrl = null;
        message.fileName = null;
        message.fileType = null;
        await message.save();

        await invalidateChannelCache(message.channel);

        io.to(`channel:${message.channel}`).emit('message-deleted', {
          messageId: message._id,
          channelId: message.channel,
        });

        if (typeof callback === 'function') {
          callback({ success: true, messageId: message._id });
        }
      } catch (error) {
        if (typeof callback === 'function') {
          callback({ success: false, error: error.message });
        }
      }
    });

    socket.on('reply-message', async (data, callback) => {
      try {
        const { messageId, text } = data;
        if (!messageId || !text || !text.trim()) return;

        const parent = await Message.findById(messageId);
        if (!parent) return;

        const reply = await Message.create({
          sender: user._id,
          channel: parent.channel,
          text: text.trim(),
          replyTo: messageId,
        });

        const populated = await Message.findById(reply._id)
          .populate('sender', 'name email')
          .populate('reactions.userId', 'name email')
          .populate({
            path: 'replyTo',
            populate: { path: 'sender', select: 'name email' },
          })
          .lean();

        await invalidateChannelCache(parent.channel);

        io.to(`channel:${parent.channel}`).emit('new-message', populated);
        io.to(`channel:${parent.channel}`).emit('reply-message', {
          parentId: messageId,
          reply: populated,
        });

        if (typeof callback === 'function') {
          callback({ success: true, message: populated });
        }
      } catch (error) {
        if (typeof callback === 'function') {
          callback({ success: false, error: error.message });
        }
      }
    });

    socket.on('mark-seen', async (data) => {
      try {
        const { channelId, messageIds } = data;
        if (!channelId || !messageIds || !messageIds.length) return;

        await Message.updateMany(
          {
            _id: { $in: messageIds },
            sender: { $ne: user._id },
            seenBy: { $ne: user._id },
          },
          {
            $addToSet: { seenBy: user._id },
          }
        );

        socket.to(`channel:${channelId}`).emit('messages-seen', {
          channelId,
          userId: user._id.toString(),
          messageIds,
        });
      } catch (error) {
      }
    });

    socket.on('typing', ({ channelId }) => {
      if (!channelId) return;
      socket.to(`channel:${channelId}`).emit('typing', {
        channelId,
        user: { _id: user._id, name: user.name },
      });
    });

    socket.on('stop-typing', ({ channelId }) => {
      if (!channelId) return;
      socket.to(`channel:${channelId}`).emit('stop-typing', {
        channelId,
        userId: user._id.toString(),
      });
    });

    socket.on('call-user', (data) => {
      const { targetUserId, offer, callType, workspaceId } = data;
      const target = onlineUsers.get(targetUserId);
      if (target) {
        const key = [socket.id, target.socketId].sort().join(':');
        activeCalls.set(key, {
          callerId: user._id.toString(),
          callerName: user.name,
          targetUserId,
          targetUserName: target.name,
          callType,
          workspaceId,
          startedAt: new Date(),
        });

        io.to(target.socketId).emit('incoming-call', {
          from: { userId: user._id.toString(), name: user.name },
          fromSocketId: socket.id,
          offer,
          callType,
        });
      }
    });

    socket.on('answer-call', (data) => {
      const { targetSocketId, answer } = data;
      io.to(targetSocketId).emit('call-accepted', { answer });
    });

    socket.on('ice-candidate', (data) => {
      const { targetSocketId, candidate } = data;
      io.to(targetSocketId).emit('ice-candidate', { candidate });
    });

    socket.on('end-call', (data) => {
      const { targetSocketId } = data;
      const key = [socket.id, targetSocketId].sort().join(':');
      const callInfo = activeCalls.get(key);
      if (callInfo) {
        const endedAt = new Date();
        const duration = Math.round((endedAt - callInfo.startedAt) / 1000);
        CallHistory.create({
          caller: callInfo.callerId,
          receiver: callInfo.targetUserId,
          workspace: callInfo.workspaceId,
          callType: callInfo.callType,
          duration,
          startedAt: callInfo.startedAt,
          endedAt,
        }).catch((err) => logger.error('Failed to save call history:', err.message));
        activeCalls.delete(key);
      }
      io.to(targetSocketId).emit('call-ended');
    });

    socket.on('screen-share-started', (data) => {
      const { targetSocketId } = data;
      io.to(targetSocketId).emit('screen-share-started', {
        userName: user.name,
      });
    });

    socket.on('screen-share-stopped', (data) => {
      const { targetSocketId } = data;
      io.to(targetSocketId).emit('screen-share-stopped');
    });

    socket.on('ai-query', async (data, callback) => {
      try {
        const { question, channelId, messages } = data;
        if (!question || !question.trim()) return;

        const answer = await askAI(question, messages || []);
        await cacheAIResult(`socket-ai:${user._id}:${question.slice(0, 50)}`, { answer }, 300);

        if (typeof callback === 'function') {
          callback({ success: true, answer });
        }
      } catch (error) {
        if (typeof callback === 'function') {
          callback({ success: false, error: error.message });
        }
      }
    });

    socket.on('ai-summarize', async (data, callback) => {
      try {
        const { messages } = data;
        if (!messages || !messages.length) return;

        const { summarizeMessages } = require('../services/aiService');
        const result = await summarizeMessages(messages);

        if (typeof callback === 'function') {
          callback({ success: true, ...result });
        }
      } catch (error) {
        if (typeof callback === 'function') {
          callback({ success: false, error: error.message });
        }
      }
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(user._id.toString());
      io.emit('online-users', Array.from(onlineUsers.values()));
      socket.broadcast.emit('call-ended');

      for (const [key, callInfo] of activeCalls) {
        if (callInfo.callerId === user._id.toString() || callInfo.targetUserId === user._id.toString()) {
          const endedAt = new Date();
          const duration = Math.round((endedAt - callInfo.startedAt) / 1000);
          CallHistory.create({
            caller: callInfo.callerId,
            receiver: callInfo.targetUserId,
            workspace: callInfo.workspaceId,
            callType: callInfo.callType,
            duration,
            startedAt: callInfo.startedAt,
            endedAt,
          }).catch((err) => logger.error('Failed to save call history on disconnect:', err.message));
          activeCalls.delete(key);
        }
      }
    });
  });
}

module.exports = { setupSocket, onlineUsers };
