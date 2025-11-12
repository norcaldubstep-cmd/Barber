import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  or,
} from 'firebase/firestore';
import { db, auth } from './firebase';

export interface User {
  id: string;
  email: string;
  displayName: string;
  username: string;
  avatar: string;
  role: 'client' | 'barber' | 'business_owner';
  phone?: string;
  bio?: string;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  isVerified: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  createdAt: Date;
  updatedAt: Date;
  isFollowing?: boolean;

  // Barber-specific fields
  shopName?: string;
  shopAddress?: string;
  services?: string[];
  rating?: number;
  reviewsCount?: number;
  yearsExperience?: number;
  specialties?: string[];
}

export interface SearchResult {
  id: string;
  type: 'user' | 'hashtag';
  name: string;
  username?: string;
  avatar?: string;
  isVerified?: boolean;
  followersCount?: number;
  postsCount?: number;
  isFollowing?: boolean;
}

// Get user by ID
export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const currentUserId = auth.currentUser?.uid;
    if (!currentUserId) throw new Error('Not authenticated');

    const userDoc = await getDoc(doc(db, 'users', userId));

    if (!userDoc.exists()) {
      return null;
    }

    const data = userDoc.data();

    // Check if current user is following this user
    const followQuery = query(
      collection(db, 'follows'),
      where('followerId', '==', currentUserId),
      where('followingId', '==', userId)
    );
    const followSnapshot = await getDocs(followQuery);
    const isFollowing = !followSnapshot.empty;

    return {
      id: userDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
      isFollowing,
    } as User;
  } catch (error) {
    // console.error('Error fetching user:', error);
    throw error;
  }
};

// Follow/Unfollow a user
export const toggleFollow = async (targetUserId: string, currentlyFollowing: boolean): Promise<void> => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');

    if (currentlyFollowing) {
      // Unfollow - find and delete the follow document
      const followQuery = query(
        collection(db, 'follows'),
        where('followerId', '==', userId),
        where('followingId', '==', targetUserId)
      );
      const snapshot = await getDocs(followQuery);

      if (!snapshot.empty) {
        await deleteDoc(snapshot.docs[0].ref);
        // Cloud Function will handle decrementing counts
      }
    } else {
      // Follow
      await addDoc(collection(db, 'follows'), {
        followerId: userId,
        followingId: targetUserId,
        createdAt: serverTimestamp(),
      });
      // Cloud Function will handle incrementing counts and creating notification
    }
  } catch (error) {
    // console.error('Error toggling follow:', error);
    throw error;
  }
};

// Get followers for a user
export const getFollowers = async (userId: string): Promise<User[]> => {
  try {
    const currentUserId = auth.currentUser?.uid;
    if (!currentUserId) throw new Error('Not authenticated');

    // Get all follow documents where this user is being followed
    const followsQuery = query(
      collection(db, 'follows'),
      where('followingId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const followsSnapshot = await getDocs(followsQuery);

    // Get user data for each follower
    const followers: User[] = await Promise.all(
      followsSnapshot.docs.map(async (followDoc) => {
        const followerId = followDoc.data().followerId;
        const userDoc = await getDoc(doc(db, 'users', followerId));

        if (!userDoc.exists()) return null;

        const data = userDoc.data();

        // Check if current user is following this follower
        const isFollowingQuery = query(
          collection(db, 'follows'),
          where('followerId', '==', currentUserId),
          where('followingId', '==', followerId)
        );
        const isFollowingSnapshot = await getDocs(isFollowingQuery);
        const isFollowing = !isFollowingSnapshot.empty;

        return {
          id: userDoc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          isFollowing,
        } as User;
      })
    );

    return followers.filter((f) => f !== null) as User[];
  } catch (error) {
    // console.error('Error fetching followers:', error);
    throw error;
  }
};

// Get following for a user
export const getFollowing = async (userId: string): Promise<User[]> => {
  try {
    const currentUserId = auth.currentUser?.uid;
    if (!currentUserId) throw new Error('Not authenticated');

    // Get all follow documents where this user is the follower
    const followsQuery = query(
      collection(db, 'follows'),
      where('followerId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const followsSnapshot = await getDocs(followsQuery);

    // Get user data for each person they're following
    const following: User[] = await Promise.all(
      followsSnapshot.docs.map(async (followDoc) => {
        const followingId = followDoc.data().followingId;
        const userDoc = await getDoc(doc(db, 'users', followingId));

        if (!userDoc.exists()) return null;

        const data = userDoc.data();

        return {
          id: userDoc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          isFollowing: true, // They're following all of these by definition
        } as User;
      })
    );

    return following.filter((f) => f !== null) as User[];
  } catch (error) {
    // console.error('Error fetching following:', error);
    throw error;
  }
};

// Search users and hashtags
export const search = async (searchQuery: string): Promise<SearchResult[]> => {
  try {
    const currentUserId = auth.currentUser?.uid;
    if (!currentUserId) throw new Error('Not authenticated');

    const results: SearchResult[] = [];

    // Search users by name or username
    // Note: Firestore doesn't support full-text search, so this is a simple prefix match
    // For production, consider using Algolia or Elasticsearch
    const usersQuery = query(
      collection(db, 'users'),
      where('username', '>=', searchQuery.toLowerCase()),
      where('username', '<=', searchQuery.toLowerCase() + '\uf8ff'),
      limit(10)
    );

    const usersSnapshot = await getDocs(usersQuery);

    for (const userDoc of usersSnapshot.docs) {
      const data = userDoc.data();

      // Check if current user is following this user
      const followQuery = query(
        collection(db, 'follows'),
        where('followerId', '==', currentUserId),
        where('followingId', '==', userDoc.id)
      );
      const followSnapshot = await getDocs(followQuery);
      const isFollowing = !followSnapshot.empty;

      results.push({
        id: userDoc.id,
        type: 'user',
        name: data.displayName,
        username: data.username,
        avatar: data.avatar,
        isVerified: data.isVerified,
        followersCount: data.followersCount,
        isFollowing,
      });
    }

    // Search hashtags
    // For hashtags, we'd need to maintain a separate collection of hashtags with post counts
    // This is a simplified version - implement hashtag collection for production

    return results;
  } catch (error) {
    // console.error('Error searching:', error);
    throw error;
  }
};

// Get suggested users (users you might want to follow)
export const getSuggestedUsers = async (): Promise<User[]> => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');

    // Simple algorithm: get users with high follower count that you're not following
    // For production, implement a more sophisticated recommendation algorithm

    // Get users current user is following
    const followingQuery = query(
      collection(db, 'follows'),
      where('followerId', '==', userId)
    );
    const followingSnapshot = await getDocs(followingQuery);
    const followingIds = followingSnapshot.docs.map((doc) => doc.data().followingId);
    followingIds.push(userId); // Don't suggest self

    // Get popular users (sorted by followers)
    const usersQuery = query(
      collection(db, 'users'),
      orderBy('followersCount', 'desc'),
      limit(20)
    );

    const usersSnapshot = await getDocs(usersQuery);

    const suggested: User[] = usersSnapshot.docs
      .filter((doc) => !followingIds.includes(doc.id))
      .slice(0, 10)
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          isFollowing: false,
        } as User;
      });

    return suggested;
  } catch (error) {
    // console.error('Error fetching suggested users:', error);
    throw error;
  }
};

// Get trending hashtags
export const getTrendingHashtags = async (): Promise<Array<{ name: string; count: number }>> => {
  try {
    // For production, maintain a separate 'hashtags' collection with post counts
    // This is a placeholder - implement hashtag tracking for production

    // Example structure:
    // const hashtagsQuery = query(
    //   collection(db, 'hashtags'),
    //   orderBy('postsCount', 'desc'),
    //   limit(10)
    // );
    // const snapshot = await getDocs(hashtagsQuery);
    // return snapshot.docs.map(doc => ({
    //   name: doc.data().name,
    //   count: doc.data().postsCount
    // }));

    return [];
  } catch (error) {
    // console.error('Error fetching trending hashtags:', error);
    throw error;
  }
};

// Get recent searches for current user
export const getRecentSearches = async (): Promise<SearchResult[]> => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');

    // For production, maintain a 'recentSearches' subcollection under users
    // This is a placeholder

    return [];
  } catch (error) {
    // console.error('Error fetching recent searches:', error);
    throw error;
  }
};

// Get user's favorite barbers
export const getUserFavorites = async (userId: string): Promise<string[]> => {
  try {
    const favoritesQuery = query(
      collection(db, 'favorites'),
      where('userId', '==', userId)
    );

    const snapshot = await getDocs(favoritesQuery);
    return snapshot.docs.map((doc) => doc.data().barberId);
  } catch (error) {
    // console.error('Error fetching user favorites:', error);
    return [];
  }
};

// Add barber to favorites
export const addFavorite = async (userId: string, barberId: string): Promise<void> => {
  try {
    await addDoc(collection(db, 'favorites'), {
      userId,
      barberId,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    // console.error('Error adding favorite:', error);
    throw new Error('Failed to add favorite');
  }
};

// Remove barber from favorites
export const removeFavorite = async (userId: string, barberId: string): Promise<void> => {
  try {
    const favoritesQuery = query(
      collection(db, 'favorites'),
      where('userId', '==', userId),
      where('barberId', '==', barberId)
    );

    const snapshot = await getDocs(favoritesQuery);

    // Delete all matching documents
    const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  } catch (error) {
    // console.error('Error removing favorite:', error);
    throw new Error('Failed to remove favorite');
  }
};

// Get user by ID (alias for getUserById)
export const getUser = getUserById;

// Update user profile
export const updateUser = async (userId: string, updates: Partial<User>): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    } as any);
  } catch (error) {
    // console.error('Error updating user:', error);
    throw new Error('Failed to update user');
  }
};
