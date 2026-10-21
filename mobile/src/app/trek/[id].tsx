import { useCallback, useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getTrekById, resolveMediaUrl, type Trek } from '@/lib/api';

const COLORS = {
  forest: '#173D2B',
  forestLight: '#28563D',
  paper: '#F7F7F1',
  white: '#FFFFFF',
  ink: '#1B2E25',
  muted: '#65736A',
  lime: '#D8E7A5',
  line: '#E5E9DF',
  error: '#9E3930',
};

function formatPrice(price?: number) {
  if (typeof price !== 'number' || !Number.isFinite(price) || price <= 0) return null;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
}

export default function TrekDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [trek, setTrek] = useState<Trek | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadTrek() {
      if (!id || Array.isArray(id)) {
        setError('This trek link is not valid.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const result = await getTrekById(id);
        if (active) setTrek(result);
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unable to load this trek right now.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadTrek();
    return () => {
      active = false;
    };
  }, [id, retryKey]);

  const retry = useCallback(() => setRetryKey((value) => value + 1), []);
  const imageUrl = resolveMediaUrl(trek?.imageUrl);
  const price = formatPrice(trek?.price);
  const openBookingPage = useCallback(() => {
    if (!id || Array.isArray(id)) return;
    router.push(`/booking/${encodeURIComponent(id)}`);
  }, [id, router]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back to explore"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
          <Text style={styles.backArrow}>←</Text>
          <Text style={styles.backText}>BACK TO EXPLORE</Text>
        </Pressable>

        {loading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator size="large" color={COLORS.forestLight} />
            <Text style={styles.stateTitle}>Opening the trail…</Text>
            <Text style={styles.stateText}>Loading trek details from UK Hikers.</Text>
          </View>
        ) : error || !trek ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateIcon}>⛰</Text>
            <Text style={styles.stateTitle}>We couldn’t open this trek</Text>
            <Text style={styles.stateText}>{error || 'This trek may no longer be available.'}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={retry}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
              <Text style={styles.primaryButtonText}>Try again</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={() => router.replace('/explore')} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Browse all treks</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {imageUrl ? (
              <Image
                source={{ uri: imageUrl }}
                style={styles.heroImage}
                resizeMode="cover"
                accessibilityLabel={trek.title ? `${trek.title} landscape` : 'Trek landscape'}
              />
            ) : (
              <View style={[styles.heroImage, styles.imageFallback]}>
                <Text style={styles.imageFallbackIcon}>⛰</Text>
                <Text style={styles.imageFallbackText}>UK HIKERS</Text>
              </View>
            )}

            <View style={styles.details}>
              <Text style={styles.eyebrow}>YOUR NEXT ADVENTURE</Text>
              {!!trek.location && <Text style={styles.location}>{trek.location}</Text>}
              <Text style={styles.title}>{trek.title || 'Untitled trek'}</Text>
              {!!trek.excerpt && <Text style={styles.excerpt}>{trek.excerpt}</Text>}

              <View style={styles.metaGrid}>
                {!!trek.duration && (
                  <View style={styles.metaCard}>
                    <Text style={styles.metaLabel}>DURATION</Text>
                    <Text style={styles.metaValue}>{trek.duration}</Text>
                  </View>
                )}
                {!!trek.difficulty && (
                  <View style={styles.metaCard}>
                    <Text style={styles.metaLabel}>DIFFICULTY</Text>
                    <Text style={styles.metaValue}>{trek.difficulty}</Text>
                  </View>
                )}
              </View>

              {!!trek.tags?.length && (
                <View style={styles.tagsSection}>
                  <Text style={styles.sectionTitle}>GOOD TO KNOW</Text>
                  <View style={styles.tagList}>
                    {trek.tags.map((tag) => (
                      <View key={tag} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              <View style={styles.priceCard}>
                <View style={styles.priceCopy}>
                  <Text style={styles.priceLabel}>STARTING FROM</Text>
                  <Text style={styles.price}>{price || 'Contact UK Hikers'}</Text>
                  <Text style={styles.priceNote}>Final availability and booking details are confirmed through UK Hikers.</Text>
                </View>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Book ${trek.title || 'this trek'} on UK Hikers`}
                onPress={openBookingPage}
                style={({ pressed }) => [styles.bookButton, pressed && styles.pressed]}>
                <Text style={styles.bookButtonText}>Book This Trek</Text>
                <Text style={styles.bookButtonArrow}>↗</Text>
              </Pressable>

              <Text style={styles.bookingHint}>Choose your date and complete the booking securely on the UK Hikers website.</Text>

              <View style={styles.noteCard}>
                <Text style={styles.noteIcon}>✳</Text>
                <View style={styles.noteCopy}>
                  <Text style={styles.noteTitle}>Adventure starts with a plan</Text>
                  <Text style={styles.noteText}>
                    Trek information is loaded from the existing UK Hikers service, keeping the app and website in sync.
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.paper },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 44,
    maxWidth: 760,
    width: '100%',
    alignSelf: 'center',
  },
  backButton: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 12, marginBottom: 8 },
  backArrow: { color: COLORS.forest, fontSize: 22, lineHeight: 24 },
  backText: { color: COLORS.forest, fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  heroImage: { width: '100%', height: 270, borderRadius: 22, backgroundColor: '#E5EDDA' },
  imageFallback: { alignItems: 'center', justifyContent: 'center' },
  imageFallbackIcon: { color: COLORS.forest, fontSize: 60 },
  imageFallbackText: { color: COLORS.forestLight, fontSize: 9, fontWeight: '900', letterSpacing: 2 },
  details: { paddingTop: 25 },
  eyebrow: { color: COLORS.forestLight, fontSize: 10, fontWeight: '900', letterSpacing: 1.8, marginBottom: 12 },
  location: { color: COLORS.forestLight, fontSize: 11, fontWeight: '800', letterSpacing: 1.1, textTransform: 'uppercase', marginBottom: 7 },
  title: { color: COLORS.ink, fontSize: 34, lineHeight: 39, fontWeight: '900', letterSpacing: -1.2 },
  excerpt: { color: COLORS.muted, fontSize: 14, lineHeight: 23, marginTop: 13 },
  metaGrid: { flexDirection: 'row', gap: 10, marginTop: 22 },
  metaCard: { flex: 1, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.line, borderRadius: 15, padding: 15 },
  metaLabel: { color: COLORS.muted, fontSize: 9, fontWeight: '800', letterSpacing: 1.2 },
  metaValue: { color: COLORS.forest, fontSize: 15, fontWeight: '800', marginTop: 7 },
  tagsSection: { marginTop: 28 },
  sectionTitle: { color: COLORS.ink, fontSize: 16, fontWeight: '900', marginBottom: 12 },
  tagList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: '#E8EDE2', borderRadius: 18, paddingHorizontal: 12, paddingVertical: 8 },
  tagText: { color: COLORS.forest, fontSize: 11, fontWeight: '700' },
  priceCard: { backgroundColor: COLORS.forest, borderRadius: 18, padding: 19, marginTop: 28 },
  priceCopy: { gap: 5 },
  priceLabel: { color: '#D2DFD2', fontSize: 9, fontWeight: '800', letterSpacing: 1.3 },
  price: { color: COLORS.white, fontSize: 25, fontWeight: '900' },
  priceNote: { color: '#D2DFD2', fontSize: 11, lineHeight: 17, marginTop: 5 },
  bookButton: { backgroundColor: COLORS.lime, borderRadius: 16, paddingHorizontal: 20, paddingVertical: 17, marginTop: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bookButtonText: { color: COLORS.forest, fontSize: 16, fontWeight: '900' },
  bookButtonArrow: { color: COLORS.forest, fontSize: 22, fontWeight: '800' },
  bookingHint: { color: COLORS.muted, fontSize: 11, lineHeight: 17, marginTop: 9 },
  noteCard: { flexDirection: 'row', gap: 12, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.line, borderRadius: 16, padding: 16, marginTop: 15 },
  noteIcon: { color: COLORS.forestLight, fontSize: 19 },
  noteCopy: { flex: 1 },
  noteTitle: { color: COLORS.ink, fontSize: 13, fontWeight: '800' },
  noteText: { color: COLORS.muted, fontSize: 11, lineHeight: 18, marginTop: 5 },
  stateCard: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.line, borderRadius: 20, padding: 24, alignItems: 'center', marginTop: 18 },
  stateIcon: { color: COLORS.forestLight, fontSize: 38 },
  stateTitle: { color: COLORS.ink, fontSize: 17, fontWeight: '900', textAlign: 'center', marginTop: 13 },
  stateText: { color: COLORS.muted, fontSize: 12, lineHeight: 19, textAlign: 'center', marginTop: 8 },
  primaryButton: { backgroundColor: COLORS.forest, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 13, marginTop: 18 },
  primaryButtonText: { color: COLORS.white, fontSize: 12, fontWeight: '800' },
  secondaryButton: { paddingHorizontal: 20, paddingVertical: 12, marginTop: 7 },
  secondaryButtonText: { color: COLORS.forest, fontSize: 12, fontWeight: '800' },
  pressed: { opacity: 0.82 },
});
