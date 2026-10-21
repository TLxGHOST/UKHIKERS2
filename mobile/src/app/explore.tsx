import { useState } from 'react';
import { ScrollView, StyleSheet, Text, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  forest: '#173D2B',
  forestLight: '#28563D',
  paper: '#F7F7F1',
  white: '#FFFFFF',
  ink: '#1B2E25',
  muted: '#65736A',
  lime: '#D8E7A5',
  line: '#E5E9DF',
};

const FILTERS = ['All walks', 'Mountains', 'Coast', 'Nature'] as const;
type Filter = (typeof FILTERS)[number];

const COLLECTIONS: {
  title: string;
  subtitle: string;
  description: string;
  emoji: string;
  category: Exclude<Filter, 'All walks'>;
  tone: string;
  tag: string;
}[] = [
  {
    title: 'Mountain trails',
    subtitle: 'For the big-view seekers',
    description: 'Open landscapes, uphill effort and the feeling of reaching the top.',
    emoji: '⛰',
    category: 'Mountains',
    tone: '#E5EDDA',
    tag: 'HIGHER GROUND',
  },
  {
    title: 'Coastal escapes',
    subtitle: 'Follow the sea breeze',
    description: 'Clifftop paths, sea air and long horizons to walk towards.',
    emoji: '〰',
    category: 'Coast',
    tone: '#F2E8D7',
    tag: 'BY THE WATER',
  },
  {
    title: 'Woodland & nature',
    subtitle: 'Take the slower path',
    description: 'Leafy trails, quiet corners and time to notice the little things.',
    emoji: '🌿',
    category: 'Nature',
    tone: '#DFECE6',
    tag: 'SLOW EXPLORING',
  },
];

export default function ExploreScreen() {
  const [activeFilter, setActiveFilter] = useState<Filter>('All walks');

  const visibleCollections =
    activeFilter === 'All walks'
      ? COLLECTIONS
      : COLLECTIONS.filter((item) => item.category === activeFilter);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>THE OUTDOORS IS CALLING</Text>
          <Text style={styles.title}>Find your{'\n'}kind of wild.</Text>
          <Text style={styles.intro}>
            Every great day out starts with an idea. Explore the kind of trail you’re in the mood for.
          </Text>
        </View>

        <View style={styles.searchPrompt}>
          <View style={styles.searchIconWrap}>
            <Text style={styles.searchIcon}>⌕</Text>
          </View>
          <View style={styles.searchTextWrap}>
            <Text style={styles.searchTitle}>Not sure where to start?</Text>
            <Text style={styles.searchCopy}>Choose a walking style below to get inspired.</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>BROWSE BY EXPERIENCE</Text>
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
            {activeFilter === 'All walks' ? 'Trail inspiration' : activeFilter}
          </Text>
          <Text style={styles.resultsCount}>
            {visibleCollections.length} {visibleCollections.length === 1 ? 'collection' : 'collections'}
          </Text>
        </View>

        <View style={styles.collectionList}>
          {visibleCollections.map((item) => (
            <View key={item.title} style={styles.collectionCard}>
              <View style={[styles.artPanel, { backgroundColor: item.tone }]}>
                <View style={styles.artSun} />
                <Text style={styles.artEmoji}>{item.emoji}</Text>
                <View style={styles.artLabel}>
                  <Text style={styles.artLabelText}>{item.tag}</Text>
                </View>
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDescription}>{item.description}</Text>
                <View style={styles.cardBottom}>
                  <Text style={styles.cardCategory}>{item.category.toUpperCase()}</Text>
                  <View style={styles.cardArrowWrap}>
                    <Text style={styles.cardArrow}>↗</Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.noteCard}>
          <Text style={styles.noteIcon}>✳</Text>
          <View style={styles.noteCopyWrap}>
            <Text style={styles.noteTitle}>More trails are on the way</Text>
            <Text style={styles.noteText}>
              This is the start of your trail guide. Verified routes, practical details and booking options can be added next.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.paper,
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 150,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    marginBottom: 23,
  },
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
  intro: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 12,
    maxWidth: 360,
  },
  searchPrompt: {
    backgroundColor: COLORS.forest,
    borderRadius: 19,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 27,
  },
  searchIconWrap: {
    height: 45,
    width: 45,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  searchIcon: {
    color: COLORS.lime,
    fontSize: 31,
    lineHeight: 36,
  },
  searchTextWrap: {
    flex: 1,
  },
  searchTitle: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '800',
  },
  searchCopy: {
    color: '#D2DFD2',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },
  sectionLabel: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.7,
    marginBottom: 12,
  },
  filterRow: {
    gap: 8,
    paddingBottom: 23,
  },
  filterChip: {
    borderWidth: 1,
    borderColor: '#DDE4D9',
    backgroundColor: COLORS.white,
    borderRadius: 22,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  filterChipSelected: {
    backgroundColor: COLORS.forest,
    borderColor: COLORS.forest,
  },
  filterText: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  filterTextSelected: {
    color: COLORS.white,
  },
  resultsHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  resultsTitle: {
    color: COLORS.ink,
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  resultsCount: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '600',
  },
  collectionList: {
    gap: 15,
  },
  collectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  artPanel: {
    height: 142,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  artSun: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F5D98B',
    position: 'absolute',
    right: 34,
    top: 22,
    opacity: 0.95,
  },
  artEmoji: {
    fontSize: 68,
    color: COLORS.forest,
    textAlign: 'center',
  },
  artLabel: {
    position: 'absolute',
    left: 14,
    bottom: 13,
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  artLabelText: {
    color: COLORS.forest,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  cardBody: {
    paddingHorizontal: 17,
    paddingTop: 15,
    paddingBottom: 16,
  },
  cardSubtitle: {
    color: COLORS.forestLight,
    fontSize: 11,
    fontWeight: '700',
  },
  cardTitle: {
    color: COLORS.ink,
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginTop: 4,
  },
  cardDescription: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 7,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
    marginTop: 14,
    paddingTop: 12,
  },
  cardCategory: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  cardArrowWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8EDE2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardArrow: {
    color: COLORS.forest,
    fontSize: 18,
    fontWeight: '700',
  },
  noteCard: {
    backgroundColor: '#E9EFE4',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 22,
  },
  noteIcon: {
    color: COLORS.forestLight,
    fontSize: 22,
    marginRight: 12,
  },
  noteCopyWrap: {
    flex: 1,
  },
  noteTitle: {
    color: COLORS.ink,
    fontSize: 13,
    fontWeight: '800',
  },
  noteText: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 5,
  },
  pressed: {
    opacity: 0.8,
  },
});
