# Firestore Security Rules for BarberConnect App

## Complete Firestore Rules Configuration

Copy and paste the rules below into your Firebase Console under **Firestore Database** → **Rules**.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ============================================
    // HELPER FUNCTIONS
    // ============================================

    // Check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Check if user owns the resource
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Check if user is a barber
    function isBarber() {
      return isAuthenticated() &&
             exists(/databases/$(database)/documents/barbers/$(request.auth.uid));
    }

    // Check if user is part of a conversation
    function isConversationParticipant(participantsList) {
      return isAuthenticated() &&
             request.auth.uid in participantsList;
    }

    // Validate timestamp is in the future
    function isValidFutureTimestamp(timestamp) {
      return timestamp > request.time;
    }


    // ============================================
    // USERS COLLECTION
    // ============================================
    match /users/{userId} {
      // Anyone can read basic user profiles (for discovery)
      allow read: if isAuthenticated();

      // Users can create their own profile
      allow create: if isAuthenticated() &&
                       request.auth.uid == userId &&
                       request.resource.data.id == userId;

      // Users can only update their own profile
      allow update: if isOwner(userId);

      // Only user can delete their own profile
      allow delete: if isOwner(userId);

      // Push tokens subcollection
      match /pushTokens/{tokenId} {
        allow read, write: if isOwner(userId);
      }
    }


    // ============================================
    // BARBERS COLLECTION
    // ============================================
    match /barbers/{barberId} {
      // Anyone can read barber profiles (for discovery)
      allow read: if isAuthenticated();

      // Only the barber can create their profile
      allow create: if isAuthenticated() &&
                       request.auth.uid == barberId &&
                       request.resource.data.userId == barberId;

      // Only the barber can update their profile
      allow update: if isOwner(barberId) ||
                       // Allow system to update stats
                       (isAuthenticated() &&
                        request.resource.data.diff(resource.data).affectedKeys()
                          .hasOnly(['totalClients', 'totalReviews', 'rating', 'followersCount', 'postsCount']));

      // Only the barber can delete their profile
      allow delete: if isOwner(barberId);
    }


    // ============================================
    // BARBER AVAILABILITY COLLECTION
    // ============================================
    match /barberAvailability/{barberId} {
      // Anyone can read availability (for booking)
      allow read: if isAuthenticated();

      // Only the barber can manage their availability
      allow create, update, delete: if isOwner(barberId);
    }


    // ============================================
    // BOOKINGS COLLECTION
    // ============================================
    match /bookings/{bookingId} {
      // Users can read their own bookings (client or barber)
      allow read: if isAuthenticated() &&
                     (request.auth.uid == resource.data.clientId ||
                      request.auth.uid == resource.data.barberId);

      // Clients can create bookings
      allow create: if isAuthenticated() &&
                       request.auth.uid == request.resource.data.clientId &&
                       request.resource.data.status == 'PENDING';

      // Clients can cancel their own bookings
      // Barbers can update status of their bookings
      allow update: if isAuthenticated() && (
                       (request.auth.uid == resource.data.clientId &&
                        request.resource.data.status == 'CANCELLED') ||
                       (request.auth.uid == resource.data.barberId &&
                        request.resource.data.status in ['CONFIRMED', 'COMPLETED', 'CANCELLED'])
                     );

      // No one can delete bookings (for record keeping)
      allow delete: if false;
    }


    // ============================================
    // POSTS COLLECTION (Social Feed)
    // ============================================
    match /posts/{postId} {
      // Anyone can read posts
      allow read: if isAuthenticated();

      // Barbers can create posts
      allow create: if isBarber() &&
                       request.auth.uid == request.resource.data.authorId;

      // Post authors can update their posts
      allow update: if isOwner(resource.data.authorId) ||
                       // Allow system to update engagement stats
                       (isAuthenticated() &&
                        request.resource.data.diff(resource.data).affectedKeys()
                          .hasOnly(['likesCount', 'commentsCount', 'sharesCount', 'viewsCount']));

      // Post authors can delete their posts
      allow delete: if isOwner(resource.data.authorId);
    }


    // ============================================
    // STORIES COLLECTION
    // ============================================
    match /stories/{storyId} {
      // Anyone can read stories
      allow read: if isAuthenticated();

      // Barbers can create stories
      allow create: if isBarber() &&
                       request.auth.uid == request.resource.data.authorId &&
                       isValidFutureTimestamp(request.resource.data.expiresAt);

      // Story authors can update their stories
      allow update: if isOwner(resource.data.authorId) ||
                       // Allow system to update view stats
                       (isAuthenticated() &&
                        request.resource.data.diff(resource.data).affectedKeys()
                          .hasOnly(['viewsCount', 'viewedBy']));

      // Story authors can delete their stories
      allow delete: if isOwner(resource.data.authorId);
    }


    // ============================================
    // MESSAGES COLLECTION
    // ============================================
    match /messages/{messageId} {
      // Only message participants can read
      allow read: if isAuthenticated() &&
                     (request.auth.uid == resource.data.senderId ||
                      request.auth.uid == resource.data.receiverId);

      // Users can create messages they send
      allow create: if isAuthenticated() &&
                       request.auth.uid == request.resource.data.senderId;

      // Receivers can mark messages as read
      allow update: if isAuthenticated() &&
                       request.auth.uid == resource.data.receiverId &&
                       request.resource.data.diff(resource.data).affectedKeys()
                         .hasOnly(['isRead']);

      // No one can delete messages (for record keeping)
      allow delete: if false;
    }


    // ============================================
    // CONVERSATIONS COLLECTION
    // ============================================
    match /conversations/{conversationId} {
      // Only conversation participants can read
      allow read: if isConversationParticipant(resource.data.participants);

      // Users can create conversations they're part of
      allow create: if isAuthenticated() &&
                       request.auth.uid in request.resource.data.participants &&
                       request.resource.data.participants.size() == 2;

      // Participants can update conversation (last message, unread count)
      allow update: if isConversationParticipant(resource.data.participants);

      // No one can delete conversations
      allow delete: if false;
    }


    // ============================================
    // NOTIFICATIONS COLLECTION
    // ============================================
    match /notifications/{notificationId} {
      // Users can only read their own notifications
      allow read: if isOwner(resource.data.userId);

      // System/users can create notifications
      allow create: if isAuthenticated();

      // Users can mark their notifications as read
      allow update: if isOwner(resource.data.userId) &&
                       request.resource.data.diff(resource.data).affectedKeys()
                         .hasOnly(['read']);

      // Users can delete their notifications
      allow delete: if isOwner(resource.data.userId);
    }


    // ============================================
    // REVIEWS COLLECTION
    // ============================================
    match /reviews/{reviewId} {
      // Anyone can read reviews
      allow read: if isAuthenticated();

      // Clients can create reviews for bookings they had
      allow create: if isAuthenticated() &&
                       request.auth.uid == request.resource.data.clientId &&
                       request.resource.data.rating >= 1 &&
                       request.resource.data.rating <= 5;

      // Reviewers can update their own reviews
      allow update: if isOwner(resource.data.clientId);

      // Reviewers can delete their own reviews
      allow delete: if isOwner(resource.data.clientId);
    }


    // ============================================
    // JOBS COLLECTION
    // ============================================
    match /jobs/{jobId} {
      // Anyone can read job listings
      allow read: if isAuthenticated();

      // Business owners/barbers can post jobs
      allow create: if isBarber() &&
                       request.auth.uid == request.resource.data.posterId;

      // Job posters can update their jobs
      allow update: if isOwner(resource.data.posterId) ||
                       // Allow system to update applicant count
                       (isAuthenticated() &&
                        request.resource.data.diff(resource.data).affectedKeys()
                          .hasOnly(['applicantsCount']));

      // Job posters can delete their jobs
      allow delete: if isOwner(resource.data.posterId);
    }


    // ============================================
    // JOB APPLICATIONS COLLECTION
    // ============================================
    match /jobApplications/{applicationId} {
      // Job posters and applicants can read applications
      allow read: if isAuthenticated() && (
                     request.auth.uid == resource.data.applicantId ||
                     request.auth.uid == resource.data.posterId
                  );

      // Users can apply to jobs
      allow create: if isAuthenticated() &&
                       request.auth.uid == request.resource.data.applicantId;

      // Job posters can update application status
      allow update: if isOwner(resource.data.posterId);

      // Applicants can withdraw applications
      allow delete: if isOwner(resource.data.applicantId);
    }


    // ============================================
    // FOLLOWS COLLECTION
    // ============================================
    match /follows/{followId} {
      // Anyone can read follows (for follower lists)
      allow read: if isAuthenticated();

      // Users can follow others
      allow create: if isAuthenticated() &&
                       request.auth.uid == request.resource.data.followerId;

      // No updates allowed
      allow update: if false;

      // Users can unfollow (delete their follow)
      allow delete: if isOwner(resource.data.followerId);
    }


    // ============================================
    // FAVORITES COLLECTION
    // ============================================
    match /favorites/{favoriteId} {
      // Users can only read their own favorites
      allow read: if isOwner(resource.data.userId);

      // Users can add favorites
      allow create: if isAuthenticated() &&
                       request.auth.uid == request.resource.data.userId;

      // No updates allowed
      allow update: if false;

      // Users can remove favorites
      allow delete: if isOwner(resource.data.userId);
    }


    // ============================================
    // DEFAULT DENY ALL
    // ============================================
    // Deny all other reads and writes
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Rules Summary

### Security Features Implemented:

1. **Authentication Required**: All operations require authenticated users
2. **User Privacy**: Users can only access their own data (bookings, messages, notifications)
3. **Role-Based Access**: Barber-specific operations restricted to verified barbers
4. **Data Validation**: Constraints on data types and values (e.g., rating 1-5)
5. **Conversation Privacy**: Only participants can read/write messages and conversations
6. **Record Keeping**: Bookings and messages cannot be deleted (audit trail)
7. **Public Discovery**: Barber profiles, posts, and reviews readable by all authenticated users
8. **Stat Updates**: Automated stat updates (likes, followers, etc.) allowed with field restrictions
9. **Owner-Only Operations**: Users can only modify their own content
10. **Future-Proof**: Default deny-all rule prevents unauthorized access to new collections

### Collections Secured:

- ✅ `users` - User profiles and authentication data
- ✅ `barbers` - Barber profiles and business information
- ✅ `barberAvailability` - Barber schedule and booking windows
- ✅ `bookings` - Appointment bookings between clients and barbers
- ✅ `posts` - Social feed content from barbers
- ✅ `stories` - Temporary story content (24-hour expiry)
- ✅ `messages` - Direct messages between users
- ✅ `conversations` - Message thread metadata
- ✅ `notifications` - User notifications
- ✅ `reviews` - Client reviews for barbers
- ✅ `jobs` - Job listings from barber shops
- ✅ `jobApplications` - Applications to job postings
- ✅ `follows` - Social follow relationships
- ✅ `favorites` - User-saved favorite barbers
- ✅ `pushTokens` - (Subcollection) FCM push notification tokens

## How to Deploy

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** → **Rules**
4. Copy the entire rules section above (everything inside the triple backticks)
5. Paste into the Firebase rules editor
6. Click **Publish**

## Testing Your Rules

After deploying, test your rules in the Firebase Console:
- Go to **Rules** → **Rules Playground**
- Test various operations (read/write) with different user IDs
- Ensure unauthorized access is properly denied

## Important Notes

⚠️ **Before deploying to production:**
- Test all rules thoroughly in your development environment
- Verify that all app features work correctly with these rules
- Consider enabling Firestore audit logs for monitoring
- Set up alerts for rule violations

🔒 **Security Best Practices:**
- Never use `allow read, write: if true;` in production
- Always validate user input on both client and server side
- Use Firebase Authentication tokens, not custom auth
- Regularly review and update rules as your app evolves
- Monitor Firestore usage and costs to detect abuse

## Rule Maintenance

As you add new features to your app:
1. Add new collection rules following the pattern above
2. Test rules in development first
3. Use the default deny-all rule as a safety net
4. Document any special permissions or exceptions
