import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';
import { Alert } from 'react-native';

// Image picker options interface
export interface ImagePickerOptions {
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
  mediaTypes?: ImagePicker.MediaTypeOptions;
}

// Image result interface
export interface ImageResult {
  uri: string;
  width?: number;
  height?: number;
  cancelled: boolean;
}

/**
 * Pick a single image from the library or camera
 * @param options Image picker options
 * @returns Selected image URI or null if cancelled
 */
export const pickImage = async (
  options: ImagePickerOptions = {}
): Promise<string | null> => {
  try {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'We need access to your photos to upload images.'
      );
      return null;
    }

    // Default options with compression
    const defaultOptions: ImagePicker.ImagePickerOptions = {
      mediaTypes: options.mediaTypes || ImagePicker.MediaTypeOptions.Images,
      allowsEditing: options.allowsEditing !== undefined ? options.allowsEditing : true,
      aspect: options.aspect || [1, 1],
      quality: options.quality || 0.8,
    };

    const result = await ImagePicker.launchImageLibraryAsync(defaultOptions);

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets[0].uri;
    }

    return null;
  } catch (error) {
    console.error('Error picking image:', error);
    Alert.alert('Error', 'Failed to pick image. Please try again.');
    return null;
  }
};

/**
 * Pick multiple images from the library
 * @param multiple Allow multiple selection
 * @param maxImages Maximum number of images to select
 * @returns Array of selected image URIs
 */
export const pickImages = async (
  multiple: boolean = true,
  maxImages: number = 10
): Promise<string[]> => {
  try {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'We need access to your photos to upload images.'
      );
      return [];
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: multiple,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      // Limit to maxImages
      const images = result.assets.slice(0, maxImages).map((asset) => asset.uri);
      return images;
    }

    return [];
  } catch (error) {
    console.error('Error picking images:', error);
    Alert.alert('Error', 'Failed to pick images. Please try again.');
    return [];
  }
};

/**
 * Take a photo with the camera
 * @param options Camera options
 * @returns Captured photo URI or null if cancelled
 */
export const takePhoto = async (
  options: ImagePickerOptions = {}
): Promise<string | null> => {
  try {
    // Request camera permissions
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'We need access to your camera to take photos.'
      );
      return null;
    }

    const defaultOptions: ImagePicker.ImagePickerOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: options.allowsEditing !== undefined ? options.allowsEditing : true,
      aspect: options.aspect || [1, 1],
      quality: options.quality || 0.8,
    };

    const result = await ImagePicker.launchCameraAsync(defaultOptions);

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets[0].uri;
    }

    return null;
  } catch (error) {
    console.error('Error taking photo:', error);
    Alert.alert('Error', 'Failed to take photo. Please try again.');
    return null;
  }
};

/**
 * Upload a single image to Firebase Storage
 * @param uri Local image URI
 * @param path Firebase Storage path (e.g., 'users/{userId}/profile')
 * @returns Download URL of the uploaded image
 */
export const uploadImage = async (
  uri: string,
  path: string
): Promise<string> => {
  try {
    // Generate unique filename with timestamp
    const filename = `${Date.now()}.jpg`;
    const fullPath = `${path}/${filename}`;

    // Create storage reference
    const storageRef = ref(storage, fullPath);

    // Fetch the image as blob
    const response = await fetch(uri);
    const blob = await response.blob();

    // Upload the blob
    await uploadBytes(storageRef, blob);

    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
};

/**
 * Upload multiple images to Firebase Storage
 * @param uris Array of local image URIs
 * @param basePath Base Firebase Storage path
 * @param onProgress Optional progress callback (current, total)
 * @returns Array of download URLs
 */
export const uploadImages = async (
  uris: string[],
  basePath: string,
  onProgress?: (current: number, total: number) => void
): Promise<string[]> => {
  try {
    const downloadURLs: string[] = [];

    for (let i = 0; i < uris.length; i++) {
      const uri = uris[i];

      // Upload image
      const downloadURL = await uploadImage(uri, basePath);
      downloadURLs.push(downloadURL);

      // Call progress callback if provided
      if (onProgress) {
        onProgress(i + 1, uris.length);
      }
    }

    return downloadURLs;
  } catch (error) {
    console.error('Error uploading images:', error);
    throw new Error('Failed to upload images');
  }
};

/**
 * Delete an image from Firebase Storage
 * @param url Firebase Storage download URL
 */
export const deleteImage = async (url: string): Promise<void> => {
  try {
    // Extract path from URL
    // Firebase Storage URLs format: https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}?...
    const urlParts = url.split('/o/');
    if (urlParts.length < 2) {
      throw new Error('Invalid Firebase Storage URL');
    }

    const pathWithParams = urlParts[1];
    const path = decodeURIComponent(pathWithParams.split('?')[0]);

    // Create storage reference and delete
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new Error('Failed to delete image');
  }
};

/**
 * Compress and resize image before upload
 * Note: This uses the quality parameter in expo-image-picker
 * For more advanced compression, consider using expo-image-manipulator
 */
export const compressImage = async (
  uri: string,
  maxWidth: number = 2048,
  maxHeight: number = 2048,
  quality: number = 0.8
): Promise<string> => {
  // For basic compression, we rely on the quality parameter in image picker
  // If you need advanced compression, install expo-image-manipulator:
  // npm install expo-image-manipulator
  //
  // Then use:
  // import * as ImageManipulator from 'expo-image-manipulator';
  // const result = await ImageManipulator.manipulateAsync(
  //   uri,
  //   [{ resize: { width: maxWidth, height: maxHeight } }],
  //   { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
  // );
  // return result.uri;

  return uri; // Return original URI (compression handled by picker quality)
};

// Storage path helpers
export const getProfileImagePath = (userId: string): string =>
  `users/${userId}/profile`;

export const getPostImagesPath = (userId: string): string =>
  `users/${userId}/posts`;

export const getPortfolioImagesPath = (userId: string): string =>
  `users/${userId}/portfolio`;

export const getCoverPhotoPath = (userId: string): string =>
  `users/${userId}/cover`;
