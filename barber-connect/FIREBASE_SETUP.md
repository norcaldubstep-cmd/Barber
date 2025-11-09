# Firebase Backend Setup Guide for BarberConnect

This guide will walk you through setting up Firebase as the complete backend solution for BarberConnect.

## Table of Contents
1. [Firebase Project Setup](#firebase-project-setup)
2. [Firebase Services Configuration](#firebase-services-configuration)
3. [Security Rules](#security-rules)
4. [Cloud Functions Deployment](#cloud-functions-deployment)
5. [Environment Configuration](#environment-configuration)
6. [Installation](#installation)
7. [Cost Estimation](#cost-estimation)

---

## Firebase Project Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `barber-connect` (or your preferred name)
4. Enable Google Analytics (recommended)
5. Create project

### 2. Enable Firebase Services

Enable the following services from the Firebase Console:

#### Authentication
- Go to **Build → Authentication → Get Started**
- Enable sign-in methods:
  - Email/Password ✓
  - Google ✓
  - Facebook ✓
  - Apple ✓ (for iOS)
  - Phone ✓

#### Firestore Database
- Go to **Build → Firestore Database → Create database**
- Start in **production mode** (we'll add security rules later)
- Choose location closest to your users (e.g., `us-central`)

#### Storage
- Go to **Build → Storage → Get Started**
- Start in **production mode**
- Use default location

#### Cloud Functions
- Go to **Build → Functions → Get Started**
- Upgrade to **Blaze (pay-as-you-go)** plan (required for functions)

#### Cloud Messaging (FCM)
- Automatically enabled
- No additional setup required

---

## Firebase Services Configuration

### 1. Register Web App

1. In Project Overview, click "Add app" → Web
2. Register app with nickname: `BarberConnect Mobile`
3. Copy the Firebase config object
4. Create `.env` file in project root (copy from `.env.example`)
5. Paste your config values:

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=barber-connect.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=barber-connect
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=barber-connect.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 2. Configure Authentication

#### Email Templates
1. Go to **Authentication → Templates**
2. Customize email templates:
   - Email address verification
   - Password reset
   - Email address change

Use your brand colors and logo.

#### Custom Claims for Roles
Custom claims will be set via Cloud Functions when users register:
- `client`
- `barber`
- `business_owner`

---

## Security Rules

### Firestore Security Rules

1. Go to **Firestore Database → Rules**
2. Replace with the following rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    function isBarber() {
      return isAuthenticated() &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'barber';
    }

    function isBusinessOwner() {
      return isAuthenticated() &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'business_owner';
    }

    // Users
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isOwner(userId);
      allow update: if isOwner(userId);
      allow delete: if isOwner(userId);
    }

    // Posts
    match /posts/{postId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() &&
                      request.resource.data.authorId == request.auth.uid;
      allow update: if isAuthenticated() &&
                      resource.data.authorId == request.auth.uid;
      allow delete: if isAuthenticated() &&
                      resource.data.authorId == request.auth.uid;

      // Likes subcollection
      match /likes/{userId} {
        allow read: if isAuthenticated();
        allow write: if isOwner(userId);
      }

      // Comments subcollection
      match /comments/{commentId} {
        allow read: if isAuthenticated();
        allow create: if isAuthenticated();
        allow update: if isAuthenticated() &&
                        resource.data.authorId == request.auth.uid;
        allow delete: if isAuthenticated() &&
                        resource.data.authorId == request.auth.uid;
      }
    }

    // Follows
    match /follows/{followId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() &&
                      request.resource.data.followerId == request.auth.uid;
      allow delete: if isAuthenticated() &&
                      resource.data.followerId == request.auth.uid;
    }

    // Saved posts
    match /savedPosts/{userId}/posts/{postId} {
      allow read, write: if isOwner(userId);
    }

    // Stories
    match /stories/{storyId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() &&
                      request.resource.data.authorId == request.auth.uid;
      allow delete: if isAuthenticated() &&
                      resource.data.authorId == request.auth.uid;

      match /views/{userId} {
        allow read: if isAuthenticated();
        allow write: if isOwner(userId);
      }
    }

    // Bookings
    match /bookings/{bookingId} {
      allow read: if isAuthenticated() &&
                    (resource.data.clientId == request.auth.uid ||
                     resource.data.barberId == request.auth.uid);
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() &&
                      (resource.data.clientId == request.auth.uid ||
                       resource.data.barberId == request.auth.uid);
    }

    // Conversations & Messages
    match /conversations/{conversationId} {
      allow read: if isAuthenticated() &&
                    request.auth.uid in resource.data.participantIds;
      allow create: if isAuthenticated() &&
                      request.auth.uid in request.resource.data.participantIds;

      match /messages/{messageId} {
        allow read: if isAuthenticated() &&
                      request.auth.uid in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participantIds;
        allow create: if isAuthenticated() &&
                        request.resource.data.senderId == request.auth.uid;
      }
    }

    // Notifications
    match /notifications/{notificationId} {
      allow read: if isAuthenticated() &&
                    resource.data.userId == request.auth.uid;
      allow write: if false; // Only Cloud Functions can write
    }

    // Services
    match /services/{serviceId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() &&
                     isBarber() &&
                     request.resource.data.barberId == request.auth.uid;
    }

    // Reviews
    match /reviews/{reviewId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() &&
                      request.resource.data.clientId == request.auth.uid;
      allow update: if isAuthenticated() &&
                      (resource.data.clientId == request.auth.uid ||
                       resource.data.barberId == request.auth.uid);
    }

    // Job Listings
    match /jobListings/{jobId} {
      allow read: if isAuthenticated();
      allow create: if isBusinessOwner();
      allow update, delete: if isAuthenticated() &&
                              resource.data.employerId == request.auth.uid;
    }

    // Promotions
    match /promotions/{promotionId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isAuthenticated() &&
                                      isBarber() &&
                                      resource.data.barberId == request.auth.uid;
    }
  }
}
```

### Storage Security Rules

1. Go to **Storage → Rules**
2. Replace with the following rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // Profile images
    match /users/{userId}/profile/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Post images
    match /posts/{userId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Story media
    match /stories/{userId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Service photos
    match /services/{barberId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == barberId;
    }

    // Review images
    match /reviews/{reviewId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

---

## Cloud Functions Deployment

### 1. Initialize Firebase Functions

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize functions in your project
cd barber-connect
firebase init functions

# Select:
# - Use existing project
# - TypeScript
# - ESLint: Yes
# - Install dependencies: Yes
```

### 2. Install Dependencies

```bash
cd functions
npm install firebase-admin firebase-functions
```

### 3. Deploy Example Functions

The Cloud Functions code is already provided in this documentation. Create `functions/src/index.ts` with the functions from the architecture document.

Key functions to implement:
- `onFollowCreated` - Update follower counts
- `onPostCreated/Deleted` - Update post counts
- `onLikeCreated` - Update like counts, send notifications
- `onCommentCreated` - Update comment counts, send notifications
- `cleanupExpiredStories` - Scheduled function to delete 24h+ stories
- `onMessageCreated` - Send push notifications for new messages
- `onBookingStatusChanged` - Notify users of booking updates

### 4. Deploy Functions

```bash
# Deploy all functions
firebase deploy --only functions

# Or deploy specific function
firebase deploy --only functions:onFollowCreated
```

---

## Environment Configuration

### Create Firestore Indexes

Some queries require composite indexes. Firebase will suggest these when you first run queries.

1. Go to **Firestore Database → Indexes**
2. Add composite indexes as suggested by the console
3. Common indexes needed:
   - `posts`: `createdAt DESC`
   - `follows`: `followerId ASC, createdAt DESC`
   - `follows`: `followingId ASC, createdAt DESC`
   - `conversations/{id}/messages`: `createdAt DESC`

---

## Installation

### 1. Install Dependencies

```bash
cd barber-connect
npm install
```

This will install Firebase SDK (`firebase` package is already in `package.json`).

### 2. Set Up Environment Variables

```bash
cp .env.example .env
# Edit .env with your Firebase config
```

### 3. Run the App

```bash
npm start
```

---

## Cost Estimation

### Firebase Pricing (Blaze Plan - Pay as you go)

#### Free Tier (per month)
- **Firestore**: 50K reads, 20K writes, 20K deletes, 1 GB storage
- **Storage**: 5 GB, 1 GB downloads
- **Cloud Functions**: 2M invocations, 400K GB-seconds
- **Authentication**: Unlimited
- **Hosting**: 10 GB, 360 MB/day downloads

#### Estimated Costs for 10,000 Active Users

| Service | Usage | Cost/Month |
|---------|-------|------------|
| Firestore | ~10M reads, 2M writes | ~$40 |
| Storage | 100 GB storage, 500 GB downloads | ~$7.50 |
| Cloud Functions | 5M invocations | ~$2 |
| Cloud Messaging | Unlimited | Free |
| **Total** | | **~$50/month** |

#### Scaling to 100,000 Users
- Estimated cost: **$400-600/month**
- Still significantly cheaper than custom server infrastructure

### Cost Optimization Tips
1. **Enable offline persistence** - Reduces Firestore reads
2. **Implement pagination** - Load data incrementally
3. **Cache frequently accessed data** - Use React state/Zustand
4. **Optimize images** - Compress before upload
5. **Use Cloud Functions sparingly** - Batch operations when possible
6. **Set up budget alerts** - Firebase Console → Project Settings → Usage and billing

---

## Firebase vs Custom Backend Comparison

| Feature | Firebase | Custom Backend |
|---------|----------|----------------|
| **Setup Time** | 1-2 days | 2-4 weeks |
| **Scalability** | Automatic | Manual configuration |
| **Maintenance** | Fully managed | Self-managed |
| **Cost (10K users)** | ~$50/month | ~$200-500/month (servers + DB) |
| **Real-time Data** | Built-in | Requires WebSocket setup |
| **Authentication** | Built-in | Custom implementation |
| **File Storage** | Built-in | Requires S3/CDN setup |
| **Security** | Security rules | Custom middleware |
| **Offline Support** | Built-in | Complex to implement |
| **Analytics** | Built-in | Requires integration |
| **Push Notifications** | Built-in (FCM) | Requires FCM integration |

### Pros of Firebase
✅ Rapid development
✅ Automatic scaling
✅ No server maintenance
✅ Real-time capabilities
✅ Offline support
✅ Built-in analytics
✅ Cost-effective for small-medium apps

### Cons of Firebase
❌ Vendor lock-in
❌ Complex queries limited
❌ Can get expensive at very high scale
❌ Less control over infrastructure

---

## Next Steps

1. **Create Firebase Project** following the setup guide above
2. **Install dependencies**: `npm install`
3. **Configure environment**: Copy `.env.example` to `.env` and add your Firebase config
4. **Deploy security rules** from Firebase Console
5. **Deploy Cloud Functions**: `firebase deploy --only functions`
6. **Test authentication flow** in the app
7. **Create test data** in Firestore to verify screens are working

---

## Support & Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)
- [Cloud Functions Documentation](https://firebase.google.com/docs/functions)
- [Firebase Pricing Calculator](https://firebase.google.com/pricing)
- [React Native Firebase](https://rnfirebase.io/) (alternative SDK with more native features)

---

## Troubleshooting

### "Permission denied" errors
- Check Firestore security rules
- Verify user is authenticated
- Ensure user has correct role/custom claims

### Slow queries
- Add composite indexes in Firestore console
- Implement pagination
- Enable offline persistence

### Cloud Functions timeout
- Increase timeout in function config
- Optimize function code
- Consider breaking into smaller functions

### High costs
- Check Firebase Console → Usage dashboard
- Review query patterns (avoid scanning entire collections)
- Implement caching strategy
- Set up budget alerts
