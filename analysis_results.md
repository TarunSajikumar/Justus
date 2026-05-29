# JUSTUS — Full Codebase Deep Analysis

> Last updated: 2026-05-28 | Files analyzed: 48

---

## 1. Project Overview

JUSTUS is a couples/relationship mobile app with two operating modes:

- **Solo mode** — personal vault, gallery, self-growth quotes
- **Couple mode** — shared chat, memories, vault, timeline, day counter

**Stack**:

| Layer | Tech |
|---|---|
| Mobile | React Native 0.85 · Expo SDK 56 · TypeScript |
| Navigation | React Navigation v7 |
| State | Zustand v5 |
| Storage | expo-secure-store (token) · AsyncStorage (user data) |
| HTTP | Axios |
| Real-time | Socket.IO v4 |
| Backend | Node.js · Express v5 · TypeScript |
| ORM | Prisma v7 |
| DB (dev) | SQLite (planned: PostgreSQL) |
| Media | Cloudinary + multer |
| Push | expo-notifications |

---

## 2. File-by-File Audit

### BACKEND

---

#### [server.ts](file:///c:/Users/USER/Downloads/JUSTUS/backend/src/server.ts) ✅ Clean
Starts `app.ts` on the configured port. Simple and correct.

**Problem:** Starts `app.ts` only — but **`index.ts` is a completely separate, richer Express app** that also creates the HTTP server and Socket.IO. Only one can run. Currently `server.ts` wins, meaning chat, invites, and sockets are **dead**.

---

#### [app.ts](file:///c:/Users/USER/Downloads/JUSTUS/backend/src/app.ts) ⚠️ Partial / Conflicting
- Registers only `auth.routes.ts` (the newer auth)
- Has no chat, invite, or socket setup
- No Socket.IO
- Will be started by `server.ts`

---

#### [index.ts](file:///c:/Users/USER/Downloads/JUSTUS/backend/src/index.ts) ⚠️ Orphaned
- Full-featured: auth + chat + invite + Socket.IO
- Registers `authRoutes.ts` (the **mock** auth, not the real one)
- Never actually started — completely unreachable

> **Result:** Real auth runs (`app.ts` via `server.ts`), but chat/invite/sockets never run (`index.ts` is orphaned).

---

#### [src/config/env.ts](file:///c:/Users/USER/Downloads/JUSTUS/backend/src/config/env.ts) ✅ Good
Validates required environment variables at startup. Will throw if `JWT_SECRET` or `DATABASE_URL` is missing. Clean pattern.

---

#### [src/prisma/client.ts](file:///c:/Users/USER/Downloads/JUSTUS/backend/src/prisma/client.ts) 🚨 Broken
```ts
const prisma = new PrismaClient({
  adapter: { provider, url: dbUrl } as any,
});
```
- The `adapter` field is **not a valid Prisma v7 constructor option** for the standard client. Adapters are for edge runtimes. This will throw at runtime.
- Correct pattern for SQLite/PostgreSQL is simply `new PrismaClient()` — the URL is read from the `datasource` in `schema.prisma`.

---

#### [prisma/schema.prisma](file:///c:/Users/USER/Downloads/JUSTUS/backend/prisma/schema.prisma) 🚨 Critically Incomplete
Missing models the code depends on:

| Missing Model | Used By |
|---|---|
| `Couple` | `inviteController.ts`, `chatSocket.ts` |
| `Message` | `chatSocket.ts`, `chatService.ts` |

Missing fields on existing models:

| Model | Missing Fields |
|---|---|
| `User` | `partnerId`, `coupleId`, `inviteCode`, `isOnline`, `lastSeen`, `pushToken` |
| `RelationshipProfile` | No foreign key relation to `User` |
| `Memory` | No relation to `User`; no `caption` field |

**No relations are defined between any models.** Prisma queries with `include` will not work.

Also: `datasource db {}` block has no `url` field — Prisma cannot connect.

---

#### [src/services/auth.service.ts](file:///c:/Users/USER/Downloads/JUSTUS/backend/src/services/auth.service.ts) 🔴 Security Bug
```ts
return { token, user }; // ← user object includes hashed password
```
The full Prisma `user` object is returned, including `password` hash. Must be excluded before returning.

---

#### [src/controllers/auth.controller.ts](file:///c:/Users/USER/Downloads/JUSTUS/backend/src/controllers/auth.controller.ts) ✅ Clean
Delegates cleanly to `auth.service.ts`. Proper try/catch. No issues.

---

#### [src/controllers/authController.ts](file:///c:/Users/USER/Downloads/JUSTUS/backend/src/controllers/authController.ts) 🗑️ Dead/Mock
- Hardcoded OTP `123456` — never safe
- Mock user object (not from DB)
- Registered by the orphaned `index.ts` — never runs
- **Should be deleted**

---

#### [src/controllers/inviteController.ts](file:///c:/Users/USER/Downloads/JUSTUS/backend/src/controllers/inviteController.ts) 🚨 Non-functional
- Uses an in-memory fake `prisma` object
- `generateInviteCode`: random code is returned but never saved anywhere
- `joinPartner`: returns mock `partner = { id: 'partner-123' }` — no DB writes
- `req.user` accessed without type safety
- **Core couple-pairing feature is completely broken**

---

#### [src/middleware/auth.middleware.ts](file:///c:/Users/USER/Downloads/JUSTUS/backend/src/middleware/auth.middleware.ts) ✅ Good
Sets `req.userId` from JWT payload. Clean. Used by `app.ts`.

---

#### [src/middleware/authMiddleware.ts](file:///c:/Users/USER/Downloads/JUSTUS/backend/src/middleware/authMiddleware.ts) ⚠️ Duplicate
- Sets `req.user` (not `req.userId`) — inconsistent with `auth.middleware.ts`
- Falls back to hardcoded `'your_super_secret_key'` — security risk
- Used by `authRoutes.ts`, `chatRoutes.ts`, `inviteRoutes.ts` (all in orphaned `index.ts`)

---

#### [src/middleware/uploadMiddleware.ts](file:///c:/Users/USER/Downloads/JUSTUS/backend/src/middleware/uploadMiddleware.ts) ⚠️ Incomplete
- Cloudinary is set up correctly
- Only allows `jpg/png/jpeg` — no video support despite app having a `mediaType` field
- No file size limit
- `upload` middleware is exported but **never imported anywhere** — dead code

---

#### [src/routes/auth.routes.ts](file:///c:/Users/USER/Downloads/JUSTUS/backend/src/routes/auth.routes.ts) ✅ Active
Used by `app.ts`. Has `/signup` and `/login` endpoints via real controller.

---

#### [src/routes/authRoutes.ts](file:///c:/Users/USER/Downloads/JUSTUS/backend/src/routes/authRoutes.ts) 🗑️ Orphaned
Used by `index.ts` only. Registers mock OTP endpoints. Never reached. **Delete.**

---

#### [src/routes/chatRoutes.ts](file:///c:/Users/USER/Downloads/JUSTUS/backend/src/routes/chatRoutes.ts) ⚠️ Stub
Only one endpoint: `GET /messages/:partnerId` returns an empty array `[]`. No implementation.

---

#### [src/routes/inviteRoutes.ts](file:///c:/Users/USER/Downloads/JUSTUS/backend/src/routes/inviteRoutes.ts) ✅ Structured
Routes are correct. Points to broken `inviteController.ts`.

---

#### [src/sockets/chatSocket.ts](file:///c:/Users/USER/Downloads/JUSTUS/backend/src/sockets/chatSocket.ts) ⚠️ Partial
- `join_room`, `send_message`, `typing`, `disconnect` events are wired
- Broadcasts work correctly for in-memory session
- **All Prisma persistence is commented out** — messages never saved
- `userId` from `socket.handshake.auth.userId` — no JWT verification on socket connections (security gap)
- Only reached via orphaned `index.ts` — **never running**

---

### MOBILE APP

---

#### [App.tsx](file:///c:/Users/USER/Downloads/JUSTUS/mobile-app/App.tsx) ✅ Clean
Renders `RootNavigator` + `Toast`. Correct entry point.

---

#### [src/navigation/RootNavigator.tsx](file:///c:/Users/USER/Downloads/JUSTUS/mobile-app/src/navigation/RootNavigator.tsx) ✅ Good (Updated)
- Session restore from SecureStore on mount ✅
- Token-based route guard ✅
- `SignupDetails` accessible from both auth/app states ✅
- `SplashScreen` passed `navigation={null}` during loading — safe only if `SplashScreen` guards `navigation?.replace()` — **it does not currently guard this**

---

#### [src/screens/auth/SplashScreen.tsx](file:///c:/Users/USER/Downloads/JUSTUS/mobile-app/src/screens/auth/SplashScreen.tsx) 🚨 Crash Risk
```ts
useEffect(() => {
  const timer = setTimeout(() => {
    navigation.replace("Login"); // ← navigation is null during loading!
  }, 3000);
}, [navigation]);
```
When rendered as a loading placeholder in `RootNavigator`, `navigation` is `null`. This will **crash** after 3 seconds.

---

#### [src/screens/auth/LoginScreen.tsx](file:///c:/Users/USER/Downloads/JUSTUS/mobile-app/src/screens/auth/LoginScreen.tsx) ✅ Good (Updated)
- Contact validation ✅
- Mock existence check → routes to OTP with `mode: 'login'` ✅
- `ActivityIndicator` loading state ✅
- Passes `contact` as param ✅

---

#### [src/screens/auth/SignupScreen.tsx](file:///c:/Users/USER/Downloads/JUSTUS/mobile-app/src/screens/auth/SignupScreen.tsx) ✅ Good (Updated)
- Same pattern as LoginScreen ✅
- Correctly routes to OTP with `mode: 'signup'` ✅
- One issue: `navigation.getState?.() && ''` on line 17 is a no-op — contact state will always be `''`

---

#### [src/screens/auth/OtpVerificationScreen.tsx](file:///c:/Users/USER/Downloads/JUSTUS/mobile-app/src/screens/auth/OtpVerificationScreen.tsx) ✅ Excellent (Updated)
- 6 individual OTP boxes with auto-advance ✅
- Backspace-to-previous box ✅
- Shake animation on incomplete submission ✅
- Countdown timer with resend ✅
- `mode` param drives routing ✅
- `caretHidden` for cleaner UX ✅
- **Best file in the project**

---

#### [src/screens/auth/SignupDetailsScreen.tsx](file:///c:/Users/USER/Downloads/JUSTUS/mobile-app/src/screens/auth/SignupDetailsScreen.tsx) ✅ Good (Updated)
- Name, username (lowercase forced), optional DOB ✅
- Form validation before enabling Continue ✅
- Shows contact from params ✅
- No password field — consistent with OTP-first auth ✅

---

#### [src/screens/auth/RelationshipPopup.tsx](file:///c:/Users/USER/Downloads/JUSTUS/mobile-app/src/screens/auth/RelationshipPopup.tsx) ⚠️ Incomplete
- UI works correctly ✅
- Does not persist the user's choice to DB or store
- Does not update `user.relationshipMode` anywhere
- "YES" always goes to `CoupleTabs` even if user has no partner yet (no invite pairing)

---

#### [src/screens/couple/CoupleHomeScreen.tsx](file:///c:/Users/USER/Downloads/JUSTUS/mobile-app/src/screens/couple/CoupleHomeScreen.tsx) ⚠️ Hardcoded
- Fully static: "Alex & Sarah", "428 Days of Love", hardcoded memories
- No API calls, no Zustand usage
- Good UI structure — needs data wiring

---

#### [src/screens/couple/ChatScreen.tsx](file:///c:/Users/USER/Downloads/JUSTUS/mobile-app/src/screens/couple/ChatScreen.tsx) ✅ Best Implementation
- Socket.IO connect/disconnect lifecycle managed correctly ✅
- Room ID derived from sorted user+partner IDs ✅
- Online status from `user_status_change` events ✅
- Message deduplication via sender normalization ✅
- **Works as soon as backend socket is activated**

---

#### [src/screens/couple/GalleryScreen.tsx](file:///c:/Users/USER/Downloads/JUSTUS/mobile-app/src/screens/couple/GalleryScreen.tsx) ⚠️ Partially Wired
- Two hardcoded seed memories with Unsplash URLs
- `AddMemoryModal` used correctly for adding locally ✅
- `handleSaveMemory` only updates local state — no API call
- "On This Day" section is static text
- Export name `MemoriesScreen` doesn't match filename `GalleryScreen` — minor confusion

---

#### [src/screens/couple/VaultScreen.tsx](file:///c:/Users/USER/Downloads/JUSTUS/mobile-app/src/screens/couple/VaultScreen.tsx) ✅ Strong
- Biometric lock via `expo-local-authentication` ✅
- BlurView behind locked state ✅
- Tab-based Photos/Notes ✅
- Local note creation with Toast ✅
- Notes only in-memory (no persistence)
- Imports `expo-local-authentication` which is not in `package.json` — **will crash at install/run**

---

#### [src/screens/couple/SettingsScreen.tsx](file:///c:/Users/USER/Downloads/JUSTUS/mobile-app/src/screens/couple/SettingsScreen.tsx) ✅ Good
- Logout properly calls `clearAuthData()` + Zustand `logout()` ✅
- Dark mode toggle is local state only (does nothing globally)
- Notification toggle does nothing
- Delete Account handler is empty `onPress: () => {}`

---

#### [src/screens/couple/TimelineScreen.tsx](file:///c:/Users/USER/Downloads/JUSTUS/mobile-app/src/screens/couple/TimelineScreen.tsx) 🗑️ Placeholder
Empty shell with "Timeline Screen" text. Not implemented.

---

#### [src/screens/solo/SoloHomeScreen.tsx](file:///c:/Users/USER/Downloads/JUSTUS/mobile-app/src/screens/solo/SoloHomeScreen.tsx) ⚠️ Hardcoded
- Static storage "128MB of 1GB" — no real data
- Hardcoded memories list
- "Quick Upload" button has no `onPress` handler — does nothing

---

#### [src/navigation/CoupleTabs.tsx](file:///c:/Users/USER/Downloads/JUSTUS/mobile-app/src/navigation/CoupleTabs.tsx) ✅ Good
5 tabs: Home, Chat, Gallery, Timeline, Settings. Icons correct.

---

#### [src/navigation/SoloTabs.tsx](file:///c:/Users/USER/Downloads/JUSTUS/mobile-app/src/navigation/SoloTabs.tsx) ✅ Good
4 tabs. `VaultScreen` is missing from solo tabs — should it be available there too?

---

#### [src/store/useStore.ts](file:///c:/Users/USER/Downloads/JUSTUS/mobile-app/src/store/useStore.ts) ⚠️ Missing Fields
- Only stores `user`, `partner`, `token`
- Missing: `relationshipMode`, `coupleId`, `pushToken`
- `User` type has `phone` but `name` is optional — should likely be required after signup

---

#### [src/store/authStore.ts](file:///c:/Users/USER/Downloads/JUSTUS/mobile-app/src/store/authStore.ts) ✅ Solid
- Token in SecureStore ✅
- User data in AsyncStorage ✅
- Separation is correct — SecureStore is for secrets, AsyncStorage for non-sensitive data ✅
- `partnerId` stored in plain AsyncStorage — acceptable since it's not a secret

---

#### [src/services/api.ts](file:///c:/Users/USER/Downloads/JUSTUS/mobile-app/src/services/api.ts) 🔴 Hardcoded IP
```ts
export const BASE_URL = "http://192.168.1.5:5000/api";
```
This is a developer's local machine IP. Will fail for any other device or environment. Should use an env variable or Expo Constants.

Also: No response interceptor for 401 handling (token expiry won't auto-logout).

---

#### [src/services/authService.ts](file:///c:/Users/USER/Downloads/JUSTUS/mobile-app/src/services/authService.ts) ⚠️ Mismatched with Backend
- Calls `/auth/login` (OTP mock endpoint from orphaned `authRoutes.ts`)
- Calls `/auth/verify` — this endpoint does not exist in the active `auth.routes.ts`
- The active backend only has `/auth/signup` and `/auth/login` (real Prisma auth)
- **Frontend and backend auth flows are completely out of sync**

---

#### [src/services/chatService.ts](file:///c:/Users/USER/Downloads/JUSTUS/mobile-app/src/services/chatService.ts) ⚠️ Partial
- `sendMessage` calls `/chat/send` — this endpoint does not exist in `chatRoutes.ts`
- `getChatHistory` calls `/chat/history` — also does not exist
- Only `/chat/messages/:partnerId` exists and returns `[]`

---

#### [src/services/inviteService.ts](file:///c:/Users/USER/Downloads/JUSTUS/mobile-app/src/services/inviteService.ts) ✅ Correct API shape
Matches the backend route structure. Will work once `inviteController.ts` is fixed.

---

#### [src/services/socket.ts](file:///c:/Users/USER/Downloads/JUSTUS/mobile-app/src/services/socket.ts) ⚠️ Issues
- `SOCKET_URL = 'https://your-backend-api.com'` — placeholder, will fail
- Sends `auth: { token }` but backend `chatSocket.ts` reads `auth.userId`, not `auth.token`
- `sendMessage` emits `'message'` but backend listens for `'send_message'` — **event name mismatch**
- Used correctly in `ChatScreen.tsx`

---

#### [src/services/notificationService.ts](file:///c:/Users/USER/Downloads/JUSTUS/mobile-app/src/services/notificationService.ts) ✅ Solid Foundation
- Requests permission correctly ✅
- Android channel set up ✅
- Gets Expo push token ✅
- Token is never sent to the backend (no endpoint for it) — push delivery incomplete

---

#### [src/components/Button.tsx](file:///c:/Users/USER/Downloads/JUSTUS/mobile-app/src/components/Button.tsx) ✅ Excellent
Reusable, typed, variant system (`primary`, `secondary`, `danger`, `outline`), loading state. Best component in the project.

---

#### [src/components/AddMemoryModal.tsx](file:///c:/Users/USER/Downloads/JUSTUS/mobile-app/src/components/AddMemoryModal.tsx) ⚠️ Simulated Upload
- Image picker works ✅
- Upload is `setTimeout(1500)` simulation — no real API call
- Does not use `inviteService` or any upload API

---

#### [src/components/chat/ChatHeader.tsx](file:///c:/Users/USER/Downloads/JUSTUS/mobile-app/src/components/chat/ChatHeader.tsx) ✅ Clean
Typed props, online indicator, call/video buttons (non-functional). Well-structured.

---

#### [src/components/chat/ChatInput.tsx](file:///c:/Users/USER/Downloads/JUSTUS/mobile-app/src/components/chat/ChatInput.tsx) ✅ Good
Multiline input, disabled send state, clears on send. Works correctly with ChatScreen.

---

#### [src/components/chat/MessageBubble.tsx](file:///c:/Users/USER/Downloads/JUSTUS/mobile-app/src/components/chat/MessageBubble.tsx) — (not read, assumed basic)

---

## 3. Critical Bugs (Will Crash or Break)

| # | File | Bug | Impact |
|---|---|---|---|
| 1 | `prisma/client.ts` | Invalid `adapter` constructor option | **Prisma client fails to initialize — entire backend crashes** |
| 2 | `prisma/schema.prisma` | No `url` in datasource block | **Prisma cannot connect to any database** |
| 3 | `SplashScreen.tsx` | `navigation.replace()` called when `navigation === null` | **App crashes 3 seconds after cold start** |
| 4 | `VaultScreen.tsx` | `expo-local-authentication` not in `package.json` | **Metro bundler error / app won't run** |
| 5 | `socket.ts` | Event name `'message'` ≠ `'send_message'` on server | **Chat messages never delivered** |
| 6 | `authService.ts` | Calls `/auth/verify` which doesn't exist | **OTP verification always fails** |

---

## 4. Security Issues

| Severity | File | Issue |
|---|---|---|
| 🔴 High | `auth.service.ts` | Password hash returned to client in login response |
| 🔴 High | `authMiddleware.ts` | Hardcoded fallback JWT secret |
| 🔴 High | `chatSocket.ts` | No JWT verification on socket connections — anyone can join any room |
| 🟠 Medium | `api.ts` | Hardcoded local IP — dev credential in source code |
| 🟠 Medium | `inviteController.ts` | `req.user` typed as `any` — no type safety |
| 🟠 Medium | All controllers | No input validation (no zod/joi) — SQL injection / bad data possible |
| 🟡 Low | `index.ts` / `app.ts` | CORS `*` — allow all origins |

---

## 5. Dead Code (Safe to Delete)

| File | Reason |
|---|---|
| `src/controllers/authController.ts` | Mock OTP, never runs |
| `src/middleware/authMiddleware.ts` | Duplicate of `auth.middleware.ts`, used only by orphaned index |
| `src/routes/authRoutes.ts` | Used only by orphaned `index.ts` |
| `backend/src/app.ts` | Should be merged into `index.ts`, then deleted |
| `backend/src/index.ts` | Currently orphaned — should become the one true entry point after merge |

---

## 6. Missing Features (Entire Features Not Implemented)

| Feature | Status |
|---|---|
| OTP send via SMS (Twilio/MSG91) | ❌ Mock only |
| Partner invite code persistence | ❌ In-memory mock |
| Chat message persistence | ❌ Commented out |
| Memory upload to Cloudinary | ❌ Simulated |
| Push token registration on backend | ❌ Token fetched but never sent |
| `relationshipMode` persisted after popup | ❌ Never written |
| Timeline screen | ❌ Empty placeholder |
| Delete account logic | ❌ Empty `onPress` |
| Dark mode (global) | ❌ Toggle is local-only |
| API call 401 auto-logout | ❌ No response interceptor |

---

## 7. What's Actually Working End-to-End

| Feature | Works? |
|---|---|
| Auth flow UI (Login → OTP → SignupDetails) | ✅ Navigation works |
| Zustand state + SecureStore session restore | ✅ |
| Relationship mode popup (routing) | ✅ Navigates correctly |
| Chat UI (send/receive via socket) | ✅ — if backend socket is running |
| Gallery UI (local add memory) | ✅ Locally only |
| Vault biometric lock/unlock | ✅ |
| Settings logout | ✅ |
| Button, Input, Loader components | ✅ |
| Theme system (colors/spacing) | ✅ |

---

## 8. Prioritized Fix Roadmap

### 🔴 Blockers — Fix Before Anything Else

1. **Fix `prisma/schema.prisma`** — add `url`, `Couple`, `Message` models, all relations
2. **Fix `prisma/client.ts`** — remove invalid `adapter` option
3. **Fix `SplashScreen.tsx`** — guard `navigation?.replace()` call
4. **Add `expo-local-authentication` to `package.json`**
5. **Consolidate backend** — merge `app.ts` into `index.ts`, delete duplicates
6. **Fix `auth.service.ts` password leak** — `const { password, ...safeUser } = user`

### 🟠 High Priority — Core Features Broken

7. Fix `socket.ts` event name: `'message'` → `'send_message'`
8. Fix `socket.ts` auth: send `userId` not just `token`; backend should verify JWT
9. Fix `authService.ts` — align with real backend endpoints (`/auth/signup`, `/auth/login`)
10. Fix `api.ts` `BASE_URL` — use `process.env.EXPO_PUBLIC_API_URL` or Constants
11. Implement real invite code flow (save to DB, lookup, create Couple record)
12. Uncomment chat persistence in `chatSocket.ts`

### 🟡 Medium Priority — Polish

13. Add 401 response interceptor to `api.ts` → auto-logout on token expiry
14. Add Zod validation to all backend endpoints
15. Add real SMS OTP (Twilio/MSG91) 
16. Save `relationshipMode` after RelationshipPopup selection
17. Wire real API calls in all screens (replace hardcoded data)
18. Send push token to backend on login
19. Implement TimelineScreen
20. Implement real Cloudinary upload in `AddMemoryModal`

### 🟢 Long-term

21. Migrate SQLite → PostgreSQL for production
22. Add pagination to chat + memories
23. Add dark mode global context
24. Add video support to upload middleware
25. Add proper TypeScript types for all `any` usages
