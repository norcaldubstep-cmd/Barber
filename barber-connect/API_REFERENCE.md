# API Reference - BarberConnect Firebase Services

Complete API documentation for all Firebase service functions in the BarberConnect application.

---

## Table of Contents

1. [Authentication Service](#authentication-service)
2. [Booking Service](#booking-service)
3. [Chat Service](#chat-service)
4. [Barber Service](#barber-service)
5. [Posts Service](#posts-service)
6. [Stories Service](#stories-service)
7. [Reviews Service](#reviews-service)
8. [Jobs Service](#jobs-service)
9. [Users Service](#users-service)
10. [Notification Service](#notification-service)
11. [Image Upload Service](#image-upload-service)
12. [Location Service](#location-service)
13. [Push Notification Service](#push-notification-service)

---

## Authentication Service

**Location:** `src/services/authService.ts`

### `signUp()`

Create a new user account with email and password.

**Signature:**
```typescript
signUp(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  role: UserRole = UserRole.CLIENT,
  isBusinessOwner: boolean = false
): Promise<User>
```

**Parameters:**
- `email` (string): User's email address
- `password` (string): User's password (min 6 characters)
- `firstName` (string): User's first name
- `lastName` (string): User's last name
- `role` (UserRole): User role - CLIENT, BARBER, or BUSINESS_OWNER
- `isBusinessOwner` (boolean): Whether user owns a barbershop

**Returns:** Promise<User> - Created user object

**Example:**
```typescript
import { signUp } from './services/authService';

try {
  const user = await signUp(
    'john@example.com',
    'password123',
    'John',
    'Doe',
    UserRole.CLIENT,
    false
  );
  console.log('User created:', user.id);
} catch (error) {
  console.error('Sign up failed:', error.message);
}
```

**Errors:**
- "This email is already registered"
- "Invalid email address"
- "Password should be at least 6 characters"

---

### `signIn()`

Sign in an existing user with email and password.

**Signature:**
```typescript
signIn(email: string, password: string): Promise<User>
```

**Parameters:**
- `email` (string): User's email address
- `password` (string): User's password

**Returns:** Promise<User> - Authenticated user object

**Example:**
```typescript
const user = await signIn('john@example.com', 'password123');
```

**Errors:**
- "No account found with this email"
- "Incorrect password"
- "Invalid email or password"

---

### `logOut()`

Sign out the current user.

**Signature:**
```typescript
logOut(): Promise<void>
```

**Example:**
```typescript
await logOut();
```

---

### `resetPassword()`

Send password reset email to user.

**Signature:**
```typescript
resetPassword(email: string): Promise<void>
```

**Parameters:**
- `email` (string): User's email address

**Example:**
```typescript
await resetPassword('john@example.com');
```

---

### `getCurrentUser()`

Get the current authenticated user's data.

**Signature:**
```typescript
getCurrentUser(): Promise<User | null>
```

**Returns:** Promise<User | null> - Current user or null if not authenticated

**Example:**
```typescript
const currentUser = await getCurrentUser();
if (currentUser) {
  console.log('Logged in as:', currentUser.email);
}
```

---

### `updateUserProfile()`

Update user profile information.

**Signature:**
```typescript
updateUserProfile(userId: string, updates: Partial<User>): Promise<void>
```

**Parameters:**
- `userId` (string): User's ID
- `updates` (Partial<User>): Fields to update

**Example:**
```typescript
await updateUserProfile(userId, {
  firstName: 'Jane',
  bio: 'Professional barber',
  phone: '+1234567890'
});
```

---

### `onAuthStateChanged()`

Listen to authentication state changes.

**Signature:**
```typescript
onAuthStateChanged(callback: (user: FirebaseUser | null) => void): () => void
```

**Parameters:**
- `callback` (function): Function called when auth state changes

**Returns:** Unsubscribe function

**Example:**
```typescript
const unsubscribe = onAuthStateChanged((user) => {
  if (user) {
    console.log('User logged in:', user.uid);
  } else {
    console.log('User logged out');
  }
});

// Later, to stop listening
unsubscribe();
```

---

## Booking Service

**Location:** `src/services/bookingService.ts`

### `createBooking()`

Create a new booking/appointment.

**Signature:**
```typescript
createBooking(
  clientId: string,
  clientName: string,
  barberId: string,
  barberName: string,
  services: Service[],
  date: string,
  startTime: string,
  notes?: string,
  clientAvatar?: string,
  barberAvatar?: string
): Promise<Booking>
```

**Parameters:**
- `clientId` (string): Client's user ID
- `clientName` (string): Client's display name
- `barberId` (string): Barber's user ID
- `barberName` (string): Barber's display name
- `services` (Service[]): Array of selected services
- `date` (string): Booking date (YYYY-MM-DD format)
- `startTime` (string): Start time (HH:MM format)
- `notes` (string, optional): Special requests or notes
- `clientAvatar` (string, optional): Client's avatar URL
- `barberAvatar` (string, optional): Barber's avatar URL

**Returns:** Promise<Booking> - Created booking object

**Example:**
```typescript
const booking = await createBooking(
  'client123',
  'John Doe',
  'barber456',
  'Mike Smith',
  [
    { id: '1', name: 'Haircut', duration: 30, price: 25 },
    { id: '2', name: 'Beard Trim', duration: 15, price: 10 }
  ],
  '2025-11-15',
  '14:00',
  'Please use low fade technique'
);
```

---

### `getAvailableTimeSlots()`

Get available time slots for a barber on a specific date.

**Signature:**
```typescript
getAvailableTimeSlots(barberId: string, date: string): Promise<TimeSlot[]>
```

**Parameters:**
- `barberId` (string): Barber's user ID
- `date` (string): Date to check (YYYY-MM-DD format)

**Returns:** Promise<TimeSlot[]> - Array of available time slots

**Example:**
```typescript
const slots = await getAvailableTimeSlots('barber456', '2025-11-15');
slots.forEach(slot => {
  console.log(`${slot.time} - ${slot.isAvailable ? 'Available' : 'Booked'}`);
});
```

---

### `getClientBookings()`

Get all bookings for a client.

**Signature:**
```typescript
getClientBookings(
  clientId: string,
  status?: BookingStatus,
  limitCount: number = 50
): Promise<Booking[]>
```

**Parameters:**
- `clientId` (string): Client's user ID
- `status` (BookingStatus, optional): Filter by status (PENDING, CONFIRMED, etc.)
- `limitCount` (number): Maximum number of bookings to return

**Returns:** Promise<Booking[]> - Array of bookings

**Example:**
```typescript
const upcomingBookings = await getClientBookings(
  'client123',
  BookingStatus.CONFIRMED
);
```

---

### `updateBookingStatus()`

Update the status of a booking.

**Signature:**
```typescript
updateBookingStatus(bookingId: string, status: BookingStatus): Promise<void>
```

**Parameters:**
- `bookingId` (string): Booking ID
- `status` (BookingStatus): New status (PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED)

**Example:**
```typescript
await updateBookingStatus('booking789', BookingStatus.CONFIRMED);
```

---

### `cancelBooking()`

Cancel a booking.

**Signature:**
```typescript
cancelBooking(bookingId: string): Promise<void>
```

**Example:**
```typescript
await cancelBooking('booking789');
```

---

## Chat Service

**Location:** `src/services/chatService.ts`

### `getOrCreateConversation()`

Get existing conversation or create new one between two users.

**Signature:**
```typescript
getOrCreateConversation(
  userId: string,
  otherUserId: string,
  userDetails: { name: string; avatar?: string; role: 'CLIENT' | 'BARBER' },
  otherUserDetails: { name: string; avatar?: string; role: 'CLIENT' | 'BARBER' }
): Promise<string>
```

**Returns:** Promise<string> - Conversation ID

**Example:**
```typescript
const conversationId = await getOrCreateConversation(
  'user123',
  'barber456',
  { name: 'John Doe', avatar: 'url', role: 'CLIENT' },
  { name: 'Mike Smith', avatar: 'url', role: 'BARBER' }
);
```

---

### `sendMessage()`

Send a text message in a conversation.

**Signature:**
```typescript
sendMessage(
  conversationId: string,
  senderId: string,
  senderName: string,
  receiverId: string,
  content: string,
  senderAvatar?: string
): Promise<Message>
```

**Parameters:**
- `conversationId` (string): ID of the conversation
- `senderId` (string): Sender's user ID
- `senderName` (string): Sender's display name
- `receiverId` (string): Receiver's user ID
- `content` (string): Message text
- `senderAvatar` (string, optional): Sender's avatar URL

**Returns:** Promise<Message> - Sent message object

**Example:**
```typescript
const message = await sendMessage(
  conversationId,
  'user123',
  'John Doe',
  'barber456',
  'Hi, I would like to book an appointment'
);
```

---

### `sendImageMessage()`

Send an image message.

**Signature:**
```typescript
sendImageMessage(
  conversationId: string,
  senderId: string,
  senderName: string,
  receiverId: string,
  imageUri: string,
  caption?: string,
  senderAvatar?: string
): Promise<Message>
```

**Example:**
```typescript
const imageMessage = await sendImageMessage(
  conversationId,
  'user123',
  'John Doe',
  'barber456',
  'file:///path/to/image.jpg',
  'Check out this hairstyle!'
);
```

---

### `listenToMessages()`

Listen to messages in real-time.

**Signature:**
```typescript
listenToMessages(
  conversationId: string,
  callback: (messages: Message[]) => void
): () => void
```

**Parameters:**
- `conversationId` (string): Conversation ID
- `callback` (function): Function called when messages update

**Returns:** Unsubscribe function

**Example:**
```typescript
const unsubscribe = listenToMessages(conversationId, (messages) => {
  console.log('New messages:', messages);
});

// Later
unsubscribe();
```

---

### `markConversationAsRead()`

Mark all messages in a conversation as read.

**Signature:**
```typescript
markConversationAsRead(conversationId: string, userId: string): Promise<void>
```

**Example:**
```typescript
await markConversationAsRead(conversationId, 'user123');
```

---

## Barber Service

**Location:** `src/services/barberService.ts`

### `getBarberProfile()`

Get barber's complete profile.

**Signature:**
```typescript
getBarberProfile(barberId: string): Promise<BarberProfile | null>
```

**Returns:** Promise<BarberProfile | null> - Barber profile or null

**Example:**
```typescript
const barber = await getBarberProfile('barber456');
console.log(barber.displayName, barber.rating);
```

---

### `searchBarbers()`

Search for barbers with filters.

**Signature:**
```typescript
searchBarbers(
  filters: BarberSearchFilters,
  limitCount: number = 20
): Promise<BarberProfile[]>
```

**Parameters:**
- `filters` (BarberSearchFilters): Search criteria
  - `query` (string): Name search
  - `verified` (boolean): Only verified barbers
  - `minRating` (number): Minimum rating
  - `specialties` (string[]): Required specialties
  - `priceRange` ({ min, max }): Price range
  - `location` ({ latitude, longitude }): User location
  - `maxDistance` (number): Maximum distance in miles
  - `sortBy` ('rating' | 'popularity' | 'distance' | 'promoted')

**Returns:** Promise<BarberProfile[]> - Matching barbers

**Example:**
```typescript
const barbers = await searchBarbers({
  minRating: 4.0,
  specialties: ['Fade', 'Beard Trim'],
  location: { latitude: 37.7749, longitude: -122.4194 },
  maxDistance: 10,
  sortBy: 'rating'
});
```

---

### `getNearbyBarbers()`

Get barbers near a location.

**Signature:**
```typescript
getNearbyBarbers(
  latitude: number,
  longitude: number,
  radiusMiles: number = 25,
  limitCount: number = 20
): Promise<BarberProfile[]>
```

**Example:**
```typescript
const nearbyBarbers = await getNearbyBarbers(37.7749, -122.4194, 10);
```

---

### `updateBarberServices()`

Update barber's service list.

**Signature:**
```typescript
updateBarberServices(barberId: string, services: Service[]): Promise<void>
```

**Example:**
```typescript
await updateBarberServices('barber456', [
  { id: '1', name: 'Haircut', duration: 30, price: 30 },
  { id: '2', name: 'Fade', duration: 45, price: 40 },
  { id: '3', name: 'Beard Trim', duration: 15, price: 15 }
]);
```

---

### `uploadPortfolioImage()`

Upload image to barber's portfolio.

**Signature:**
```typescript
uploadPortfolioImage(barberId: string, imageUri: string): Promise<string>
```

**Returns:** Promise<string> - Download URL of uploaded image

**Example:**
```typescript
const imageUrl = await uploadPortfolioImage(
  'barber456',
  'file:///path/to/image.jpg'
);
```

---

### `getBarberAnalytics()`

Get analytics data for a barber.

**Signature:**
```typescript
getBarberAnalytics(
  barberId: string,
  startDate: Date,
  endDate: Date
): Promise<AnalyticsData>
```

**Returns:** Analytics object with revenue, bookings, clients, top services

**Example:**
```typescript
const analytics = await getBarberAnalytics(
  'barber456',
  new Date('2025-11-01'),
  new Date('2025-11-30')
);

console.log('Total revenue:', analytics.revenue);
console.log('Total bookings:', analytics.bookings);
```

---

## Posts Service

**Location:** `src/services/postsService.ts`

### `getFeedPosts()`

Get paginated feed posts.

**Signature:**
```typescript
getFeedPosts(
  lastDoc?: DocumentSnapshot,
  pageSize: number = 20
): Promise<{ posts: Post[]; lastDoc: DocumentSnapshot | null }>
```

**Returns:** Object with posts array and pagination cursor

**Example:**
```typescript
const { posts, lastDoc } = await getFeedPosts();

// Load more
const { posts: morePosts } = await getFeedPosts(lastDoc);
```

---

### `createPost()`

Create a new post with images.

**Signature:**
```typescript
createPost(
  images: string[],
  caption: string,
  hashtags: string[],
  location?: { name: string; lat: number; lng: number },
  type: 'post' | 'promotion' | 'portfolio' = 'post'
): Promise<string>
```

**Returns:** Promise<string> - Created post ID

**Example:**
```typescript
const postId = await createPost(
  ['file:///image1.jpg', 'file:///image2.jpg'],
  'Fresh fade for my client today! 💈',
  ['#fade', '#barbering', '#freshcut'],
  { name: 'Downtown Barber Shop', lat: 37.7749, lng: -122.4194 },
  'portfolio'
);
```

---

### `toggleLike()`

Like or unlike a post.

**Signature:**
```typescript
toggleLike(postId: string, currentlyLiked: boolean): Promise<void>
```

**Example:**
```typescript
await toggleLike('post789', false); // Like
await toggleLike('post789', true);  // Unlike
```

---

### `addComment()`

Add a comment to a post.

**Signature:**
```typescript
addComment(postId: string, text: string): Promise<void>
```

**Example:**
```typescript
await addComment('post789', 'Great work! 🔥');
```

---

### `getSavedPosts()`

Get user's saved posts.

**Signature:**
```typescript
getSavedPosts(): Promise<Post[]>
```

**Example:**
```typescript
const savedPosts = await getSavedPosts();
```

---

## Image Upload Service

**Location:** `src/services/imageUploadService.ts`

### `pickImage()`

Pick a single image from library.

**Signature:**
```typescript
pickImage(options?: ImagePickerOptions): Promise<string | null>
```

**Parameters:**
- `options` (object, optional):
  - `allowsEditing` (boolean): Allow image editing
  - `aspect` ([number, number]): Aspect ratio
  - `quality` (number): Image quality (0-1)

**Returns:** Promise<string | null> - Image URI or null if cancelled

**Example:**
```typescript
const imageUri = await pickImage({ aspect: [1, 1], quality: 0.8 });
if (imageUri) {
  console.log('Selected:', imageUri);
}
```

---

### `takePhoto()`

Take a photo with camera.

**Signature:**
```typescript
takePhoto(options?: ImagePickerOptions): Promise<string | null>
```

**Example:**
```typescript
const photoUri = await takePhoto({ allowsEditing: true });
```

---

### `uploadImage()`

Upload image to Firebase Storage.

**Signature:**
```typescript
uploadImage(uri: string, path: string): Promise<string>
```

**Parameters:**
- `uri` (string): Local image URI
- `path` (string): Firebase Storage path

**Returns:** Promise<string> - Download URL

**Example:**
```typescript
const downloadUrl = await uploadImage(
  'file:///image.jpg',
  'users/user123/profile'
);
```

---

### `uploadImages()`

Upload multiple images.

**Signature:**
```typescript
uploadImages(
  uris: string[],
  basePath: string,
  onProgress?: (current: number, total: number) => void
): Promise<string[]>
```

**Example:**
```typescript
const urls = await uploadImages(
  ['file:///img1.jpg', 'file:///img2.jpg'],
  'posts/user123',
  (current, total) => console.log(`${current}/${total}`)
);
```

---

## Location Service

**Location:** `src/services/locationService.ts`

### `getCurrentLocation()`

Get device's current GPS location.

**Signature:**
```typescript
getCurrentLocation(): Promise<LocationCoords | null>
```

**Returns:** Promise<LocationCoords | null> - { latitude, longitude } or null

**Example:**
```typescript
const location = await getCurrentLocation();
if (location) {
  console.log(location.latitude, location.longitude);
}
```

---

### `getLocationOrDefault()`

Get location with fallback to cached or default.

**Signature:**
```typescript
getLocationOrDefault(forceRefresh: boolean = false): Promise<LocationCoords>
```

**Returns:** Promise<LocationCoords> - Always returns a location

**Example:**
```typescript
const location = await getLocationOrDefault();
// Will try cached -> GPS -> San Francisco (default)
```

---

## Push Notification Service

**Location:** `src/services/pushNotificationService.ts`

### `registerForPushNotifications()`

Register device for push notifications.

**Signature:**
```typescript
registerForPushNotifications(): Promise<string | null>
```

**Returns:** Promise<string | null> - Expo push token or null

**Example:**
```typescript
const token = await registerForPushNotifications();
if (token) {
  await savePushTokenToUser(userId, token);
}
```

---

### `savePushTokenToUser()`

Save push token to user's profile.

**Signature:**
```typescript
savePushTokenToUser(userId: string, token: string): Promise<void>
```

**Example:**
```typescript
await savePushTokenToUser('user123', 'ExponentPushToken[...]');
```

---

### `scheduleLocalNotification()`

Schedule a local notification.

**Signature:**
```typescript
scheduleLocalNotification(
  title: string,
  body: string,
  data?: any,
  triggerSeconds: number = 0
): Promise<string>
```

**Returns:** Promise<string> - Notification ID

**Example:**
```typescript
const notificationId = await scheduleLocalNotification(
  'Reminder',
  'Your appointment is in 1 hour',
  { bookingId: '123' },
  3600 // 1 hour
);
```

---

### `setupNotificationHandlers()`

Setup notification event listeners.

**Signature:**
```typescript
setupNotificationHandlers(
  onNotificationReceived?: (notification: Notification) => void,
  onNotificationResponse?: (response: NotificationResponse) => void
): () => void
```

**Returns:** Cleanup function

**Example:**
```typescript
const cleanup = setupNotificationHandlers(
  (notification) => console.log('Received:', notification),
  (response) => console.log('Tapped:', response)
);

// Later
cleanup();
```

---

### `setBadgeCount()`

Set app badge count (iOS).

**Signature:**
```typescript
setBadgeCount(count: number): Promise<void>
```

**Example:**
```typescript
await setBadgeCount(5); // Show "5" on app icon
```

---

## Error Handling

All service functions throw errors that should be caught:

```typescript
try {
  await createBooking(...);
} catch (error) {
  console.error('Booking failed:', error.message);
  // Show error to user
  Alert.alert('Error', error.message);
}
```

Common error messages:
- "Not authenticated" - User must sign in first
- "Permission denied" - User lacks required permissions
- "Network error" - Check internet connection
- "Failed to..." - Generic operation failure

---

## Type Definitions

See `src/types/` directory for complete type definitions:
- `user.types.ts` - User and UserRole
- `booking.types.ts` - Booking, Service, TimeSlot
- `message.types.ts` - Message, Conversation
- `barber.types.ts` - BarberProfile, BarberSearchFilters
- And more...

---

**Last Updated:** November 11, 2025
