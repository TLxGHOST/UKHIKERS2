import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getTreks, resolveMediaUrl, type Trek } from '@/lib/api';

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

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=85';

function formatPrice(price?: number) {
  if (typeof price !== 'number' || !Number.isFinite(price) || price <= 0) return null;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
}

export default function HomeScreen() {
  const router = useRouter();
  const [treks, setTreks] = useState<Trek[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const openExplore = useCallback(() => router.push('/explore'), [router]);

  useEffect(() => {
    let active = true;

    async function loadTreks() {
      setLoading(true);
      setError(null);
      try {
        const data = await getTreks();
        if (active) setTreks(data);
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unable to load treks right now.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadTreks();
    return () => {
      active = false;
    };
  }, [retryKey]);

  const featuredTreks = treks.slice(0, 3);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>U</Text>
          </View>
          <View>
            <Text style={styles.brandName}>UK HIKERS</Text>
            <Text style={styles.brandTagline}>FIND YOUR OUTSIDE</Text>
          </View>
          <View style={styles.headerSpacer} />
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>☀  OUTDOORS</Text>
          </View>
        </View>

        <View style={styles.intro}>
          <Text style={styles.eyebrow}>A LITTLE CLOSER TO NATURE</Text>
          <Text style={styles.title}>
            The best days{'\n'}are <Text style={styles.titleAccent}>out there.</Text>
          </Text>
          <Text style={styles.introCopy}>
            Find your next adventure with real treks from UK Hikers. Explore routes, compare details, and plan your next escape.
          </Text>
        </View>

        <ImageBackground
          source={{ uri: HERO_IMAGE }}
          style={styles.heroCard}
          imageStyle={styles.heroImage}
          resizeMode="cover">
          <View style={styles.heroScrim} />
          <View style={styles.heroContent}>
            <View style={styles.heroPill}>
              <Text style={styles.heroPillText}>YOUR NEXT ADVENTURE</Text>
            </View>
            <View style={styles.heroSpacer} />
            <Text style={styles.heroKicker}>STEP OUT. FEEL MORE.</Text>
            <Text style={styles.heroTitle}>Your next trek starts here.</Text>
            <Text style={styles.heroCopy}>
              Discover available UK Hikers trips, with current trek details and prices.
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Explore available treks"
              onPress={openExplore}
              style={({ pressed }) => [styles.heroButton, pressed && styles.pressed]}>
              <Text style={styles.heroButtonText}>Explore treks</Text>
              <Text style={styles.heroButtonArrow}>↗</Text>
            </Pressable>
          </View>
        </ImageBackground>

        <View style={styles.sectionHeading}>
          <View style={styles.sectionHeadingText}>
            <Text style={styles.sectionEyebrow}>PICK YOUR NEXT ADVENTURE</Text>
            <Text style={styles.sectionTitle}>Available treks</Text>
          </View>
          <Pressable onPress={openExplore} accessibilityRole="button" style={styles.seeAll}>
            <Text style={styles.seeAllText}>See all ↗</Text>
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator size="large" color={COLORS.forestLight} />
            <Text style={styles.stateTitle}>Finding your next adventure…</Text>
            <Text style={styles.stateText}>Loading current trek listings from UK Hikers.</Text>
          </View>
        ) : error ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateTitle}>Treks couldn’t load</Text>
            <Text style={styles.stateText}>{error}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => setRetryKey((value) => value + 1)}
              style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}>
              <Text style={styles.retryButtonText}>Try again</Text>
            </Pressable>
          </View>
        ) : featuredTreks.length === 0 ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateTitle}>No treks available yet</Text>
            <Text style={styles.stateText}>New trips will appear here when they are published on UK Hikers.</Text>
            <Pressable
              accessibilityRole="button"
              onPress={openExplore}
              style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}>
              <Text style={styles.retryButtonText}>Browse treks</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.trekList}>
            {featuredTreks.map((trek) => {
              const imageUrl = resolveMediaUrl(trek.imageUrl);
              const price = formatPrice(trek.price);
              return (
                <Pressable
                  key={trek._id}
                  accessibilityRole="button"
                  accessibilityLabel={`View details for ${trek.title || 'this trek'}`}
                  onPress={() => router.push(`/trek/${trek._id}`)}
                  style={({ pressed }) => [styles.trekCard, pressed && styles.pressed]}>
                  {imageUrl ? (
                    <Image
                      source={{ uri: imageUrl }}
                      style={styles.trekImage}
                      resizeMode="cover"
                      accessibilityLabel={trek.title ? `${trek.title} landscape` : 'Trek landscape'}
                    />
                  ) : (
                    <View style={[styles.trekImage, styles.imageFallback]}>
                      <Text style={styles.imageFallbackIcon}>⛰</Text>
                      <Text style={styles.imageFallbackText}>UK HIKERS</Text>
                    </View>
                  )}
                  <View style={styles.trekBody}>
                    {!!trek.location && <Text style={styles.trekLocation}>{trek.location}</Text>}
                    <Text style={styles.trekTitle}>{trek.title || 'Untitled trek'}</Text>
                    {!!trek.excerpt && <Text style={styles.trekExcerpt} numberOfLines={2}>{trek.excerpt}</Text>}
                    <View style={styles.metaRow}>
                      {!!trek.duration && <Text style={styles.metaText}>◷  {trek.duration}</Text>}
                      {!!trek.difficulty && <Text style={styles.metaText}>•  {trek.difficulty}</Text>}
                    </View>
                    <View style={styles.cardFooter}>
                      <View>
                        <Text style={styles.priceLabel}>STARTING FROM</Text>
                        <Text style={styles.price}>{price || 'Contact UK Hikers'}</Text>
                      </View>
                      <View style={styles.cardArrowWrap}>
                        <Text style={styles.cardArrow}>↗</Text>
                      </View>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}

        <View style={styles.footerNote}>
          <Text style={styles.footerLeaf}>✳</Text>
          <Text style={styles.footerText}>Leave only footprints. Take home the feeling.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.paper },
  content: { paddingHorizontal: 22, paddingTop: 12, paddingBottom: 150, maxWidth: 720, width: '100%', alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
  brandMark: { width: 42, height: 42, borderRadius: 14, backgroundColor: COLORS.forest, alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  brandMarkText: { color: COLORS.lime, fontSize: 24, fontWeight: '900' },
  brandName: { color: COLORS.forest, fontSize: 14, fontWeight: '900', letterSpacing: 1.7 },
  brandTagline: { color: COLORS.muted, fontSize: 9, fontWeight: '700', letterSpacing: 1.4, marginTop: 3 },
  headerSpacer: { flex: 1 },
  headerBadge: { backgroundColor: '#E8EDE2', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 8 },
  headerBadgeText: { color: COLORS.forest, fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  intro: { marginBottom: 22 },
  eyebrow: { color: COLORS.forestLight, fontSize: 10, fontWeight: '800', letterSpacing: 2, marginBottom: 12 },
  title: { color: COLORS.ink, fontSize: 42, lineHeight: 46, letterSpacing: -1.6, fontWeight: '800' },
  titleAccent: { color: COLORS.forestLight, fontStyle: 'italic' },
  introCopy: { color: COLORS.muted, fontSize: 15, lineHeight: 23, marginTop: 13, maxWidth: 360 },
  heroCard: { minHeight: 400, borderRadius: 26, overflow: 'hidden', marginBottom: 32, backgroundColor: COLORS.forest, justifyContent: 'flex-end' },
  heroImage: { borderRadius: 26 },
  heroScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(11, 35, 23, 0.48)' },
  heroContent: { flex: 1, padding: 22, paddingTop: 24, justifyContent: 'space-between' },
  heroPill: { alignSelf: 'flex-start', backgroundColor: 'rgba(247,247,241,0.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)', borderRadius: 20, paddingHorizontal: 11, paddingVertical: 8 },
  heroPillText: { color: COLORS.white, fontSize: 9, fontWeight: '800', letterSpacing: 1.1 },
  heroSpacer: { flex: 1, minHeight: 120 },
  heroKicker: { color: COLORS.lime, fontSize: 9, fontWeight: '900', letterSpacing: 1.7, marginBottom: 8 },
  heroTitle: { color: COLORS.white, fontSize: 27, lineHeight: 33, fontWeight: '800', letterSpacing: -0.6 },
  heroCopy: { color: '#F0F2E9', fontSize: 13, lineHeight: 20, marginTop: 8, marginBottom: 18, maxWidth: 300 },
  heroButton: { backgroundColor: COLORS.lime, borderRadius: 15, minHeight: 54, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroButtonText: { color: COLORS.forest, fontSize: 14, fontWeight: '800' },
  heroButtonArrow: { color: COLORS.forest, fontSize: 20, fontWeight: '700' },
  sectionHeading: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16, gap: 8 },
  sectionHeadingText: { flex: 1 },
  sectionEyebrow: { color: COLORS.muted, fontSize: 9, fontWeight: '800', letterSpacing: 1.7, marginBottom: 7 },
  sectionTitle: { color: COLORS.ink, fontSize: 21, fontWeight: '800', letterSpacing: -0.6 },
  seeAll: { paddingVertical: 6, paddingLeft: 8 },
  seeAllText: { color: COLORS.forestLight, fontSize: 12, fontWeight: '800' },
  trekList: { gap: 13 },
  trekCard: { backgroundColor: COLORS.white, borderRadius: 20, borderWidth: 1, borderColor: COLORS.line, overflow: 'hidden' },
  trekImage: { width: '100%', height: 170, backgroundColor: '#E5EDDA' },
  imageFallback: { alignItems: 'center', justifyContent: 'center' },
  imageFallbackIcon: { color: COLORS.forest, fontSize: 45 },
  imageFallbackText: { color: COLORS.forestLight, fontSize: 9, fontWeight: '900', letterSpacing: 2 },
  trekBody: { padding: 16 },
  trekLocation: { color: COLORS.forestLight, fontSize: 10, fontWeight: '800', letterSpacing: 1.1, textTransform: 'uppercase', marginBottom: 6 },
  trekTitle: { color: COLORS.ink, fontSize: 19, fontWeight: '900' },
  trekExcerpt: { color: COLORS.muted, fontSize: 12, lineHeight: 18, marginTop: 6 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12 },
  metaText: { color: COLORS.muted, fontSize: 11, fontWeight: '700' },
  cardFooter: { borderTopWidth: 1, borderTopColor: COLORS.line, marginTop: 14, paddingTop: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  priceLabel: { color: COLORS.muted, fontSize: 9, fontWeight: '800', letterSpacing: 1.1 },
  price: { color: COLORS.forest, fontSize: 17, fontWeight: '900', marginTop: 4 },
  cardArrowWrap: { width: 38, height: 38, borderRadius: 13, backgroundColor: '#E8EDE2', alignItems: 'center', justifyContent: 'center' },
  cardArrow: { color: COLORS.forest, fontSize: 21, fontWeight: '800' },
  stateCard: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.line, borderRadius: 20, padding: 24, alignItems: 'center', marginTop: 4 },
  stateTitle: { color: COLORS.ink, fontSize: 16, fontWeight: '900', textAlign: 'center', marginTop: 12 },
  stateText: { color: COLORS.muted, fontSize: 12, lineHeight: 19, textAlign: 'center', marginTop: 8 },
  retryButton: { backgroundColor: COLORS.forest, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12, marginTop: 16 },
  retryButtonText: { color: COLORS.white, fontSize: 12, fontWeight: '800' },
  footerNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 25, gap: 8 },
  footerLeaf: { color: COLORS.forestLight, fontSize: 15 },
  footerText: { color: COLORS.muted, fontSize: 11, fontWeight: '600' },
  pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
});
