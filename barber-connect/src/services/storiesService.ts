import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  arrayUnion,
  increment,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';
import { Story, StoryGroup } from '../types/story.types';

/**
 * Stories Service
 * Handles temporary story content (24-hour expiry)
 */

// Create a new story
export const createStory = async (
  userId: string,
  userName: string,
  mediaUri: string,
  mediaType: 'image' | 'video',
  duration: number = 5,
  caption?: string,
  userAvatar?: string
): Promise<Story> => {
  try {
    // Upload media to storage
    const response = await fetch(mediaUri);
    const blob = await response.blob();
    const filename = `stories/${userId}/${Date.now()}.${mediaType === 'video' ? 'mp4' : 'jpg'}`;
    const storageRef = ref(storage, filename);

    await uploadBytes(storageRef, blob);
    const mediaUrl = await getDownloadURL(storageRef);

    // Create story document
    const storyRef = doc(collection(db, 'stories'));
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

    const storyData: Story = {
      id: storyRef.id,
      userId,
      userName,
      userAvatar,
      mediaUrl,
      mediaType,
      duration,
      caption,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      viewCount: 0,
      views: [],
    };

    await setDoc(storyRef, {
      ...storyData,
      createdAt: serverTimestamp(),
    });

    return storyData;
  } catch (error) {
    // console.error('Create story error:', error);
    throw new Error('Failed to create story');
  }
};

// Get user's own stories
export const getUserStories = async (userId: string): Promise<Story[]> => {
  try {
    const now = new Date().toISOString();

    const storiesQuery = query(
      collection(db, 'stories'),
      where('userId', '==', userId),
      where('expiresAt', '>', now),
      orderBy('expiresAt', 'desc'),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(storiesQuery);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Story));
  } catch (error) {
    // console.error('Get user stories error:', error);
    return [];
  }
};

// Get stories from followed users
export const getFeedStories = async (
  currentUserId: string,
  followingIds: string[]
): Promise<StoryGroup[]> => {
  try {
    const now = new Date().toISOString();

    // Include current user's stories
    const allUserIds = [currentUserId, ...followingIds];

    if (allUserIds.length === 0) {
      return [];
    }

    // Firestore has a limit of 10 items in 'in' queries, so batch if needed
    const batchSize = 10;
    const batches: Story[][] = [];

    for (let i = 0; i < allUserIds.length; i += batchSize) {
      const batch = allUserIds.slice(i, i + batchSize);

      const storiesQuery = query(
        collection(db, 'stories'),
        where('userId', 'in', batch),
        where('expiresAt', '>', now),
        orderBy('expiresAt', 'desc'),
        orderBy('createdAt', 'desc'),
        limit(100)
      );

      const snapshot = await getDocs(storiesQuery);
      const stories = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Story));
      batches.push(stories);
    }

    const allStories = batches.flat();

    // Group stories by user
    const storyGroups: { [userId: string]: StoryGroup } = {};

    allStories.forEach((story) => {
      if (!storyGroups[story.userId]) {
        storyGroups[story.userId] = {
          userId: story.userId,
          userName: story.userName,
          userAvatar: story.userAvatar,
          stories: [],
          hasUnviewed: false,
          latestStoryTime: story.createdAt,
        };
      }

      storyGroups[story.userId].stories.push(story);

      // Check if user has viewed this story
      if (!story.views.includes(currentUserId)) {
        storyGroups[story.userId].hasUnviewed = true;
      }

      // Update latest story time
      if (story.createdAt > storyGroups[story.userId].latestStoryTime) {
        storyGroups[story.userId].latestStoryTime = story.createdAt;
      }
    });

    // Convert to array and sort (current user first, then unviewed, then by time)
    const groups = Object.values(storyGroups).sort((a, b) => {
      if (a.userId === currentUserId) return -1;
      if (b.userId === currentUserId) return 1;
      if (a.hasUnviewed && !b.hasUnviewed) return -1;
      if (!a.hasUnviewed && b.hasUnviewed) return 1;
      return new Date(b.latestStoryTime).getTime() - new Date(a.latestStoryTime).getTime();
    });

    return groups;
  } catch (error) {
    // console.error('Get feed stories error:', error);
    return [];
  }
};

// Mark story as viewed
export const viewStory = async (storyId: string, viewerId: string): Promise<void> => {
  try {
    const storyRef = doc(db, 'stories', storyId);
    const storyDoc = await getDoc(storyRef);

    if (!storyDoc.exists()) {
      return;
    }

    const story = storyDoc.data() as Story;

    // Don't count multiple views from same user
    if (!story.views.includes(viewerId)) {
      await updateDoc(storyRef, {
        views: arrayUnion(viewerId),
        viewCount: increment(1),
      });
    }
  } catch (error) {
    // console.error('View story error:', error);
  }
};

// Get story viewers
export const getStoryViewers = async (storyId: string): Promise<string[]> => {
  try {
    const storyDoc = await getDoc(doc(db, 'stories', storyId));

    if (!storyDoc.exists()) {
      return [];
    }

    const story = storyDoc.data() as Story;
    return story.views || [];
  } catch (error) {
    // console.error('Get story viewers error:', error);
    return [];
  }
};

// Delete story
export const deleteStory = async (storyId: string, userId: string): Promise<void> => {
  try {
    const storyDoc = await getDoc(doc(db, 'stories', storyId));

    if (!storyDoc.exists()) {
      throw new Error('Story not found');
    }

    const story = storyDoc.data() as Story;

    // Verify ownership
    if (story.userId !== userId) {
      throw new Error('Not authorized to delete this story');
    }

    // Delete media from storage
    const mediaRef = ref(storage, story.mediaUrl);
    await deleteObject(mediaRef);

    // Delete story document
    await deleteDoc(doc(db, 'stories', storyId));
  } catch (error) {
    // console.error('Delete story error:', error);
    throw new Error('Failed to delete story');
  }
};

// Clean up expired stories (this should be called periodically or via Cloud Function)
export const cleanupExpiredStories = async (): Promise<number> => {
  try {
    const now = new Date().toISOString();

    const expiredQuery = query(
      collection(db, 'stories'),
      where('expiresAt', '<=', now),
      limit(100)
    );

    const snapshot = await getDocs(expiredQuery);

    // Delete stories and their media
    const deletePromises = snapshot.docs.map(async (doc) => {
      const story = doc.data() as Story;

      try {
        // Delete media from storage
        const mediaRef = ref(storage, story.mediaUrl);
        await deleteObject(mediaRef);
      } catch (error) {
        // console.error('Error deleting story media:', error);
      }

      // Delete document
      await deleteDoc(doc.ref);
    });

    await Promise.all(deletePromises);

    return snapshot.docs.length;
  } catch (error) {
    // console.error('Cleanup expired stories error:', error);
    return 0;
  }
};
