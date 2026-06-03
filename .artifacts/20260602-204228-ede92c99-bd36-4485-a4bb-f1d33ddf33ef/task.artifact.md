# Task Management

- [/] Implement Real-time Online/Offline Status and Last Seen
    - [/] Research existing socket implementation and user model
    - [ ] Update backend `chatSocket.ts` to handle online/offline status updates
    - [ ] Update `User` model to ensure `isOnline` and `lastSeen` are correctly tracked
    - [ ] Update `socketService.ts` in mobile-app to handle status events
    - [ ] Update `CoupleHomeScreen.tsx` to display real-time status and last seen
    - [ ] Update `ChatScreen.tsx` to display real-time status
    - [ ] Verify functionality with two emulators/devices
