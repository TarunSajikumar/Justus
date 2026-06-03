import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import { COLORS } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';

// ============ Types ============
interface PlanFeature {
  label: string;
  free: boolean | string;
  pro: boolean | string;
  tooltip?: string;
}

interface Plan {
  id: 'monthly' | 'yearly';
  label: string;
  price: number;
  period: string;
  badge: string | null;
  savings?: string;
}

// ============ Constants ============
const FEATURES: PlanFeature[] = [
  { label: 'Private Chat', free: true, pro: true },
  { label: 'Photo Gallery', free: '50 photos', pro: 'Unlimited', tooltip: 'Store all your memories' },
  { label: 'Timeline Events', free: '20 events', pro: 'Unlimited', tooltip: 'Never miss a milestone' },
  { label: 'Secret Vault Notes', free: '10 notes', pro: 'Unlimited', tooltip: 'Keep your secrets safe' },
  { label: 'Themes & Colours', free: '1 theme', pro: '12 themes', tooltip: 'Personalize your app' },
  { label: 'Anniversary Reminders', free: true, pro: true },
  { label: 'Miss You Pings', free: '3/day', pro: 'Unlimited', tooltip: 'Stay connected always' },
  { label: 'Relationship Insights', free: false, pro: true, tooltip: 'Deepen your connection' },
  { label: 'Custom Couple Avatar', free: false, pro: true, tooltip: 'Create your unique couple avatar' },
  { label: 'Priority Support', free: false, pro: true, tooltip: 'Get help faster' },
  { label: 'Export Memories', free: false, pro: true, tooltip: 'Download your cherished moments' },
  { label: 'Ad-Free Experience', free: false, pro: true, tooltip: 'No interruptions' },
];

const PLANS: Plan[] = [
  {
    id: 'monthly',
    label: 'Monthly',
    price: 4.99,
    period: '/month',
    badge: null,
  },
  {
    id: 'yearly',
    label: 'Yearly',
    price: 29.99,
    period: '/year',
    badge: 'Save 50%',
    savings: 'Save $29.89',
  },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============ Sub-components ============
const FeatureRow = React.memo(({ feature }: { feature: PlanFeature }) => {
  const renderCell = (value: boolean | string, isPro: boolean) => {
    if (value === false) {
      return <FontAwesome name="times" size={14} color="#444" />;
    }
    if (value === true) {
      return <FontAwesome name="check" size={14} color={isPro ? COLORS.primary : COLORS.success} />;
    }
    return (
      <Text style={[styles.featureCellText, isPro && { color: COLORS.primary }]}>
        {value}
      </Text>
    );
  };

  return (
    <View style={styles.featureRow}>
      <View style={styles.featureLabelContainer}>
        <Text style={styles.featureLabel}>{feature.label}</Text>
        {feature.tooltip && (
          <FontAwesome name="question-circle-o" size={12} color={COLORS.subtext} />
        )}
      </View>
      <View style={styles.featureCells}>
        <View style={styles.featureCell}>{renderCell(feature.free, false)}</View>
        <View style={styles.featureCell}>{renderCell(feature.pro, true)}</View>
      </View>
    </View>
  );
});

FeatureRow.displayName = 'FeatureRow';

const PlanCard = React.memo(({
  plan,
  isSelected,
  onSelect,
}: {
  plan: Plan;
  isSelected: boolean;
  onSelect: () => void;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    onSelect();
  };

  return (
    <Animated.View style={{ flex: 1, transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[styles.planCard, isSelected && styles.planCardSelected]}
        onPress={handlePress}
        activeOpacity={0.85}
      >
        {plan.badge && (
          <LinearGradient
            colors={[COLORS.primary, '#9B5DE5']}
            style={styles.planBadge}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.planBadgeText}>{plan.badge}</Text>
          </LinearGradient>
        )}
        <Text style={[styles.planLabel, isSelected && { color: COLORS.primary }]}>
          {plan.label}
        </Text>
        <Text style={[styles.planPrice, isSelected && { color: '#fff' }]}>
          ${plan.price}
        </Text>
        <Text style={styles.planPeriod}>{plan.period}</Text>
        {plan.savings && (
          <Text style={styles.planSavings}>{plan.savings}</Text>
        )}
        {isSelected && (
          <View style={styles.selectedDot}>
            <FontAwesome name="check-circle" size={18} color={COLORS.primary} />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
});

PlanCard.displayName = 'PlanCard';

// ============ Main Component ============
export default function PremiumScreen({ navigation }: any) {
  const { user, refreshUser } = useAuthStore();
  const isPro = user?.isPremium ?? false;

  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [isLoading, setIsLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);

  const selectedPlanData = useMemo(
    () => PLANS.find((p) => p.id === selectedPlan)!,
    [selectedPlan]
  );

  const yearlySavings = useMemo(() => {
    const monthlyTotal = PLANS[0].price * 12;
    const yearlyPrice = PLANS[1].price;
    const savings = monthlyTotal - yearlyPrice;
    return Math.round((savings / monthlyTotal) * 100);
  }, []);

  const handleUpgrade = useCallback(async () => {
    if (isLoading) return;

    Alert.alert(
      'Subscribe to JustUs Pro',
      `You are about to subscribe to the ${selectedPlanData.label} plan for $${selectedPlanData.price}${selectedPlanData.period}.\n\nThis is a demo — no actual charge will occur.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Subscribe',
          onPress: async () => {
            setIsLoading(true);
            try {
              // In production: integrate with RevenueCat / StoreKit / Google Play Billing
              await new Promise((resolve) => setTimeout(resolve, 1500));
              await refreshUser();
              Alert.alert('🎉 Welcome to Pro!', 'You now have access to all premium features.');
              navigation?.goBack?.();
            } catch (error: any) {
              Alert.alert(
                'Purchase Failed',
                error?.message || 'Something went wrong. Please try again.'
              );
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  }, [isLoading, selectedPlanData, refreshUser, navigation]);

  const handleRestore = useCallback(async () => {
    if (restoreLoading) return;

    setRestoreLoading(true);
    try {
      // In production: call RevenueCat restorePurchases()
      await new Promise((resolve) => setTimeout(resolve, 1200));
      await refreshUser();
      Alert.alert('Restore Complete', 'Your purchases have been restored.');
    } catch {
      Alert.alert('Restore Failed', 'Could not restore purchases. Please try again.');
    } finally {
      setRestoreLoading(false);
    }
  }, [restoreLoading, refreshUser]);

  // ─── Already Pro ──────────────────────────────────────────────────────────
  if (isPro) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[COLORS.primary, '#9B5DE5']}
          style={styles.proBanner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <FontAwesome name="star" size={40} color="#fff" />
          <Text style={styles.proTitle}>You're a Pro! ✨</Text>
          <Text style={styles.proSub}>
            Thank you for supporting JustUs. Enjoy all premium features!
          </Text>
        </LinearGradient>

        <View style={styles.proPerksContainer}>
          {FEATURES.filter((f) => f.pro === true || typeof f.pro === 'string').map((feature) => (
            <View key={feature.label} style={styles.proPerkRow}>
              <FontAwesome name="check-circle" size={16} color={COLORS.primary} />
              <Text style={styles.proPerkLabel}>{feature.label}</Text>
              {typeof feature.pro === 'string' && (
                <Text style={styles.proPerkValue}>{feature.pro}</Text>
              )}
            </View>
          ))}
        </View>
      </View>
    );
  }

  // ─── Upgrade Flow ─────────────────────────────────────────────────────────
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <LinearGradient
        colors={[COLORS.primary, '#9B5DE5']}
        style={styles.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.heroIconRing}>
          <FontAwesome name="star" size={32} color={COLORS.primary} />
        </View>
        <Text style={styles.heroTitle}>JustUs Pro ✨</Text>
        <Text style={styles.heroSub}>
          Unlock unlimited memories, deeper insights, and an{'\n'}ad-free experience — together.
        </Text>
        <View style={styles.heroBadge}>
          <FontAwesome name="tag" size={11} color="#fff" />
          <Text style={styles.heroBadgeText}>Save {yearlySavings}% with yearly</Text>
        </View>
      </LinearGradient>

      {/* Plan Selector */}
      <Text style={styles.sectionLabel}>CHOOSE YOUR PLAN</Text>
      <View style={styles.planRow}>
        {PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isSelected={selectedPlan === plan.id}
            onSelect={() => setSelectedPlan(plan.id)}
          />
        ))}
      </View>

      {/* Feature Comparison Table */}
      <Text style={styles.sectionLabel}>WHAT'S INCLUDED</Text>
      <View style={styles.featureTable}>
        {/* Table header */}
        <View style={[styles.featureRow, styles.featureHeader]}>
          <View style={styles.featureLabelContainer}>
            <Text style={styles.featureHeaderLabel}>Feature</Text>
          </View>
          <View style={styles.featureCells}>
            <View style={styles.featureCell}>
              <Text style={styles.featureHeaderCell}>Free</Text>
            </View>
            <View style={styles.featureCell}>
              <LinearGradient
                colors={[COLORS.primary, '#9B5DE5']}
                style={styles.featureHeaderProBadge}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.featureHeaderProText}>Pro</Text>
              </LinearGradient>
            </View>
          </View>
        </View>

        {FEATURES.map((feature, index) => (
          <View
            key={feature.label}
            style={index === FEATURES.length - 1 ? { borderBottomWidth: 0 } : undefined}
          >
            <FeatureRow feature={feature} />
          </View>
        ))}
      </View>

      {/* Testimonial */}
      <View style={styles.testimonial}>
        <Text style={styles.testimonialQuote}>
          "JustUs Pro made our relationship feel so much more special. The shared gallery alone is worth it!"
        </Text>
        <Text style={styles.testimonialAuthor}>— Sarah & James, together 3 years ❤️</Text>
      </View>

      {/* CTA */}
      <TouchableOpacity
        style={[styles.upgradeBtn, isLoading && styles.disabledButton]}
        onPress={handleUpgrade}
        disabled={isLoading}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={[COLORS.primary, '#9B5DE5']}
          style={styles.upgradeBtnGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <FontAwesome name="star" size={16} color="#fff" />
              <Text style={styles.upgradeBtnText}>
                Get Pro — ${selectedPlanData.price}{selectedPlanData.period}
              </Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>

      {/* Restore Purchases */}
      <TouchableOpacity
        style={styles.restoreBtn}
        onPress={handleRestore}
        disabled={restoreLoading}
        activeOpacity={0.7}
      >
        {restoreLoading ? (
          <ActivityIndicator size="small" color={COLORS.subtext} />
        ) : (
          <Text style={styles.restoreBtnText}>Restore Purchases</Text>
        )}
      </TouchableOpacity>

      {/* Legal */}
      <Text style={styles.legalText}>
        Subscriptions auto-renew unless cancelled at least 24 hours before the renewal date.
        Manage subscriptions in your device settings. By subscribing, you agree to our Terms of Service.
      </Text>
    </ScrollView>
  );
}

// ============ Styles ============
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    paddingBottom: 60,
  },

  // Hero
  hero: {
    padding: 32,
    paddingTop: 60,
    alignItems: 'center',
    gap: 12,
  },
  heroIconRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  heroSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 4,
  },
  heroBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Section labels
  sectionLabel: {
    color: COLORS.subtext,
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1.2,
    marginBottom: 12,
    marginTop: 24,
    paddingHorizontal: 20,
  },

  // Plan cards
  planRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
  },
  planCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    gap: 4,
  },
  planCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(255,77,141,0.08)',
  },
  planBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomLeftRadius: 12,
  },
  planBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  planLabel: {
    color: COLORS.subtext,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 12,
  },
  planPrice: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
  },
  planPeriod: {
    color: COLORS.subtext,
    fontSize: 12,
  },
  planSavings: {
    color: COLORS.success,
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 4,
  },
  selectedDot: {
    marginTop: 8,
  },

  // Feature table
  featureTable: {
    marginHorizontal: 20,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  featureHeader: {
    backgroundColor: '#111',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  featureHeaderLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  featureHeaderCell: {
    color: COLORS.subtext,
    fontSize: 12,
    fontWeight: 'bold',
  },
  featureHeaderProBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  featureHeaderProText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  featureLabelContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureLabel: {
    color: '#ccc',
    fontSize: 13,
  },
  featureCells: {
    flexDirection: 'row',
    width: 120,
  },
  featureCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureCellText: {
    color: COLORS.subtext,
    fontSize: 11,
    textAlign: 'center',
  },

  // Testimonial
  testimonial: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  testimonialQuote: {
    color: '#ddd',
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  testimonialAuthor: {
    color: COLORS.subtext,
    fontSize: 12,
    textAlign: 'right',
  },

  // CTA
  upgradeBtn: {
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 18,
    overflow: 'hidden',
  },
  upgradeBtnGradient: {
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  upgradeBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },

  // Restore
  restoreBtn: {
    marginTop: 14,
    alignItems: 'center',
    paddingVertical: 10,
  },
  restoreBtnText: {
    color: COLORS.subtext,
    fontSize: 13,
    textDecorationLine: 'underline',
  },

  // Legal
  legalText: {
    color: '#555',
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 24,
    marginTop: 16,
    marginBottom: 20,
  },

  // Pro state
  proBanner: {
    padding: 40,
    paddingTop: 80,
    alignItems: 'center',
    gap: 12,
  },
  proTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  proSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  proPerksContainer: {
    padding: 24,
    gap: 14,
  },
  proPerkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  proPerkLabel: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
  },
  proPerkValue: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
});
