import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@groupfit/shared/theme';

const DEFAULT_FAQS = [
  { id: '1', question: 'How do I book a session?', description: 'Go to Activities or find a trainer, choose a time slot, and confirm your booking. You can also join existing groups from the Groups section.' },
  { id: '2', question: 'How do I cancel or reschedule?', description: 'Open your session from Upcoming Sessions or My Sessions and use the cancel or reschedule option. Please check the cancellation policy for your booking.' },
  { id: '3', question: 'Where can I see my payment history?', description: 'Go to Account or Profile and tap Payment History to see all your past payments and invoices.' },
];

const CONTACT_LIST = [
  { heading: 'Customer service', link: 'https://groupfit.edifybiz.com' },
  { heading: 'Facebook', link: 'https://www.facebook.com' },
  { heading: 'Instagram', link: 'https://www.instagram.com' },
  { heading: 'Twitter', link: 'https://twitter.com' },
];

export default function HelpCentreScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<'FAQs' | 'Contactus'>('FAQs');
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      <View style={styles.topbar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Help Centre</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'FAQs' && styles.tabActive]}
          onPress={() => setTab('FAQs')}
        >
          <Text style={[styles.tabText, tab === 'FAQs' && styles.tabTextActive]}>FAQs</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'Contactus' && styles.tabActive]}
          onPress={() => setTab('Contactus')}
        >
          <Text style={[styles.tabText, tab === 'Contactus' && styles.tabTextActive]}>Contact us</Text>
        </TouchableOpacity>
      </View>

      {tab === 'FAQs' && (
        <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={false}>
          {DEFAULT_FAQS.map((faq) => (
            <View key={faq.id} style={styles.faqItem}>
              <TouchableOpacity
                style={styles.faqQuestion}
                onPress={() => setOpenFaqId(openFaqId === faq.id ? null : faq.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.faqQuestionText}>{faq.question}</Text>
                <Text style={styles.faqChevron}>{openFaqId === faq.id ? '−' : '+'}</Text>
              </TouchableOpacity>
              {openFaqId === faq.id && (
                <View style={styles.faqAnswer}>
                  <Text style={styles.faqAnswerText}>{faq.description}</Text>
                </View>
              )}
            </View>
          ))}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {tab === 'Contactus' && (
        <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={false}>
          {CONTACT_LIST.map((item) => (
            <TouchableOpacity
              key={item.heading}
              style={styles.contactItem}
              onPress={() => Linking.openURL(item.link)}
              activeOpacity={0.7}
            >
              <Text style={styles.contactHeading}>{item.heading}</Text>
              <Text style={styles.contactChevron}>›</Text>
            </TouchableOpacity>
          ))}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primaryLight },
  topbar: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  back: { fontSize: 14, color: colors.secondary, fontWeight: '600' },
  title: { fontSize: 20, fontWeight: '600', color: colors.black },
  tabs: { flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: colors.borderLight, paddingHorizontal: 20 },
  tab: { paddingVertical: 12, paddingHorizontal: 20, marginBottom: -2, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: colors.secondary },
  tabText: { fontSize: 14, fontWeight: '700', color: colors.greyDark },
  tabTextActive: { color: colors.secondary },
  content: { flex: 1 },
  contentInner: { padding: 20, paddingBottom: 24 },
  faqItem: { borderWidth: 1, borderColor: colors.borderLight, borderRadius: 10, marginBottom: 12, overflow: 'hidden' },
  faqQuestion: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, backgroundColor: colors.white },
  faqQuestionText: { fontSize: 16, fontWeight: '500', color: colors.black, flex: 1 },
  faqChevron: { fontSize: 18, color: colors.grey, marginLeft: 8 },
  faqAnswer: { padding: 12, paddingTop: 0, borderTopWidth: 1, borderTopColor: colors.borderLight },
  faqAnswerText: { fontSize: 14, color: colors.grey, lineHeight: 22 },
  contactItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderWidth: 1, borderColor: colors.borderLight, borderRadius: 10, marginBottom: 12, backgroundColor: colors.white, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 2 },
  contactHeading: { fontSize: 16, fontWeight: '500', color: colors.black },
  contactChevron: { fontSize: 18, color: colors.secondary, fontWeight: '600' },
});
