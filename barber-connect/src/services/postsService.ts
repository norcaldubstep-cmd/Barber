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
  startAfter,
  Timestamp,
  increment,
  serverTimestamp,
  DocumentSnapshot,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from './firebase';

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  isVerified: boolean;
  imageUrls: string[];
  caption: string;
  hashtags: string[];
  location?: {
    name: string;
    lat: number;
    lng: number;
  };
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  savesCount: number;
  type: 'post' | 'promotion' | 'portfolio';
  createdAt: Date;
  updatedAt: Date;
  liked?: boolean;
  saved?: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  likesCount: number;
  createdAt: Date;
  parentCommentId?: string;
}

// Get feed posts (paginated)
export const getFeedPosts = async (lastDoc?: DocumentSnapshot, pageSize = 20): Promise<{ posts: Post[]; lastDoc: DocumentSnapshot | null }> => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');

    let q = query(
      collection(db, 'posts'),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    const posts: Post[] = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();

        // Check if user liked this post
        const likeDoc = await getDoc(doc(db, `posts/${docSnap.id}/likes/${userId}`));
        const liked = likeDoc.exists();

        // Check if user saved this post
        const savedDoc = await getDoc(doc(db, `savedPosts/${userId}/posts/${docSnap.id}`));
        const saved = savedDoc.exists();

        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          liked,
          saved,
        } as Post;
      })
    );

    return {
      posts,
      lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
    };
  } catch (error) {
    // console.error('Error fetching feed posts:', error);
    throw error;
  }
};

// Get single post by ID
export const getPostById = async (postId: string): Promise<Post | null> => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');

    const postDoc = await getDoc(doc(db, 'posts', postId));

    if (!postDoc.exists()) {
      return null;
    }

    const data = postDoc.data();

    // Check if user liked this post
    const likeDoc = await getDoc(doc(db, `posts/${postId}/likes/${userId}`));
    const liked = likeDoc.exists();

    // Check if user saved this post
    const savedDoc = await getDoc(doc(db, `savedPosts/${userId}/posts/${postId}`));
    const saved = savedDoc.exists();

    return {
      id: postDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
      liked,
      saved,
    } as Post;
  } catch (error) {
    // console.error('Error fetching post:', error);
    throw error;
  }
};

// Create a new post
export const createPost = async (
  images: string[],
  caption: string,
  hashtags: string[],
  location?: { name: string; lat: number; lng: number },
  type: 'post' | 'promotion' | 'portfolio' = 'post'
): Promise<string> => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');

    // Get user data
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userData = userDoc.data();

    if (!userData) throw new Error('User not found');

    // Upload images to Storage
    const imageUrls = await Promise.all(
      images.map(async (imageUri, index) => {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const filename = `posts/${userId}/${Date.now()}_${index}.jpg`;
        const storageRef = ref(storage, filename);
        await uploadBytes(storageRef, blob);
        return getDownloadURL(storageRef);
      })
    );

    // Create post document
    const postRef = await addDoc(collection(db, 'posts'), {
      authorId: userId,
      authorName: userData.displayName,
      authorAvatar: userData.avatar || '',
      isVerified: userData.isVerified || false,
      imageUrls,
      caption,
      hashtags,
      location: location || null,
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      savesCount: 0,
      type,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return postRef.id;
  } catch (error) {
    // console.error('Error creating post:', error);
    throw error;
  }
};

// Like/Unlike a post
export const toggleLike = async (postId: string, currentlyLiked: boolean): Promise<void> => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');

    const likeRef = doc(db, `posts/${postId}/likes/${userId}`);

    if (currentlyLiked) {
      // Unlike
      await deleteDoc(likeRef);
      await updateDoc(doc(db, 'posts', postId), {
        likesCount: increment(-1),
      });
    } else {
      // Like
      await addDoc(collection(db, `posts/${postId}/likes`), {
        userId,
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'posts', postId), {
        likesCount: increment(1),
      });
    }
  } catch (error) {
    // console.error('Error toggling like:', error);
    throw error;
  }
};

// Save/Unsave a post
export const toggleSave = async (postId: string, currentlySaved: boolean): Promise<void> => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');

    const saveRef = doc(db, `savedPosts/${userId}/posts/${postId}`);

    if (currentlySaved) {
      // Unsave
      await deleteDoc(saveRef);
      await updateDoc(doc(db, 'posts', postId), {
        savesCount: increment(-1),
      });
    } else {
      // Save
      await addDoc(collection(db, `savedPosts/${userId}/posts`), {
        postId,
        savedAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'posts', postId), {
        savesCount: increment(1),
      });
    }
  } catch (error) {
    // console.error('Error toggling save:', error);
    throw error;
  }
};

// Get comments for a post
export const getPostComments = async (postId: string): Promise<Comment[]> => {
  try {
    const q = query(
      collection(db, `posts/${postId}/comments`),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const comments: Comment[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        postId,
        ...data,
        createdAt: data.createdAt?.toDate(),
      } as Comment;
    });

    return comments;
  } catch (error) {
    // console.error('Error fetching comments:', error);
    throw error;
  }
};

// Add a comment to a post
export const addComment = async (postId: string, text: string): Promise<void> => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');

    const userDoc = await getDoc(doc(db, 'users', userId));
    const userData = userDoc.data();

    if (!userData) throw new Error('User not found');

    await addDoc(collection(db, `posts/${postId}/comments`), {
      postId,
      authorId: userId,
      authorName: userData.displayName,
      authorAvatar: userData.avatar || '',
      text,
      likesCount: 0,
      createdAt: serverTimestamp(),
    });

    // Cloud Function will handle incrementing commentsCount and creating notification
  } catch (error) {
    // console.error('Error adding comment:', error);
    throw error;
  }
};

// Get saved posts for current user
export const getSavedPosts = async (): Promise<Post[]> => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');

    const q = query(
      collection(db, `savedPosts/${userId}/posts`),
      orderBy('savedAt', 'desc')
    );

    const snapshot = await getDocs(q);

    // Get full post data for each saved post
    const posts: Post[] = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const savedPostData = docSnap.data();
        const postDoc = await getDoc(doc(db, 'posts', savedPostData.postId));

        if (!postDoc.exists()) return null;

        const data = postDoc.data();
        return {
          id: postDoc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          savedAt: savedPostData.savedAt?.toDate(),
          liked: false, // Could fetch like status here too
          saved: true,
        } as Post;
      })
    );

    return posts.filter((p) => p !== null) as Post[];
  } catch (error) {
    // console.error('Error fetching saved posts:', error);
    throw error;
  }
};

// Delete a post
export const deletePost = async (postId: string): Promise<void> => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');

    const postDoc = await getDoc(doc(db, 'posts', postId));
    const postData = postDoc.data();

    if (!postData || postData.authorId !== userId) {
      throw new Error('Unauthorized to delete this post');
    }

    await deleteDoc(doc(db, 'posts', postId));

    // Cloud Function will handle decrementing postsCount
  } catch (error) {
    // console.error('Error deleting post:', error);
    throw error;
  }
};
