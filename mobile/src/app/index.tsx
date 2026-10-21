import { useRouter } from 'expo-router';
import { ImageBackground, ScrollView, StyleSheet, Text, Pressable, View } from 'react-native';
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

// Remote landscape image used for the first visual prototype.
const HERO_IMAGE =
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=85';

export default function HomeScreen() {
  const router = useRouter();
  const openExplore = () => router.push('/explore');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
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
            Fresh air, winding trails and places worth slowing down for. Your next walk starts here.
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
            <Text style={styles.heroTitle}>Take the scenic route.</Text>
            <Text style={styles.heroCopy}>
              Find a walk that fits your pace, from easy-going escapes to days in the hills.
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Explore walks"
              onPress={openExplore}
              style={({ pressed }) => [styles.heroButton, pressed && styles.pressed]}>
              <Text style={styles.heroButtonText}>Explore walks</Text>
              <Text style={styles.heroButtonArrow}>↗</Text>
            </Pressable>
          </View>
        </ImageBackground>

        <View style={styles.sectionHeading}>
          <View style={styles.sectionHeadingText}>
            <Text style={styles.sectionEyebrow}>MAKE IT YOURS</Text>
            <Text style={styles.sectionTitle}>What’s your kind of walk?</Text>
          </View>
          <Pressable onPress={openExplore} accessibilityRole="button" style={styles.seeAll}>
            <Text style={styles.seeAllText}>See all ↗</Text>
          </Pressable>
        </View>

        <View style={styles.categoryList}>
          <Pressable
            onPress={openExplore}
            accessibilityRole="button"
            style={({ pressed }) => [styles.categoryCard, pressed && styles.pressed]}>
            <View style={[styles.categoryIcon, { backgroundColor: '#E6EDDB' }]}>
              <Text style={styles.categoryEmoji}>⛰</Text>
            </View>
            <View style={styles.categoryTextWrap}>
              <Text style={styles.categoryTitle}>Mountain trails</Text>
              <Text style={styles.categoryCopy}>Big views, fresh air, higher ground</Text>
            </View>
            <Text style={styles.categoryArrow}>↗</Text>
          </Pressable>

          <Pressable
            onPress={openExplore}
            accessibilityRole="button"
            style={({ pressed }) => [styles.categoryCard, pressed && styles.pressed]}>
            <View style={[styles.categoryIcon, { backgroundColor: '#F2E8D7' }]}>
              <Text style={styles.categoryEmoji}>〰</Text>
            </View>
            <View style={styles.categoryTextWrap}>
              <Text style={styles.categoryTitle}>Coastal escapes</Text>
              <Text style={styles.categoryCopy}>Sea air and paths by the water</Text>
            </View>
            <Text style={styles.categoryArrow}>↗</Text>
          </Pressable>

          <Pressable
            onPress={openExplore}
            accessibilityRole="button"
            style={({ pressed }) => [styles.categoryCard, pressed && styles.pressed]}>
            <View style={[styles.categoryIcon, { backgroundColor: '#E2ECE9' }]}>
              <Text style={styles.categoryEmoji}>🌿</Text>
            </View>
            <View style={styles.categoryTextWrap}>
              <Text style={styles.categoryTitle}>Gentle nature walks</Text>
              <Text style={styles.categoryCopy}>Unhurried routes and quiet moments</Text>
            </View>
            <Text style={styles.categoryArrow}>↗</Text>
          </Pressable>
        </View>

        <View style={styles.footerNote}>
          <Text style={styles.footerLeaf}>✳</Text>
          <Text style={styles.footerText}>Leave only footprints. Take home the feeling.</Text>
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
    paddingTop: 12,
    paddingBottom: 150,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  brandMark: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.forest,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  brandMarkText: {
    color: COLORS.lime,
    fontSize: 24,
    fontWeight: '900',
  },
  brandName: {
    color: COLORS.forest,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.7,
  },
  brandTagline: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.4,
    marginTop: 3,
  },
  headerSpacer: {
    flex: 1,
  },
  headerBadge: {
    backgroundColor: '#E8EDE2',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  headerBadgeText: {
    color: COLORS.forest,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  intro: {
    marginBottom: 22,
  },
  eyebrow: {
    color: COLORS.forestLight,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 12,
  },
  title: {
    color: COLORS.ink,
    fontSize: 42,
    lineHeight: 46,
    letterSpacing: -1.6,
    fontWeight: '800',
  },
  titleAccent: {
    color: COLORS.forestLight,
    fontStyle: 'italic',
  },
  introCopy: {
    color: COLORS.muted,
    fontSize: 15,
    lineHeight: 23,
    marginTop: 13,
    maxWidth: 340,
  },
  heroCard: {
    minHeight: 420,
    borderRadius: 26,
    overflow: 'hidden',
    marginBottom: 32,
    backgroundColor: COLORS.forest,
    justifyContent: 'flex-end',
  },
  heroImage: {
    borderRadius: 26,
  },
  heroScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 35, 23, 0.48)',
  },
  heroContent: {
    flex: 1,
    padding: 22,
    paddingTop: 24,
    justifyContent: 'space-between',
  },
  heroPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(247,247,241,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  heroPillText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  heroSpacer: {
    flex: 1,
    minHeight: 150,
  },
  heroKicker: {
    color: COLORS.lime,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.7,
    marginBottom: 8,
  },
  heroTitle: {
    color: COLORS.white,
    fontSize: 27,
    lineHeight: 33,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  heroCopy: {
    color: '#F0F2E9',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 18,
    maxWidth: 300,
  },
  heroButton: {
    backgroundColor: COLORS.lime,
    borderRadius: 15,
    minHeight: 54,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroButtonText: {
    color: COLORS.forest,
    fontSize: 14,
    fontWeight: '800',
  },
  heroButtonArrow: {
    color: COLORS.forest,
    fontSize: 20,
    fontWeight: '700',
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  sectionHeadingText: {
    flex: 1,
  },
  sectionEyebrow: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.7,
    marginBottom: 7,
  },
  sectionTitle: {
    color: COLORS.ink,
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  seeAll: {
    paddingVertical: 6,
    paddingLeft: 8,
  },
  seeAllText: {
    color: COLORS.forestLight,
    fontSize: 12,
    fontWeight: '800',
  },
  categoryList: {
    gap: 10,
  },
  categoryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: COLORS.line,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 83,
  },
  categoryIcon: {
    width: 54,
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },
  categoryEmoji: {
    fontSize: 25,
    color: COLORS.forest,
  },
  categoryTextWrap: {
    flex: 1,
  },
  categoryTitle: {
    color: COLORS.ink,
    fontSize: 14,
    fontWeight: '800',
  },
  categoryCopy: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },
  categoryArrow: {
    color: COLORS.forestLight,
    fontSize: 20,
    marginLeft: 8,
    paddingHorizontal: 4,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
    gap: 8,
  },
  footerLeaf: {
    color: COLORS.forestLight,
    fontSize: 15,
  },
  footerText: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
});
