import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../components/common/Avatar';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { colors, spacing, borderRadius, textStyles } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types/user.types';
import { getUser, updateUser } from '../../services/usersService';
import { getBarberProfile, updateBarberProfile } from '../../services/barberService';
import {
  pickImage as pickImageService,
  uploadImage,
  getProfileImagePath,
  getCoverPhotoPath,
} from '../../services/imageUploadService';

export const EditProfileScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const isBarber = user?.role === UserRole.BARBER;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [worksAt, setWorksAt] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState<'profile' | 'cover' | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    if (!user) {
      setIsLoadingProfile(false);
      return;
    }

    try {
      setIsLoadingProfile(true);

      if (isBarber) {
        // Load barber profile
        const barberProfile = await getBarberProfile(user.id);
        if (barberProfile) {
          setDisplayName(barberProfile.displayName || '');
          setBio(barberProfile.bio || '');
          setWorksAt(barberProfile.worksAt || '');
          setYearsExperience(barberProfile.yearsOfExperience?.toString() || '');
          setSelectedSpecialties(barberProfile.specialties || []);
          setAvatar(barberProfile.profileImage || null);
        }
      }

      // Load basic user info (both clients and barbers have this)
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');
      setPhoneNumber(user.phoneNumber || '');
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const SPECIALTIES = [
    'Fades', 'Tapers', 'Buzz Cuts', 'Crew Cuts', 'Undercuts',
    'Pompadours', 'Quiffs', 'Textured Crops', 'Side Parts', 'Slick Backs',
    'Man Buns', 'Long Hair', 'Beard Trims', 'Line Ups', 'Shaves',
  ];

  const pickProfileImage = async () => {
    const imageUri = await pickImageService({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (imageUri) {
      setAvatar(imageUri);
    }
  };

  const pickCoverImage = async () => {
    const imageUri = await pickImageService({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (imageUri) {
      setCoverPhoto(imageUri);
    }
  };

  const toggleSpecialty = (specialty: string) => {
    if (selectedSpecialties.includes(specialty)) {
      setSelectedSpecialties(selectedSpecialties.filter((s) => s !== specialty));
    } else {
      if (selectedSpecialties.length < 8) {
        setSelectedSpecialties([...selectedSpecialties, specialty]);
      } else {
        Alert.alert('Limit Reached', 'You can select up to 8 specialties');
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (phoneNumber && !/^\d{10}$/.test(phoneNumber.replace(/[^0-9]/g, ''))) {
      newErrors.phoneNumber = 'Phone number must be 10 digits';
    }

    if (isBarber) {
      if (!displayName.trim()) newErrors.displayName = 'Display name is required';
      if (bio.length > 500) newErrors.bio = 'Bio must be under 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!user) {
      Alert.alert('Error', 'Not logged in');
      return;
    }

    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before saving');
      return;
    }

    setIsSaving(true);
    try {
      let profileImageUrl = avatar;
      let coverPhotoUrl = coverPhoto;

      // Upload profile image if it's a local URI (not already uploaded)
      if (avatar && avatar.startsWith('file://')) {
        setUploadingImage('profile');
        const storagePath = getProfileImagePath(user.id);
        profileImageUrl = await uploadImage(avatar, storagePath);
      }

      // Upload cover photo if it's a local URI
      if (coverPhoto && coverPhoto.startsWith('file://')) {
        setUploadingImage('cover');
        const storagePath = getCoverPhotoPath(user.id);
        coverPhotoUrl = await uploadImage(coverPhoto, storagePath);
      }

      setUploadingImage(null);

      // Update basic user info (for both clients and barbers)
      await updateUser(user.id, {
        firstName,
        lastName,
        email,
        phoneNumber,
      });

      // Update barber-specific info
      if (isBarber) {
        await updateBarberProfile(user.id, {
          displayName,
          bio,
          worksAt,
          yearsOfExperience: yearsExperience ? parseInt(yearsExperience) : 0,
          specialties: selectedSpecialties,
          profileImage: profileImageUrl || undefined,
          // Note: coverPhoto field may need to be added to barber profile type
        });
      }

      Alert.alert('Success', 'Your profile has been updated!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
      setUploadingImage(null);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent.gold} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cover Photo Section (Barbers only) */}
        {isBarber && (
          <TouchableOpacity
            style={styles.coverPhotoContainer}
            onPress={pickCoverImage}
            activeOpacity={0.8}
          >
            {coverPhoto ? (
              <Image source={{ uri: coverPhoto }} style={styles.coverPhoto} />
            ) : (
              <View style={styles.coverPhotoPlaceholder}>
                <Ionicons name="image-outline" size={48} color={colors.text.secondary} />
                <Text style={styles.coverPhotoText}>Add Cover Photo</Text>
              </View>
            )}
            {uploadingImage === 'cover' && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator size="large" color={colors.accent.gold} />
                <Text style={styles.uploadingText}>Uploading...</Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {avatar ? (
              avatar.startsWith('http') ? (
                <Image source={{ uri: avatar }} style={styles.avatarImage} />
              ) : (
                <Image source={{ uri: avatar }} style={styles.avatarImage} />
              )
            ) : (
              <Avatar name={`${user?.firstName} ${user?.lastName}`} size="2xl" />
            )}
            <TouchableOpacity style={styles.editAvatarButton} onPress={pickProfileImage}>
              <LinearGradient colors={['#D4AF37', '#FFD700']} style={styles.editAvatarGradient}>
                {uploadingImage === 'profile' ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <Ionicons name="camera" size={20} color="#000" />
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
          <Text style={styles.changePhotoText}>Change Profile Photo</Text>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <Card style={styles.card}>
            <Input
              label="First Name"
              value={firstName}
              onChangeText={setFirstName}
              error={errors.firstName}
              required
              icon="person-outline"
            />
            <Input
              label="Last Name"
              value={lastName}
              onChangeText={setLastName}
              error={errors.lastName}
              required
              icon="person-outline"
            />
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
              required
              keyboardType="email-address"
              autoCapitalize="none"
              icon="mail-outline"
            />
            <Input
              label="Phone Number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              error={errors.phoneNumber}
              keyboardType="phone-pad"
              icon="call-outline"
              helperText="Used for booking confirmations"
            />
          </Card>
        </View>

        {/* Barber Information */}
        {isBarber && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Professional Information</Text>
              <Card style={styles.card}>
                <Input
                  label="Display Name"
                  value={displayName}
                  onChangeText={setDisplayName}
                  error={errors.displayName}
                  required
                  icon="cut"
                  helperText="This is how clients will see you"
                />
                <Input
                  label="Works At"
                  value={worksAt}
                  onChangeText={setWorksAt}
                  icon="business-outline"
                  helperText="Barbershop or salon name"
                />
                <Input
                  label="Years of Experience"
                  value={yearsExperience}
                  onChangeText={setYearsExperience}
                  keyboardType="numeric"
                  icon="ribbon-outline"
                />
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Bio</Text>
                  <Input
                    value={bio}
                    onChangeText={setBio}
                    error={errors.bio}
                    multiline
                    numberOfLines={4}
                    maxLength={500}
                    helperText={`${bio.length}/500 characters`}
                    placeholder="Tell clients about your experience and style..."
                  />
                </View>
              </Card>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Specialties ({selectedSpecialties.length}/8)
              </Text>
              <Card style={styles.card}>
                <View style={styles.specialtiesGrid}>
                  {SPECIALTIES.map((specialty) => (
                    <TouchableOpacity
                      key={specialty}
                      onPress={() => toggleSpecialty(specialty)}
                      activeOpacity={0.7}
                    >
                      <LinearGradient
                        colors={
                          selectedSpecialties.includes(specialty)
                            ? ['#D4AF37', '#FFD700']
                            : [colors.background.secondary, colors.background.secondary]
                        }
                        style={styles.specialtyChip}
                      >
                        <Text
                          style={[
                            styles.specialtyText,
                            selectedSpecialties.includes(specialty) && styles.specialtyTextActive,
                          ]}
                        >
                          {specialty}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </View>
              </Card>
            </View>
          </>
        )}

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <Card style={styles.card}>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => console.log('Change password')}
            >
              <View style={styles.actionLeft}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.text.primary} />
                <Text style={styles.actionText}>Change Password</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
            </TouchableOpacity>

            <View style={styles.actionDivider} />

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => console.log('Delete account')}
            >
              <View style={styles.actionLeft}>
                <Ionicons name="trash-outline" size={20} color={colors.error} />
                <Text style={[styles.actionText, { color: colors.error }]}>Delete Account</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          </Card>
        </View>

        <View style={{ height: spacing['4xl'] }} />
      </ScrollView>

      {/* Save Button */}
      <View style={styles.bottomBar}>
        {uploadingImage ? (
          <View style={styles.uploadProgressContainer}>
            <ActivityIndicator size="small" color={colors.accent.gold} />
            <Text style={styles.uploadProgressText}>
              Uploading {uploadingImage === 'profile' ? 'profile photo' : 'cover photo'}...
            </Text>
          </View>
        ) : (
          <Button
            title="Save Changes"
            onPress={handleSave}
            variant="gradient"
            size="large"
            fullWidth
            isLoading={isSaving}
            icon="checkmark"
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    ...textStyles.body,
    color: colors.text.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...textStyles.h2, fontWeight: '700' },
  coverPhotoContainer: {
    width: '100%',
    height: 200,
    backgroundColor: colors.background.secondary,
    position: 'relative',
  },
  coverPhoto: {
    width: '100%',
    height: '100%',
  },
  coverPhotoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  coverPhotoText: {
    ...textStyles.body,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  uploadingText: {
    ...textStyles.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  avatarSection: { alignItems: 'center', padding: spacing.xl },
  avatarContainer: { position: 'relative', marginBottom: spacing.md },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.background.secondary,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  editAvatarGradient: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.background.primary,
  },
  changePhotoText: { ...textStyles.bodySmall, color: colors.accent.gold, fontWeight: '600' },
  section: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  sectionTitle: { ...textStyles.h3, fontWeight: '700', marginBottom: spacing.md },
  card: { padding: spacing.lg, gap: spacing.md },
  inputGroup: { gap: spacing.xs },
  inputLabel: { ...textStyles.body, fontWeight: '600', marginBottom: spacing.xs },
  specialtiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  specialtyChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  specialtyText: { ...textStyles.bodySmall, fontWeight: '600', color: colors.text.primary },
  specialtyTextActive: { color: '#000', fontWeight: '700' },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  actionLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  actionText: { ...textStyles.body, fontWeight: '600' },
  actionDivider: { height: 1, backgroundColor: colors.border.light },
  bottomBar: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    backgroundColor: colors.background.card,
  },
  uploadProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  uploadProgressText: {
    ...textStyles.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
});
