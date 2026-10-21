import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { useRouter } from 'expo-router';

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

const FILTERS = ['All treks', 'Easy', 'Moderate', 'Difficult'] as const;
type Filter = (typeof FILTERS)[number];

function formatPrice(price?: number) {
  if (typeof price !== 'number' || !Number.isFinite(price) || price <= 0) return null;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
}

function matchesDifficulty(trek: Trek, filter: Filter) {
  if (filter === 'All treks') return true;
  return (trek.difficulty || '').trim().toLowerCase() === filter.toLowerCase();
}

export default function ExploreScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<Filter>('All treks');
  const [treks, setTreks] = useState<Trek[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;

    const loadTreks = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getTreks();
        if (active) setTreks(data);
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Something went wrong while loading treks.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadTreks();
    return () => {
      active = false;
    };
  }, [retryKey]);

  const visibleTreks = useMemo(
    () => treks.filter((trek) => matchesDifficulty(trek, activeFilter)),
    [treks, activeFilter],
  );

  const retry = useCallback(() => setRetryKey((value) => value + 1), []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>THE OUTDOORS IS CALLING</Text>
          <Text style={styles.title}>Find your{'\n'}kind of wild.</Text>
          <Text style={styles.intro}>
            Explore the treks listed on UK Hikers. Prices, details and images come from the same source as the website.
          </Text>
        </View>

        <View style={styles.sourceCard}>
          <View style={styles.sourceIcon}>
            <Text style={styles.sourceIconText}>↗</Text>
          </View>
          <View style={styles.sourceCopy}>
            <Text style={styles.sourceTitle}>One trail guide, everywhere</Text>
            <Text style={styles.sourceText}>The app uses the existing UK Hikers trek records, so it doesn’t keep a separate catalogue.</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>FILTER BY DIFFICULTY</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}>
          {FILTERS.map((filter) => {
            const selected = filter === activeFilter;
            return (
              <Pressable
                key={filter}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setActiveFilter(filter)}
                style={({ pressed }) => [
                  styles.filterChip,
                  selected && styles.filterChipSelected,
                  pressed && styles.pressed,
                ]}>
                <Text style={[styles.filterText, selected && styles.filterTextSelected]}>
                  {filter}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.resultsHeading}>
          <Text style={styles.resultsTitle}>
            {activeFilter === 'All treks' ? 'Explore treks' : `${activeFilter} treks`}
          </Text>
          {!loading && !error && (
            <Text style={styles.resultsCount}>
              {visibleTreks.length} {visibleTreks.length === 1 ? 'trek' : 'treks'}
            </Text>
          )}
        </View>

        {loading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator size="large" color={COLORS.forestLight} />
            <Text style={styles.stateTitle}>Finding your next adventure…</Text>
            <Text style={styles.stateText}>Loading the latest trek details from UK Hikers.</Text>
          </View>
        ) : error ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateIcon}>☁</Text>
            <Text style={styles.stateTitle}>Treks couldn’t load</Text>
            <Text style={styles.stateText}>{error}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={retry}
              style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}>
              <Text style={styles.retryButtonText}>Try again</Text>
            </Pressable>
          </View>
        ) : visibleTreks.length === 0 ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateIcon}>⌕</Text>
            <Text style={styles.stateTitle}>{treks.length ? 'No treks in this filter' : 'No treks available yet'}</Text>
            <Text style={styles.stateText}>
              {treks.length ? 'Try another difficulty level to see more routes.' : 'Check back later for available treks.'}
            </Text>
            {treks.length > 0 && (
              <Pressable
                accessibilityRole="button"
                onPress={() => setActiveFilter('All treks')}
                style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}>
                <Text style={styles.retryButtonText}>Show all treks</Text>
              </Pressable>
            )}
          </View>
        ) : (
          <View style={styles.trekList}>
            {visibleTreks.map((trek) => {
              const imageUrl = resolveMediaUrl(trek.imageUrl);
              const price = formatPrice(trek.price);
              return (
                <Pressable
                  key={trek._id}
                  accessibilityRole="button"
                  accessibilityLabel={`View details for ${trek.title || 'this trek'}`}
                  onPress={() => router.push(`/trek/${trek._id}`)}
                  style={({ pressed }) => [styles.trekCard, pressed && styles.trekCardPressed]}>
                  {imageUrl ? (
                    <Image
                      source={{ uri: imageUrl }}
                      style={styles.trekImage}
                      resizeMode="cover"
                      accessibilityLabel={trek.title ? `${trek.title} trek` : 'Trek landscape'}
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
                    {!!trek.excerpt && (
                      <Text style={styles.trekExcerpt} numberOfLines={3}>{trek.excerpt}</Text>
                    )}
                    <View style={styles.metaRow}>
                      {!!trek.duration && (
                        <View style={styles.metaPill}>
                          <Text style={styles.metaText}>◷  {trek.duration}</Text>
                        </View>
                      )}
                      {!!trek.difficulty && (
                        <View style={styles.metaPill}>
                          <Text style={styles.metaText}>{trek.difficulty}</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.cardFooter}>
                      <View>
                        <Text style={styles.priceLabel}>STARTING FROM</Text>
                        <Text style={styles.price}>{price || 'Contact us'}</Text>
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
          <Text style={styles.footerIcon}>✳</Text>
          <Text style={styles.footerText}>Trek details are shared with the UK Hikers website.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.paper },
  content: {
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 150,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  header: { marginBottom: 23 },
  eyebrow: {
    color: COLORS.forestLight,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.9,
    marginBottom: 12,
  },
  title: {
    color: COLORS.ink,
    fontSize: 42,
    lineHeight: 45,
    letterSpacing: -1.5,
    fontWeight: '800',
  },
  intro: { color: COLORS.muted, fontSize: 14, lineHeight: 22, marginTop: 12, maxWidth: 380 },
  sourceCard: {
    backgroundColor: COLORS.forest,
    borderRadius: 19,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 27,
  },
  sourceIcon: {
    height: 44,
    width: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sourceIconText: { color: COLORS.lime, fontSize: 25, fontWeight: '700' },
  sourceCopy: { flex: 1 },
  sourceTitle: { color: COLORS.white, fontSize: 13, fontWeight: '800' },
  sourceText: { color: '#D2DFD2', fontSize: 11, lineHeight: 16, marginTop: 4 },
  sectionLabel: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.7,
    marginBottom: 12,
  },
  filterRow: { gap: 8, paddingBottom: 23 },
  filterChip: {
    borderWidth: 1,
    borderColor: '#DDE4D9',
    backgroundColor: COLORS.white,
    borderRadius: 22,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  filterChipSelected: { backgroundColor: COLORS.forest, borderColor: COLORS.forest },
  filterText: { color: COLORS.muted, fontSize: 12, fontWeight: '700' },
  filterTextSelected: { color: COLORS.white },
  resultsHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  resultsTitle: { color: COLORS.ink, fontSize: 21, fontWeight: '800', letterSpacing: -0.5 },
  resultsCount: { color: COLORS.muted, fontSize: 11, fontWeight: '600' },
  trekList: { gap: 15 },
  trekCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  trekCardPressed: { opacity: 0.9, transform: [{ scale: 0.995 }] },
  trekImage: { width: '100%', height: 185, backgroundColor: '#E5EDDA' },
  imageFallback: { alignItems: 'center', justifyContent: 'center' },
  imageFallbackIcon: { color: COLORS.forest, fontSize: 54 },
  imageFallbackText: { color: COLORS.forestLight, fontSize: 9, fontWeight: '900', letterSpacing: 2 },
  trekBody: { paddingHorizontal: 17, paddingTop: 15, paddingBottom: 16 },
  trekLocation: {
    color: COLORS.forestLight,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  trekTitle: { color: COLORS.ink, fontSize: 20, fontWeight: '800', letterSpacing: -0.4 },
  trekExcerpt: { color: COLORS.muted, fontSize: 12, lineHeight: 19, marginTop: 7 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 13 },
  metaPill: { backgroundColor: '#EDF1E8', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 7 },
  metaText: { color: COLORS.forest, fontSize: 10, fontWeight: '700' },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
    marginTop: 15,
    paddingTop: 13,
  },
  priceLabel: { color: COLORS.muted, fontSize: 8, fontWeight: '800', letterSpacing: 1.1 },
  price: { color: COLORS.forest, fontSize: 18, fontWeight: '900', marginTop: 3 },
  cardArrowWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8EDE2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardArrow: { color: COLORS.forest, fontSize: 20, fontWeight: '700' },
  stateCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.line,
    paddingHorizontal: 22,
    paddingVertical: 30,
    alignItems: 'center',
  },
  stateIcon: { color: COLORS.forestLight, fontSize: 38, marginBottom: 8 },
  stateTitle: { color: COLORS.ink, fontSize: 16, fontWeight: '800', textAlign: 'center', marginTop: 12 },
  stateText: { color: COLORS.muted, fontSize: 12, lineHeight: 19, textAlign: 'center', marginTop: 7 },
  retryButton: {
    backgroundColor: COLORS.forest,
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 17,
  },
  retryButtonText: { color: COLORS.white, fontSize: 12, fontWeight: '800' },
  footerNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 25, gap: 8 },
  footerIcon: { color: COLORS.forestLight, fontSize: 15 },
  footerText: { color: COLORS.muted, fontSize: 10, fontWeight: '600', textAlign: 'center' },
  pressed: { opacity: 0.8 },
});
