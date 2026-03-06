import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@groupfit/shared/theme';
import { trainerApi } from '../../lib/api';

const DEFAULT_FAQS: { id: string; question: string; description: string }[] = [
  { id: '1', question: 'How do I create a session?', description: 'Go to Sessions and tap Create. Choose activity, date, time, and location.' },
  { id: '2', question: 'How do I get paid?', description: 'Add your bank details in Account → Bank Details to receive payments.' },
  { id: '3', question: 'Where can I see my reviews?', description: 'Go to Account or Profile and open Reviews to see feedback from customers.' },
];

const FALLBACK_CONTACT = [{ heading: 'Customer service', link: 'https://trainer.groupfitapp.com' }];

type ContactItem = { heading: string; link: string };

export default function HelpCentreScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<'FAQs' | 'Contactus' | 'Support'>('FAQs');
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);
  const [faqs, setFaqs] = useState(DEFAULT_FAQS);
  const [contactLinks, setContactLinks] = useState<ContactItem[]>(FALLBACK_CONTACT);
  const [loading, setLoading] = useState(true);
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSubmitting, setSupportSubmitting] = useState(false);
  const [supportSuccess, setSupportSuccess] = useState(false);
  const [supportError, setSupportError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([trainerApi.faqlist(), trainerApi.fetchContactLink()])
      .then(([faqRes, contactRes]) => {
        if (cancelled) return;
        const faqData = faqRes?.data as Record<string, unknown> | undefined;
        const contactData = contactRes?.data as Record<string, unknown> | undefined;
        const faqList = (faqData?.faqlist ?? faqData?.list) as { id: string; question: string; answer: string }[] | undefined;
        if (faqList?.length) {
          setFaqs(faqList.map((f) => ({ id: f.id, question: f.question, description: f.answer })));
        }
        const email = contactData?.contactEmail as string | undefined;
        if (email) {
          setContactLinks([{ heading: 'Email support', link: `mailto:${email}` }, ...FALLBACK_CONTACT]);
        } else {
          setContactLinks(FALLBACK_CONTACT);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const handleSupportSubmit = () => {
    const message = supportMessage.trim();
    if (!message) return;
    setSupportSubmitting(true);
    setSupportError(null);
    trainerApi
      .raiseSupport({ subject: supportSubject.trim() || undefined, message })
      .then((res) => {
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'success') {
          setSupportSuccess(true);
          setSupportSubject('');
          setSupportMessage('');
        } else {
          setSupportError(String(data?.message ?? 'Something went wrong'));
        }
      })
      .catch(() => setSupportError('Failed to send. Please try again.'))
      .finally(() => setSupportSubmitting(false));
  };

  return (
    <View style={styles.container}>
      <View style={styles.topbar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Help Centre</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, tab === 'FAQs' && styles.tabActive]} onPress={() => setTab('FAQs')}>
          <Text style={[styles.tabText, tab === 'FAQs' && styles.tabTextActive]}>FAQs</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'Contactus' && styles.tabActive]} onPress={() => setTab('Contactus')}>
          <Text style={[styles.tabText, tab === 'Contactus' && styles.tabTextActive]}>Contact us</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'Support' && styles.tabActive]}
          onPress={() => { setTab('Support'); setSupportSuccess(false); setSupportError(null); }}
        >
          <Text style={[styles.tabText, tab === 'Support' && styles.tabTextActive]}>Support</Text>
        </TouchableOpacity>
      </View>

      {tab === 'FAQs' && (
        <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
          {loading ? (
            <ActivityIndicator size="small" color={colors.secondary} style={styles.loader} />
          ) : faqs.length === 0 ? (
            <Text style={styles.empty}>Currently unavailable.</Text>
          ) : (
            faqs.map((faq) => (
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
            ))
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {tab === 'Contactus' && (
        <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
          {contactLinks.length === 0 ? (
            <Text style={styles.empty}>Currently unavailable.</Text>
          ) : (
            contactLinks.map((item) => (
              <TouchableOpacity
                key={item.heading}
                style={styles.contactItem}
                onPress={() => Linking.openURL(item.link)}
                activeOpacity={0.7}
              >
                <Text style={styles.contactHeading}>{item.heading}</Text>
                <Text style={styles.contactChevron}>›</Text>
              </TouchableOpacity>
            ))
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {tab === 'Support' && (
        <ScrollView style={styles.content} contentContainerStyle={[styles.contentInner, { maxWidth: 480 }]}>
          {supportSuccess ? (
            <Text style={styles.supportSuccess}>Your message has been sent. We&apos;ll get back to you soon.</Text>
          ) : (
            <>
              <Text style={styles.label}>Subject (optional)</Text>
              <TextInput
                style={styles.input}
                value={supportSubject}
                onChangeText={setSupportSubject}
                placeholder="e.g. Billing question"
                placeholderTextColor={colors.grey}
                editable={!supportSubmitting}
              />
              <Text style={styles.label}>Message *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={supportMessage}
                onChangeText={setSupportMessage}
                placeholder="Describe your issue or question…"
                placeholderTextColor={colors.grey}
                multiline
                numberOfLines={4}
                editable={!supportSubmitting}
              />
              {supportError ? <Text style={styles.supportError}>{supportError}</Text> : null}
              <TouchableOpacity
                style={[styles.primaryButton, supportSubmitting && styles.buttonDisabled]}
                onPress={handleSupportSubmit}
                disabled={supportSubmitting || !supportMessage.trim()}
              >
                <Text style={styles.primaryButtonText}>{supportSubmitting ? 'Sending…' : 'Send'}</Text>
              </TouchableOpacity>
            </>
          )}
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
  tab: { paddingVertical: 12, paddingHorizontal: 16, marginBottom: -2, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: colors.secondary },
  tabText: { fontSize: 14, fontWeight: '700', color: colors.grey },
  tabTextActive: { color: colors.secondary },
  content: { flex: 1 },
  contentInner: { padding: 20, paddingBottom: 24 },
  loader: { marginVertical: 20 },
  empty: { fontSize: 16, color: colors.grey },
  faqItem: { borderWidth: 1, borderColor: colors.borderLight, borderRadius: 10, marginBottom: 12, overflow: 'hidden' },
  faqQuestion: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, backgroundColor: colors.white },
  faqQuestionText: { fontSize: 16, fontWeight: '500', color: colors.black, flex: 1 },
  faqChevron: { fontSize: 18, color: colors.grey, marginLeft: 8 },
  faqAnswer: { padding: 12, paddingTop: 0, borderTopWidth: 1, borderTopColor: colors.borderLight },
  faqAnswerText: { fontSize: 14, color: colors.grey, lineHeight: 22 },
  contactItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderWidth: 1, borderColor: colors.borderLight, borderRadius: 10, marginBottom: 12, backgroundColor: colors.white },
  contactHeading: { fontSize: 16, fontWeight: '500', color: colors.black },
  contactChevron: { fontSize: 18, color: colors.secondary, fontWeight: '600' },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  input: { borderWidth: 1, borderColor: colors.borderLight, borderRadius: 6, padding: 10, marginBottom: 12, fontSize: 16, color: colors.black },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  supportError: { color: '#c00', marginBottom: 12, fontSize: 14 },
  supportSuccess: { fontSize: 16, color: colors.secondary, fontWeight: '600', marginBottom: 16 },
  primaryButton: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, backgroundColor: colors.secondary, alignSelf: 'flex-start' },
  primaryButtonText: { color: '#fff', fontWeight: '600' },
  buttonDisabled: { opacity: 0.7 },
});
