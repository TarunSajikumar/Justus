# Real-time Online/Offline Status and Last Seen Implementation

Implement real-time tracking of user online/offline status and "last seen" time. This will be reflected on the home dashboard and the chat screen.

## User Review Required
- The current implementation will mark a user as "Offline" as soon as they disconnect from the socket.
- "Last seen" will be updated to the time of disconnection.

## Proposed Changes

### Backend

#### [chatSocket.ts](file:///C:/Users/USER/Downloads/JUSTUS/backend/src/sockets/chatSocket.ts)
- Update `on('connection')` to set `isOnline: true` in the database and emit a `user_status_change` event.
- Update `on('disconnect')` to set `isOnline: false` and `lastSeen: new Date()` in the database and emit a `user_status_change` event.

#### [User.ts](file:///C:/Users/USER/Downloads/JUSTUS/backend/src/models/User.ts)
- Ensure `isOnline` and `lastSeen` fields exist (verified: they do).

---

### Mobile App

#### [socketService.ts](file:///C:/Users/USER/Downloads/JUSTUS/mobile-app/src/services/socketService.ts) (or equivalent)
- Ensure status change events are correctly handled and potentially update a global state or trigger callbacks.

#### [CoupleHomeScreen.tsx](file:///C:/Users/USER/Downloads/JUSTUS/mobile-app/src/screens/couple/CoupleHomeScreen.tsx)
- Ensure it listens for the `user_status_change` event from the socket to update the partner's status display in real-time.

#### [ChatScreen.tsx](file:///C:/Users/USER/Downloads/JUSTUS/mobile-app/src/screens/chat/ChatScreen.tsx)
- Add status indicator (Online/Last seen) in the chat header.
- Listen for socket status updates.

## Verification Plan

### Manual Verification
- Log in with two different accounts on two separate devices/emulators.
- Observe the "Online" status on the Home dashboard when the other user is active.
- Observe the status change to "Last seen X mins ago" when the other user closes the app.
- Check the Chat screen header for the same status updates.
