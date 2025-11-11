import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { colors, spacing, borderRadius, textStyles } from '../../theme';
import { Service } from '../../types/barber.types';
import { useAuthStore } from '../../store/authStore';
import {
  getBarberServices,
  addBarberService,
  updateBarberService,
  deleteBarberService,
} from '../../services/barberService';

export const ServicesScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [isPopular, setIsPopular] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'User not found');
      return;
    }

    try {
      setLoading(true);
      const fetchedServices = await getBarberServices(user.id);
      setServices(fetchedServices);
    } catch (err) {
      console.error('Load services error:', err);
      Alert.alert('Error', 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    setName(service.name);
    setDescription(service.description || '');
    setPrice(service.price.toString());
    setDuration(service.duration.toString());
    setIsPopular(service.isPopular || false);
    setIsActive(service.isActive);
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingService(null);
    setName('');
    setDescription('');
    setPrice('');
    setDuration('');
    setIsPopular(false);
    setIsActive(true);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingService(null);
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Service name is required';
    if (!price.trim()) newErrors.price = 'Price is required';
    else if (isNaN(Number(price)) || Number(price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }
    if (!duration.trim()) newErrors.duration = 'Duration is required';
    else if (isNaN(Number(duration)) || Number(duration) <= 0) {
      newErrors.duration = 'Duration must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before saving');
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'User not found');
      return;
    }

    try {
      setSaving(true);

      const serviceData = {
        name,
        description: description || undefined,
        price: Number(price),
        duration: Number(duration),
        isPopular,
        isActive,
      };

      if (editingService) {
        // Update existing
        await updateBarberService(user.id, editingService.id, serviceData);
        Alert.alert('Success', 'Service updated successfully');
      } else {
        // Create new
        await addBarberService(user.id, serviceData);
        Alert.alert('Success', 'Service created successfully');
      }

      closeModal();
      await loadServices(); // Reload services
    } catch (err) {
      console.error('Save service error:', err);
      Alert.alert('Error', 'Failed to save service');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (service: Service) => {
    if (!user?.id) {
      Alert.alert('Error', 'User not found');
      return;
    }

    Alert.alert(
      'Delete Service',
      `Are you sure you want to delete "${service.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBarberService(user.id, service.id);
              Alert.alert('Deleted', 'Service removed successfully');
              await loadServices(); // Reload services
            } catch (err) {
              console.error('Delete service error:', err);
              Alert.alert('Error', 'Failed to delete service');
            }
          },
        },
      ]
    );
  };

  const toggleActive = async (service: Service) => {
    if (!user?.id) {
      Alert.alert('Error', 'User not found');
      return;
    }

    try {
      await updateBarberService(user.id, service.id, { isActive: !service.isActive });
      await loadServices(); // Reload services
    } catch (err) {
      console.error('Toggle active error:', err);
      Alert.alert('Error', 'Failed to update service status');
    }
  };

  const activeServices = services.filter((s) => s.isActive);
  const inactiveServices = services.filter((s) => !s.isActive);

  const renderService = (service: Service) => (
    <Card key={service.id} style={styles.serviceCard}>
      <View style={styles.serviceHeader}>
        <View style={styles.serviceInfo}>
          <View style={styles.serviceNameRow}>
            <Text style={styles.serviceName}>{service.name}</Text>
            {service.isPopular && (
              <View style={styles.popularBadge}>
                <Ionicons name="star" size={12} color={colors.accent.gold} />
                <Text style={styles.popularText}>Popular</Text>
              </View>
            )}
          </View>
          {service.description && (
            <Text style={styles.serviceDescription}>{service.description}</Text>
          )}
          <View style={styles.serviceMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="cash-outline" size={16} color={colors.accent.gold} />
              <Text style={styles.metaText}>${service.price}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color={colors.accent.blue} />
              <Text style={styles.metaText}>{service.duration} min</Text>
            </View>
          </View>
        </View>

        <View style={styles.serviceActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => openEditModal(service)}
          >
            <Ionicons name="create-outline" size={20} color={colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => toggleActive(service)}
          >
            <Ionicons
              name={service.isActive ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={service.isActive ? colors.success : colors.text.secondary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDelete(service)}
          >
            <Ionicons name="trash-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Services</Text>
        <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
          <Ionicons name="add-circle" size={28} color={colors.accent.gold} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent.gold} />
          <Text style={styles.loadingText}>Loading services...</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Stats */}
          <Card style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{activeServices.length}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{inactiveServices.length}</Text>
              <Text style={styles.statLabel}>Inactive</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                $
                {activeServices.reduce((sum, s) => sum + s.price, 0) /
                  (activeServices.length || 1)}
              </Text>
              <Text style={styles.statLabel}>Avg Price</Text>
            </View>
          </View>
        </Card>

        {/* Active Services */}
        {activeServices.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Services ({activeServices.length})</Text>
            {activeServices.map(renderService)}
          </View>
        )}

        {/* Inactive Services */}
        {inactiveServices.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Inactive Services ({inactiveServices.length})</Text>
            {inactiveServices.map(renderService)}
          </View>
        )}

        {services.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="cut-outline" size={64} color={colors.text.secondary} />
            <Text style={styles.emptyTitle}>No services yet</Text>
            <Text style={styles.emptySubtitle}>
              Add your first service to start accepting bookings
            </Text>
          </View>
        )}

          <View style={{ height: spacing['4xl'] }} />
        </ScrollView>
      )}

      {/* Add/Edit Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeModal}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingService ? 'Edit Service' : 'New Service'}
            </Text>
            <View style={{ width: 60 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            <Input
              label="Service Name"
              value={name}
              onChangeText={setName}
              error={errors.name}
              required
              placeholder="e.g., Premium Fade"
            />

            <Input
              label="Description"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              placeholder="Describe what's included..."
            />

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Input
                  label="Price ($)"
                  value={price}
                  onChangeText={setPrice}
                  error={errors.price}
                  required
                  keyboardType="numeric"
                  placeholder="65"
                />
              </View>
              <View style={styles.halfWidth}>
                <Input
                  label="Duration (min)"
                  value={duration}
                  onChangeText={setDuration}
                  error={errors.duration}
                  required
                  keyboardType="numeric"
                  placeholder="45"
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() => setIsPopular(!isPopular)}
            >
              <View style={styles.toggleLeft}>
                <Ionicons name="star" size={20} color={colors.accent.gold} />
                <View>
                  <Text style={styles.toggleLabel}>Mark as Popular</Text>
                  <Text style={styles.toggleDescription}>
                    Shows a "Popular" badge to clients
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.toggle,
                  isPopular ? styles.toggleActive : styles.toggleInactive,
                ]}
              >
                <View style={styles.toggleKnob} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() => setIsActive(!isActive)}
            >
              <View style={styles.toggleLeft}>
                <Ionicons
                  name={isActive ? 'eye' : 'eye-off'}
                  size={20}
                  color={isActive ? colors.success : colors.text.secondary}
                />
                <View>
                  <Text style={styles.toggleLabel}>Service Active</Text>
                  <Text style={styles.toggleDescription}>
                    {isActive ? 'Visible to clients' : 'Hidden from clients'}
                  </Text>
                </View>
              </View>
              <View
                style={[styles.toggle, isActive ? styles.toggleActive : styles.toggleInactive]}
              >
                <View style={styles.toggleKnob} />
              </View>
            </TouchableOpacity>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button
              title={editingService ? 'Update Service' : 'Create Service'}
              onPress={handleSave}
              variant="gradient"
              size="large"
              fullWidth
              icon="checkmark"
              disabled={saving}
              loading={saving}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
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
  addButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['3xl'],
  },
  loadingText: {
    ...textStyles.body,
    color: colors.text.secondary,
    marginTop: spacing.lg,
  },
  statsCard: { margin: spacing.lg, padding: spacing.lg },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statValue: { ...textStyles.h2, fontWeight: '700', color: colors.accent.gold },
  statLabel: { ...textStyles.caption, color: colors.text.secondary, marginTop: spacing.xs },
  statDivider: { width: 1, height: 40, backgroundColor: colors.border.light },
  section: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  sectionTitle: { ...textStyles.h3, fontWeight: '700', marginBottom: spacing.md },
  serviceCard: { padding: spacing.lg, marginBottom: spacing.md },
  serviceHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  serviceInfo: { flex: 1, marginRight: spacing.md },
  serviceNameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  serviceName: { ...textStyles.body, fontWeight: '700' },
  popularBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.accent.gold + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  popularText: { fontSize: 10, fontWeight: '700', color: colors.accent.gold },
  serviceDescription: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  serviceMeta: { flexDirection: 'row', gap: spacing.lg },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  metaText: { ...textStyles.bodySmall, fontWeight: '600' },
  serviceActions: { gap: spacing.sm },
  actionButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
  },
  emptyState: { alignItems: 'center', padding: spacing['3xl'], marginTop: spacing['4xl'] },
  emptyTitle: { ...textStyles.h3, fontWeight: '700', marginTop: spacing.lg },
  emptySubtitle: {
    ...textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  modalContainer: { flex: 1, backgroundColor: colors.background.primary },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  modalCancel: { ...textStyles.body, color: colors.text.secondary },
  modalTitle: { ...textStyles.h3, fontWeight: '700' },
  modalContent: { flex: 1, padding: spacing.lg },
  row: { flexDirection: 'row', gap: spacing.md },
  halfWidth: { flex: 1 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  toggleLabel: { ...textStyles.body, fontWeight: '600', marginBottom: 2 },
  toggleDescription: { ...textStyles.caption, color: colors.text.secondary },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: { backgroundColor: colors.accent.gold, alignItems: 'flex-end' },
  toggleInactive: { backgroundColor: colors.border.medium, alignItems: 'flex-start' },
  toggleKnob: {
    width: 26,
    height: 26,
    borderRadius: borderRadius.full,
    backgroundColor: '#FFF',
  },
  modalFooter: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
});
