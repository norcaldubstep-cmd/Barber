import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithCredential,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User, UserRole } from '../types/user.types';

/**
 * Authentication Service
 * Handles all Firebase Authentication operations
 */

// Sign up with email and password
export const signUp = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  role: UserRole = UserRole.CLIENT,
  isBusinessOwner: boolean = false
): Promise<User> => {
  try {
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Update display name
    await updateProfile(firebaseUser, {
      displayName: `${firstName} ${lastName}`,
    });

    // Send email verification
    await sendEmailVerification(firebaseUser);

    // Create user document in Firestore
    const userData: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email!,
      firstName,
      lastName,
      role,
      isBusinessOwner,
      emailVerified: firebaseUser.emailVerified,
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), {
      ...userData,
      createdAt: serverTimestamp(),
    });

    // If user is a barber, create barber profile
    if (role === UserRole.BARBER) {
      await createBarberProfile(firebaseUser.uid, firstName, lastName);
    }

    return userData;
  } catch (error: any) {
    console.error('Sign up error:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

// Sign in with email and password
export const signIn = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

    if (!userDoc.exists()) {
      throw new Error('User data not found');
    }

    const userData = userDoc.data() as User;

    // Update email verification status if changed
    if (userData.emailVerified !== firebaseUser.emailVerified) {
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        emailVerified: firebaseUser.emailVerified,
      });
      userData.emailVerified = firebaseUser.emailVerified;
    }

    return userData;
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

// Sign out
export const logOut = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Sign out error:', error);
    throw new Error('Failed to sign out');
  }
};

// Send password reset email
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error('Password reset error:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

// Resend email verification
export const resendVerificationEmail = async (): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('No user is currently signed in');
    }
    await sendEmailVerification(currentUser);
  } catch (error: any) {
    console.error('Resend verification error:', error);
    throw new Error('Failed to send verification email');
  }
};

// Get current user data
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return null;

    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

    if (!userDoc.exists()) {
      return null;
    }

    return userDoc.data() as User;
  } catch (error: any) {
    console.error('Get current user error:', error);
    return null;
  }
};

// Update user profile
export const updateUserProfile = async (
  userId: string,
  updates: Partial<User>
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, updates);

    // Update Firebase Auth profile if name changed
    if (updates.firstName || updates.lastName) {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await updateProfile(currentUser, {
          displayName: `${updates.firstName || ''} ${updates.lastName || ''}`.trim(),
        });
      }
    }
  } catch (error: any) {
    console.error('Update profile error:', error);
    throw new Error('Failed to update profile');
  }
};

// Sign in with Google (for React Native - requires additional setup)
export const signInWithGoogle = async (idToken: string): Promise<User> => {
  try {
    const credential = GoogleAuthProvider.credential(idToken);
    const userCredential = await signInWithCredential(auth, credential);
    const firebaseUser = userCredential.user;

    // Check if user already exists
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

    if (userDoc.exists()) {
      return userDoc.data() as User;
    }

    // Create new user if doesn't exist
    const names = firebaseUser.displayName?.split(' ') || ['', ''];
    const userData: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email!,
      firstName: names[0],
      lastName: names.slice(1).join(' '),
      role: UserRole.CLIENT,
      isBusinessOwner: false,
      profileImageUrl: firebaseUser.photoURL || undefined,
      emailVerified: firebaseUser.emailVerified,
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), {
      ...userData,
      createdAt: serverTimestamp(),
    });

    return userData;
  } catch (error: any) {
    console.error('Google sign in error:', error);
    throw new Error('Failed to sign in with Google');
  }
};

// Helper: Create barber profile when user signs up as barber
const createBarberProfile = async (
  userId: string,
  firstName: string,
  lastName: string
): Promise<void> => {
  const barberProfileData = {
    id: userId,
    userId,
    displayName: `${firstName} ${lastName}`,
    firstName,
    lastName,
    specialties: [],
    yearsOfExperience: 0,
    certifications: [],
    location: {
      address: '',
      city: '',
      state: '',
      country: '',
      latitude: 0,
      longitude: 0,
    },
    followersCount: 0,
    followingCount: 0,
    postsCount: 0,
    rating: 0,
    totalReviews: 0,
    totalClients: 0,
    services: [],
    isAvailable: true,
    acceptsWalkIns: false,
    instantBooking: false,
    isVerified: false,
    promotionTier: 'FREE',
    joinedDate: new Date().toISOString(),
    portfolioImages: [],
    featuredWork: [],
    responseTime: 'Within 24 hours',
    responseRate: 0,
    createdAt: serverTimestamp(),
  };

  await setDoc(doc(db, 'barbers', userId), barberProfileData);
};

// Helper: Convert Firebase error codes to user-friendly messages
const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'This email is already registered';
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/operation-not-allowed':
      return 'Operation not allowed';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters';
    case 'auth/user-disabled':
      return 'This account has been disabled';
    case 'auth/user-not-found':
      return 'No account found with this email';
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/invalid-credential':
      return 'Invalid email or password';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection';
    default:
      return 'An error occurred. Please try again';
  }
};

// Change password (requires re-authentication)
export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) {
      throw new Error('No user is currently signed in');
    }

    // Re-authenticate user before changing password
    const credential = EmailAuthProvider.credential(
      currentUser.email,
      currentPassword
    );
    await reauthenticateWithCredential(currentUser, credential);

    // Update password
    await updatePassword(currentUser, newPassword);
  } catch (error: any) {
    console.error('Change password error:', error);
    if (error.code === 'auth/wrong-password') {
      throw new Error('Current password is incorrect');
    }
    throw new Error(getAuthErrorMessage(error.code));
  }
};

// Listen to auth state changes
export const onAuthStateChanged = (callback: (user: FirebaseUser | null) => void) => {
  return auth.onAuthStateChanged(callback);
};
