import { useEffect, useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import RazorpayCheckout from 'react-native-razorpay';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getTrekById, type Trek } from '@/lib/api';

const API = (process.env.EXPO_PUBLIC_API_URL || 'https://ukhikers2.onrender.com/api').replace(/\/$/, '');
const COLORS = { forest: '#173D2B', forestLight: '#28563D', paper: '#F7F7F1', white: '#FFFFFF', ink: '#1B2E25', muted: '#65736A', lime: '#D8E7A5', line: '#E5E9DF', error: '#9E3930' };

type TrekSlot = { _id: string; date: string; totalSeats: number; bookedSeats?: number };
type ApiResult<T> = { success?: boolean; data?: T; message?: string };

function money(value?: number) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
}
function dateLabel(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function NativeBookingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [trek, setTrek] = useState<Trek | null>(null);
  const [slots, setSlots] = useState<TrekSlot[]>([]);
  const [slotId, setSlotId] = useState('');
  const [persons, setPersons] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      if (!id || Array.isArray(id)) { setError('Invalid trek.'); setLoading(false); return; }
      try {
        const [trekData, slotsResponse] = await Promise.all([
          getTrekById(id),
          fetch(`${API}/slots/trek/${encodeURIComponent(id)}`).then(async (response) => {
            const result = await response.json() as ApiResult<TrekSlot[]>;
            if (!response.ok || !Array.isArray(result.data)) throw new Error(result.message || 'Unable to load trek dates.');
            return result.data;
          }),
        ]);
        if (active) {
          setTrek(trekData);
          setSlots(slotsResponse.filter((slot) => new Date(slot.date).getTime() >= Date.now()));
        }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Unable to load booking details.');
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [id]);

  const selectedSlot = slots.find((slot) => slot._id === slotId);
  const total = useMemo(() => Number(trek?.price || 0) * persons, [trek?.price, persons]);

  const validate = () => {
    if (!selectedSlot) { Alert.alert('Choose a date', 'Select an available trek date to continue.'); return false; }
    if (!name.trim() || name.trim().length < 2) { Alert.alert('Name required', 'Enter the name for the booking.'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { Alert.alert('Email required', 'Enter a valid email address.'); return false; }
    if (!/^[6-9]\d{9}$/.test(phone.trim())) { Alert.alert('Phone required', 'Enter a valid 10-digit Indian mobile number.'); return false; }
    if (persons > Number(selectedSlot.totalSeats) - Number(selectedSlot.bookedSeats || 0)) { Alert.alert('Not enough seats', 'Please select another date or reduce the group size.'); return false; }
    return true;
  };

  const submitInterest = async () => {
    if (!validate() || !slotId) return;
    setSubmitting(true);
    try {
      const response = await fetch(`${API}/bookings`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId, name: name.trim(), email: email.trim(), phone: phone.trim(), persons, amountPaid: 0 }),
      });
      const result = await response.json() as { success?: boolean; message?: string; booking?: { _id?: string } };
      if (!response.ok || !result.success) throw new Error(result.message || 'Unable to submit your interest.');
      Alert.alert('Interest submitted', 'Thanks! UK Hikers has received your request. No payment was taken and no seats are reserved.', [
        { text: 'Done', onPress: () => router.replace(`/trek/${id}`) },
      ]);
    } catch (err) {
      Alert.alert('Could not submit', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const payFullAmount = async () => {
    if (!validate() || !slotId || !trek) return;
    setSubmitting(true);
    try {
      const orderResponse = await fetch(`${API}/payments/create-order`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId, name: name.trim(), email: email.trim(), phone: phone.trim(), persons, currency: 'INR' }),
      });
      const orderData = await orderResponse.json() as {
        success?: boolean; message?: string; keyId?: string;
        order?: { id: string; amount: number; currency: string };
      };
      if (!orderResponse.ok || !orderData.success || !orderData.order || !orderData.keyId) {
        throw new Error(orderData.message || 'Could not start secure checkout.');
      }
      let payment: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
      try {
        payment = await RazorpayCheckout.open({
          key: orderData.keyId,
          order_id: orderData.order.id,
          amount: orderData.order.amount,
          currency: orderData.order.currency,
          name: 'UK Hikers',
          description: `Full payment — ${trek.title || 'Trek'}`,
          prefill: { name: name.trim(), email: email.trim(), contact: phone.trim() },
          theme: { color: COLORS.forest },
        }) as typeof payment;
      } catch (checkoutError) {
        const message = typeof checkoutError === 'object' && checkoutError !== null && 'description' in checkoutError
          ? String((checkoutError as { description?: unknown }).description || 'Payment was cancelled or failed.')
          : 'Payment was cancelled or failed. No booking has been confirmed.';
        Alert.alert('Payment not completed', message);
        return;
      }

      const verifyResponse = await fetch(`${API}/payments/verify`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payment),
      });
      const verifyData = await verifyResponse.json() as { success?: boolean; message?: string; booking?: { _id?: string } };
      if (!verifyResponse.ok || !verifyData.success) {
        throw new Error(`${verifyData.message || 'Payment verification failed.'} Payment ID: ${payment.razorpay_payment_id}. Do not pay again; contact UK Hikers support.`);
      }
      Alert.alert('Payment verified!', `Your booking is confirmed. Total paid: ${money(total)}${verifyData.booking?._id ? `\nBooking ID: ${verifyData.booking._id}` : ''}`, [
        { text: 'Done', onPress: () => router.replace(`/trek/${id}`) },
      ]);
    } catch (err) {
      Alert.alert('Unable to complete booking', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <SafeAreaView style={styles.safe}><View style={styles.center}><ActivityIndicator size="large" color={COLORS.forest} /><Text style={styles.muted}>Loading booking options…</Text></View></SafeAreaView>;
  if (error || !trek) return <SafeAreaView style={styles.safe}><View style={styles.center}><Text style={styles.title}>Couldn’t open booking</Text><Text style={styles.muted}>{error || 'Trek not found.'}</Text><Pressable onPress={() => router.back()} style={styles.secondary}><Text style={styles.secondaryText}>Go back</Text></Pressable></View></SafeAreaView>;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>← BACK TO TREK</Text></Pressable>
        <Text style={styles.eyebrow}>BOOK DIRECTLY IN THE APP</Text>
        <Text style={styles.title}>{trek.title || 'Your trek'}</Text>
        <Text style={styles.subtitle}>Choose a date, enter your contact details, then pay securely or send a no-cost enquiry.</Text>

        <Text style={styles.sectionTitle}>1. Choose a date</Text>
        {slots.length === 0 ? <View style={styles.infoCard}><Text style={styles.body}>No upcoming dates are available right now. You can still contact us through the website.</Text></View> : slots.map((slot) => {
          const remaining = Number(slot.totalSeats) - Number(slot.bookedSeats || 0);
          const disabled = remaining <= 0;
          return <Pressable key={slot._id} disabled={disabled} onPress={() => setSlotId(slot._id)} style={[styles.slot, slotId === slot._id && styles.slotSelected, disabled && styles.disabled]}>
            <View style={styles.slotCopy}><Text style={styles.slotDate}>{dateLabel(slot.date)}</Text><Text style={styles.muted}>{disabled ? 'Fully booked' : `${remaining} seat${remaining === 1 ? '' : 's'} shown available`}</Text></View>
            <Text style={styles.radio}>{slotId === slot._id ? '●' : '○'}</Text>
          </Pressable>;
        })}

        <Text style={styles.sectionTitle}>2. Number of people</Text>
        <View style={styles.counter}><Text style={styles.body}>Travellers</Text><View style={styles.counterControls}><Pressable onPress={() => setPersons((value) => Math.max(1, value - 1))} style={styles.counterButton}><Text style={styles.counterButtonText}>−</Text></Pressable><Text style={styles.count}>{persons}</Text><Pressable onPress={() => setPersons((value) => Math.min(20, value + 1))} style={styles.counterButton}><Text style={styles.counterButtonText}>+</Text></Pressable></View></View>
        <View style={styles.totalCard}><Text style={styles.muted}>FULL PAYMENT · {persons} TRAVELLER{persons === 1 ? '' : 'S'}</Text><Text style={styles.total}>{money(total)}</Text><Text style={styles.muted}>Price is calculated again by the server before checkout.</Text></View>

        <Text style={styles.sectionTitle}>3. Your details</Text>
        <TextInput value={name} onChangeText={setName} placeholder="Full name" autoComplete="name" style={styles.input} placeholderTextColor="#89958D" />
        <TextInput value={email} onChangeText={setEmail} placeholder="Email address" autoComplete="email" keyboardType="email-address" autoCapitalize="none" style={styles.input} placeholderTextColor="#89958D" />
        <TextInput value={phone} onChangeText={(value) => setPhone(value.replace(/\D/g, '').slice(0, 10))} placeholder="10-digit mobile number" autoComplete="tel" keyboardType="phone-pad" maxLength={10} style={styles.input} placeholderTextColor="#89958D" />

        <Text style={styles.sectionTitle}>4. Choose how to continue</Text>
        <Pressable disabled={submitting || slots.length === 0} onPress={payFullAmount} style={[styles.primary, (submitting || slots.length === 0) && styles.disabled]}><Text style={styles.primaryText}>{submitting ? 'Please wait…' : `Pay full amount · ${money(total)}`}</Text></Pressable>
        <Pressable disabled={submitting || slots.length === 0} onPress={submitInterest} style={[styles.secondary, (submitting || slots.length === 0) && styles.disabled]}><Text style={styles.secondaryText}>I’m interested — ₹0</Text></Pressable>
        <Text style={styles.footnote}>Full payment uses Razorpay native checkout. A ₹0 enquiry does not charge you or reserve seats. Your booking is confirmed only after the server verifies payment.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.paper },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 48, maxWidth: 720, width: '100%', alignSelf: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 12 },
  back: { alignSelf: 'flex-start', paddingVertical: 12, marginBottom: 14 },
  backText: { color: COLORS.forest, fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  eyebrow: { color: COLORS.forestLight, fontSize: 10, fontWeight: '900', letterSpacing: 1.8, marginBottom: 8 },
  title: { color: COLORS.ink, fontSize: 30, lineHeight: 36, fontWeight: '900' },
  subtitle: { color: COLORS.muted, fontSize: 14, lineHeight: 21, marginTop: 10, marginBottom: 22 },
  sectionTitle: { color: COLORS.ink, fontSize: 17, fontWeight: '900', marginTop: 24, marginBottom: 12 },
  slot: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.line, borderRadius: 14, padding: 15, marginBottom: 9 },
  slotSelected: { borderColor: COLORS.forestLight, backgroundColor: '#E8EDE2' },
  slotCopy: { flex: 1, gap: 4 },
  slotDate: { color: COLORS.ink, fontSize: 14, fontWeight: '800' },
  radio: { color: COLORS.forest, fontSize: 20, marginLeft: 12 },
  counter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.line, borderRadius: 14, padding: 14 },
  counterControls: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  counterButton: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: '#E8EDE2' },
  counterButtonText: { color: COLORS.forest, fontSize: 22, fontWeight: '700' },
  count: { color: COLORS.ink, fontSize: 17, fontWeight: '900' },
  totalCard: { backgroundColor: COLORS.forest, borderRadius: 16, padding: 17, marginTop: 12, gap: 5 },
  total: { color: COLORS.white, fontSize: 27, fontWeight: '900' },
  input: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.line, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, marginBottom: 11, color: COLORS.ink, fontSize: 14 },
  primary: { backgroundColor: COLORS.forest, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 4 },
  primaryText: { color: COLORS.white, fontSize: 14, fontWeight: '900' },
  secondary: { borderWidth: 1, borderColor: COLORS.forest, borderRadius: 14, padding: 15, alignItems: 'center', marginTop: 10 },
  secondaryText: { color: COLORS.forest, fontSize: 14, fontWeight: '900' },
  infoCard: { backgroundColor: COLORS.white, borderRadius: 14, padding: 16 },
  body: { color: COLORS.ink, fontSize: 14, lineHeight: 20 },
  muted: { color: COLORS.muted, fontSize: 12, lineHeight: 18 },
  footnote: { color: COLORS.muted, fontSize: 11, lineHeight: 17, marginTop: 15, textAlign: 'center' },
  disabled: { opacity: 0.45 },
});
