import { Server, Socket } from 'socket.io';
// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();

export const setupSockets = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    const userId = socket.handshake.auth.userId;
    console.log('A user connected:', userId);

    // Mark user as online
    if (userId) {
      // prisma.user.update({ where: { id: userId }, data: { isOnline: true } });
      socket.broadcast.emit('user_status_change', { userId, status: 'online' });
    }

    socket.on('join_room', (roomId: string) => {
      socket.join(roomId);
      console.log(`User joined room: ${roomId}`);
    });

    socket.on('send_message', async (data: { roomId: string, text: string, senderId: string, coupleId: string }) => {
      const messageData = {
        id: Date.now().toString(),
        text: data.text,
        senderId: data.senderId,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      // Persist to Database
      try {
        /*
        await prisma.message.create({
          data: {
            text: data.text,
            senderId: data.senderId,
            coupleId: data.coupleId
          }
        });
        */
      } catch (e) {
        console.error("Failed to save message", e);
      }

      // Broadcast to everyone in the room
      io.to(data.roomId).emit('message', messageData);
    });

    socket.on('typing', (data: { roomId: string, userId: string }) => {
      socket.to(data.roomId).emit('user_typing', { userId: data.userId });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
      if (userId) {
        // prisma.user.update({ where: { id: userId }, data: { isOnline: false, lastSeen: new Date() } });
        socket.broadcast.emit('user_status_change', { userId, status: 'offline', lastSeen: new Date() });
      }
    });
  });
};
