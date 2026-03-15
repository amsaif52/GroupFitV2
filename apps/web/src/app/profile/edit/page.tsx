'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getStoredUser } from '@/lib/auth';
import { customerApi, trainerApi } from '@/lib/api';
import { COUNTRY_CODES, CountryCode, getSubdivisionsForCountry, ROLES } from '@groupfit/shared';
import { getApiErrorMessage } from '@groupfit/shared';
import { CloudinaryUploadButton } from '@/components/CloudinaryUploadButton';
import { CustomerLayout } from '../../CustomerLayout';
import { CustomerHeader } from '@/components/CustomerHeader';
import { TrainerLayout } from '../../TrainerLayout';
import { ROUTES } from '../../routes';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

type AddressComponents = { long_name: string; short_name: string; types: string[] }[];

function getAddressComponent(
  components: AddressComponents,
  type: string,
  useShort = false
): string {
  const c = components.find((x) => x.types.includes(type));
  if (!c) return '';
  return useShort ? c.short_name : c.long_name;
}

function parsePlaceAddress(place: { address_components?: AddressComponents }): {
  streetLine1: string;
  streetLine2: string;
  city: string;
  state: string;
  postalCode: string;
  countryCode: string;
} {
  const comp = place.address_components ?? [];
  const streetNumber = getAddressComponent(comp, 'street_number');
  const route = getAddressComponent(comp, 'route');
  const streetLine1 = [streetNumber, route].filter(Boolean).join(' ').trim();
  const subpremise = getAddressComponent(comp, 'subpremise');
  const streetLine2 = subpremise || getAddressComponent(comp, 'premise') || '';
  const city =
    getAddressComponent(comp, 'locality') ||
    getAddressComponent(comp, 'sublocality') ||
    getAddressComponent(comp, 'sublocality_level_1');
  const stateShort = getAddressComponent(comp, 'administrative_area_level_1', true);
  const stateLong = getAddressComponent(comp, 'administrative_area_level_1', false);
  const state = stateShort || stateLong;
  const postalCode = getAddressComponent(comp, 'postal_code');
  const countryCode = getAddressComponent(comp, 'country', true) || '';
  return { streetLine1, streetLine2, city, state, postalCode, countryCode };
}

type ServiceAreaItem = {
  id: string;
  label: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  radiusKm?: number | null;
  isActive: boolean;
  createdAt: string;
};

const AVAILABILITY_DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const AVAILABILITY_TIME_STEP_MINUTES = 15;

function getAvailabilityTimeOptions(): string[] {
  const options: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += AVAILABILITY_TIME_STEP_MINUTES) {
      options.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }
  return options;
}

const AVAILABILITY_TIME_OPTIONS = getAvailabilityTimeOptions();

function formatAvailabilityTime(s: string): string {
  if (!s) return '';
  const match = /^(\d{1,2}):(\d{2})/.exec(s);
  if (match) {
    const h = parseInt(match[1], 10);
    const m = parseInt(match[2] || '0', 10);
    const totalMins = h * 60 + m;
    const stepped =
      Math.round(totalMins / AVAILABILITY_TIME_STEP_MINUTES) * AVAILABILITY_TIME_STEP_MINUTES;
    const steppedH = Math.floor(stepped / 60) % 24;
    const steppedM = stepped % 60;
    return `${String(steppedH).padStart(2, '0')}:${String(steppedM).padStart(2, '0')}`;
  }
  if (s.length >= 5 && s[2] === ':') return s.slice(0, 5);
  return s;
}

type AvailabilitySlotItem = {
  id: string;
  serviceAreaId?: string | null;
  serviceAreaLabel?: string | null;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  createdAt: string;
};

type CertItem = {
  id: string;
  name: string;
  issuingOrganization?: string | null;
  issuedAt?: string | null;
  credentialId?: string | null;
  documentUrl?: string | null;
  createdAt: string;
};

const GENDER_OPTIONS = [
  { value: '', label: 'Select…' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

const customerProfileSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().optional(),
  gender: z.string().optional(),
  dateOfBirth: z.string().optional(),
  heightCm: z
    .union([z.number(), z.nan()])
    .optional()
    .transform((v) =>
      v === undefined || (typeof v === 'number' && Number.isNaN(v)) ? undefined : v
    ),
  weightKg: z
    .union([z.number(), z.nan()])
    .optional()
    .transform((v) =>
      v === undefined || (typeof v === 'number' && Number.isNaN(v)) ? undefined : v
    ),
  preExistingConditions: z.string().optional(),
});

const trainerProfileSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().optional(),
  locale: z.string().optional(),
  countryCode: z.string().optional(),
  state: z.string().optional(),
  gender: z.string().optional(),
  dateOfBirth: z.string().optional(),
  streetLine1: z.string().optional(),
  streetLine2: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  languageSpoken: z.string().optional(),
  about: z.string().optional(),
  yearsExperience: z
    .union([z.number(), z.nan()])
    .optional()
    .transform((v) =>
      v === undefined || (typeof v === 'number' && Number.isNaN(v)) ? undefined : v
    ),
  gstRegistered: z
    .union([z.boolean(), z.literal('on')])
    .optional()
    .transform((v) => (v === true || v === 'on' ? true : v === false ? false : undefined)),
});

type CustomerProfileFormValues = z.infer<typeof customerProfileSchema>;
type TrainerProfileFormValues = z.infer<typeof trainerProfileSchema>;

const customerDefaultValues: CustomerProfileFormValues = {
  name: '',
  email: '',
  phone: '',
  avatarUrl: '',
  gender: '',
  dateOfBirth: '',
  heightCm: undefined,
  weightKg: undefined,
  preExistingConditions: '',
};

const trainerDefaultValues: TrainerProfileFormValues = {
  name: '',
  email: '',
  phone: '',
  avatarUrl: '',
  locale: 'en',
  countryCode: '',
  state: '',
  gender: '',
  dateOfBirth: '',
  streetLine1: '',
  streetLine2: '',
  city: '',
  postalCode: '',
  languageSpoken: '',
  about: '',
  yearsExperience: undefined,
  gstRegistered: false,
};

export default function ProfileEditPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string>(ROLES.CUSTOMER);

  const customerForm = useForm<CustomerProfileFormValues>({
    resolver: zodResolver(customerProfileSchema),
    defaultValues: customerDefaultValues,
  });

  const trainerForm = useForm<TrainerProfileFormValues>({
    resolver: zodResolver(trainerProfileSchema),
    defaultValues: trainerDefaultValues,
  });

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const trainerAddressInputRef = useRef<HTMLInputElement | null>(null);
  const trainerAutocompleteRef = useRef<unknown>(null);
  const [addressEntryMethod, setAddressEntryMethod] = useState<'google' | 'manual'>('manual');
  const countryCode = trainerForm.watch('countryCode');
  const stateOptions = countryCode ? getSubdivisionsForCountry(countryCode) : undefined;
  const streetLine1Register = trainerForm.register('streetLine1');
  const trainerUser = role === ROLES.TRAINER ? getStoredUser() : null;
  const trainerProfileUrl = trainerUser?.sub ? ROUTES.trainerDetail(trainerUser.sub) : null;
  const [socialModalOpen, setSocialModalOpen] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [socialSaving, setSocialSaving] = useState(false);
  const [socialFacebookId, setSocialFacebookId] = useState('');
  const [socialInstagramId, setSocialInstagramId] = useState('');
  const [socialTiktokId, setSocialTiktokId] = useState('');
  const [socialTwitterId, setSocialTwitterId] = useState('');
  const [socialYoutubeId, setSocialYoutubeId] = useState('');
  const [imagesModalOpen, setImagesModalOpen] = useState(false);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [imagesSaving, setImagesSaving] = useState(false);
  const [imagesList, setImagesList] = useState<{ id?: string; imageUrl: string }[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [serviceLocationsModalOpen, setServiceLocationsModalOpen] = useState(false);
  const [serviceLocationsList, setServiceLocationsList] = useState<ServiceAreaItem[]>([]);
  const [serviceLocationsLoading, setServiceLocationsLoading] = useState(false);
  const [serviceLocationsError, setServiceLocationsError] = useState<string | null>(null);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingServiceArea, setEditingServiceArea] = useState<ServiceAreaItem | null>(null);
  const [serviceFormLabel, setServiceFormLabel] = useState('');
  const [serviceFormAddress, setServiceFormAddress] = useState('');
  const [serviceFormLatitude, setServiceFormLatitude] = useState('');
  const [serviceFormLongitude, setServiceFormLongitude] = useState('');
  const [serviceFormRadiusKm, setServiceFormRadiusKm] = useState('');
  const [serviceFormCountryCode, setServiceFormCountryCode] = useState('');
  const [serviceLocationEntryMethod, setServiceLocationEntryMethod] = useState<'google' | 'manual'>(
    'manual'
  );
  const [serviceSubmitLoading, setServiceSubmitLoading] = useState(false);
  const [serviceActionId, setServiceActionId] = useState<string | null>(null);
  const serviceAddressInputRef = useRef<HTMLInputElement | null>(null);
  const serviceAutocompleteRef = useRef<unknown>(null);
  const [availabilityModalOpen, setAvailabilityModalOpen] = useState(false);
  const [availabilityList, setAvailabilityList] = useState<AvailabilitySlotItem[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [showAvailabilityForm, setShowAvailabilityForm] = useState(false);
  const [editingAvailability, setEditingAvailability] = useState<AvailabilitySlotItem | null>(null);
  const [availabilityFormDay, setAvailabilityFormDay] = useState(1);
  const [availabilityFormStart, setAvailabilityFormStart] = useState('09:00');
  const [availabilityFormEnd, setAvailabilityFormEnd] = useState('17:00');
  const [availabilityFormServiceAreaId, setAvailabilityFormServiceAreaId] = useState('');
  const [availabilityServiceAreas, setAvailabilityServiceAreas] = useState<
    { id: string; label: string; isActive: boolean }[]
  >([]);
  const [availabilitySubmitLoading, setAvailabilitySubmitLoading] = useState(false);
  const [availabilityActionId, setAvailabilityActionId] = useState<string | null>(null);

  const [missingRequiredFields, setMissingRequiredFields] = useState<string[]>([]);
  const [specializationsCount, setSpecializationsCount] = useState<number>(0);
  const [hasSocialLinks, setHasSocialLinks] = useState(false);

  const [certificationsModalOpen, setCertificationsModalOpen] = useState(false);
  const [certList, setCertList] = useState<CertItem[]>([]);
  const [certLoading, setCertLoading] = useState(false);
  const [certError, setCertError] = useState<string | null>(null);
  const [showCertForm, setShowCertForm] = useState(false);
  const [editingCert, setEditingCert] = useState<CertItem | null>(null);
  const [certFormName, setCertFormName] = useState('');
  const [certFormDocumentUrl, setCertFormDocumentUrl] = useState('');
  const [certSubmitLoading, setCertSubmitLoading] = useState(false);
  const [certActionId, setCertActionId] = useState<string | null>(null);

  useEffect(() => {
    const user = getStoredUser();
    if (!user) {
      router.replace('/login');
      return;
    }
    const isTrainer = user.role === ROLES.TRAINER || user.role === ROLES.ADMIN;
    setRole(isTrainer ? ROLES.TRAINER : ROLES.CUSTOMER);
    const api = isTrainer ? trainerApi : customerApi;
    let cancelled = false;
    (async () => {
      try {
        const res = await api.viewProfile();
        const data = res.data as Record<string, unknown> & {
          mtype?: string;
          name?: string;
          emailid?: string;
          phone?: string;
          locale?: string;
          countryCode?: string;
          state?: string;
          avatarUrl?: string;
          gender?: string;
          dateOfBirth?: string;
          heightCm?: number;
          weightKg?: number;
          preExistingConditions?: string;
          missingRequiredFields?: string[];
        };
        if (!cancelled && data?.mtype === 'success') {
          if (isTrainer) {
            setMissingRequiredFields(
              Array.isArray(data.missingRequiredFields) ? data.missingRequiredFields : []
            );
            const dob = data.dateOfBirth as string | undefined;
            trainerForm.reset({
              name: (data.name as string) ?? '',
              email: (data.emailid as string) ?? '',
              phone: (data.phone as string) ?? '',
              avatarUrl: (data.avatarUrl as string) ?? '',
              locale: (data.locale as string) ?? 'en',
              countryCode: (data.countryCode as string) ?? '',
              state: (data.state as string) ?? '',
              gender: (data.gender as string) ?? '',
              dateOfBirth: dob ? dob.slice && dob.slice(0, 10) : '',
              streetLine1: (data.streetLine1 as string) ?? '',
              streetLine2: (data.streetLine2 as string) ?? '',
              city: (data.city as string) ?? '',
              postalCode: (data.postalCode as string) ?? '',
              languageSpoken: (data.languageSpoken as string) ?? '',
              about: (data.about as string) ?? '',
              yearsExperience:
                data.yearsExperience != null ? Number(data.yearsExperience) : undefined,
              gstRegistered: Boolean(data.gstRegistered),
            });
          } else {
            setMissingRequiredFields([]);
            customerForm.reset({
              name: (data.name as string) ?? '',
              email: (data.emailid as string) ?? '',
              phone: (data.phone as string) ?? '',
              avatarUrl: (data.avatarUrl as string) ?? '',
              gender: (data.gender as string) ?? '',
              dateOfBirth: (data.dateOfBirth as string) ?? '',
              heightCm: data.heightCm ?? undefined,
              weightKg: data.weightKg ?? undefined,
              preExistingConditions: (data.preExistingConditions as string) ?? '',
            });
          }
        }
      } catch (e) {
        if (!cancelled) setSubmitError(getApiErrorMessage(e, 'Failed to load profile'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router, customerForm.reset, trainerForm.reset]);

  // Fetch section counts for trainer so Personal information can show Required/Optional and Complete/Missing
  useEffect(() => {
    if (role !== ROLES.TRAINER) return;
    trainerApi
      .trainerServiceList()
      .then((res) => {
        const data = res?.data as Record<string, unknown> | undefined;
        const list = (data?.trainerServiceList ?? data?.list) as ServiceAreaItem[] | undefined;
        setServiceLocationsList(Array.isArray(list) ? list : []);
      })
      .catch(() => {});
    trainerApi
      .viewListAllAvailabilty()
      .then((res) => {
        const data = res?.data as Record<string, unknown> | undefined;
        const list = (data?.availabilityList ?? data?.list) as AvailabilitySlotItem[] | undefined;
        setAvailabilityList(Array.isArray(list) ? list : []);
      })
      .catch(() => {});
    trainerApi
      .trainerActivityList()
      .then((res) => {
        const data = res?.data as { trainerActivityList?: unknown[]; list?: unknown[] };
        const list = data?.trainerActivityList ?? data?.list ?? [];
        setSpecializationsCount(Array.isArray(list) ? list.length : 0);
      })
      .catch(() => setSpecializationsCount(0));
    trainerApi
      .trainerCertificateList()
      .then((res) => {
        const data = res?.data as { trainerCertificateList?: CertItem[]; list?: CertItem[] };
        const list = data?.trainerCertificateList ?? data?.list ?? [];
        setCertList(Array.isArray(list) ? list : []);
      })
      .catch(() => {});
    trainerApi
      .getTrainerImages()
      .then((res) => {
        const data = res?.data as { images?: { id: string; imageUrl: string }[] };
        setImagesList(
          Array.isArray(data?.images)
            ? data.images.map((img) => ({ id: img.id, imageUrl: img.imageUrl }))
            : []
        );
      })
      .catch(() => {});
    trainerApi
      .getSocialLinks()
      .then((res) => {
        const data = res?.data as { socialLinks?: Record<string, string | null> };
        const s = data?.socialLinks;
        const any =
          s && (s.facebookId || s.instagramId || s.tiktokId || s.twitterId || s.youtubeId);
        setHasSocialLinks(Boolean(any));
      })
      .catch(() => setHasSocialLinks(false));
  }, [role]);

  const { onChange: countryOnChange, ...countryRegister } = trainerForm.register('countryCode');
  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    countryOnChange(e);
    trainerForm.setValue('state', '');
  };

  // Load trainer social media links when modal opens
  useEffect(() => {
    if (!socialModalOpen || role !== ROLES.TRAINER) return;
    setSocialLoading(true);
    trainerApi
      .getSocialLinks()
      .then((res) => {
        const data = res?.data as {
          mtype?: string;
          socialLinks?: {
            facebookId?: string | null;
            instagramId?: string | null;
            tiktokId?: string | null;
            twitterId?: string | null;
            youtubeId?: string | null;
          };
        };
        if (data?.mtype === 'success' && data.socialLinks) {
          setSocialFacebookId(data.socialLinks.facebookId ?? '');
          setSocialInstagramId(data.socialLinks.instagramId ?? '');
          setSocialTiktokId(data.socialLinks.tiktokId ?? '');
          setSocialTwitterId(data.socialLinks.twitterId ?? '');
          setSocialYoutubeId(data.socialLinks.youtubeId ?? '');
        }
      })
      .catch(() => {
        // ignore; modal will just show empty fields
      })
      .finally(() => setSocialLoading(false));
  }, [socialModalOpen, role]);

  // Load trainer additional images when modal opens
  useEffect(() => {
    if (!imagesModalOpen || role !== ROLES.TRAINER) return;
    setImagesLoading(true);
    trainerApi
      .getTrainerImages()
      .then((res) => {
        const data = res?.data as { mtype?: string; images?: { id: string; imageUrl: string }[] };
        if (data?.mtype === 'success' && Array.isArray(data.images)) {
          setImagesList(data.images.map((img) => ({ id: img.id, imageUrl: img.imageUrl })));
        } else {
          setImagesList([]);
        }
      })
      .catch(() => setImagesList([]))
      .finally(() => setImagesLoading(false));
  }, [imagesModalOpen, role]);

  const fetchServiceLocationsList = () => {
    trainerApi
      .trainerServiceList()
      .then((res) => {
        const data = res?.data as Record<string, unknown> | undefined;
        if (data?.mtype === 'error') {
          setServiceLocationsError(String(data.message ?? 'Failed to load'));
          setServiceLocationsList([]);
        } else {
          const areaList = (data?.trainerServiceList ?? data?.list) as
            | ServiceAreaItem[]
            | undefined;
          setServiceLocationsList(areaList ?? []);
          setServiceLocationsError(null);
        }
      })
      .catch((err) => {
        setServiceLocationsError(getApiErrorMessage(err, 'Failed to load service areas'));
        setServiceLocationsList([]);
      })
      .finally(() => setServiceLocationsLoading(false));
  };

  useEffect(() => {
    if (!serviceLocationsModalOpen || role !== ROLES.TRAINER) return;
    setServiceLocationsLoading(true);
    fetchServiceLocationsList();
  }, [serviceLocationsModalOpen, role]);

  const fetchAvailabilityList = () => {
    trainerApi
      .viewListAllAvailabilty()
      .then((res) => {
        const data = res?.data as Record<string, unknown> | undefined;
        if (data?.mtype === 'error') {
          setAvailabilityError(String(data.message ?? 'Failed to load'));
          setAvailabilityList([]);
        } else {
          const slots = (data?.availabilityList ?? data?.list) as
            | AvailabilitySlotItem[]
            | undefined;
          setAvailabilityList(slots ?? []);
          setAvailabilityError(null);
        }
      })
      .catch((err) => {
        setAvailabilityError(getApiErrorMessage(err, 'Failed to load availability'));
        setAvailabilityList([]);
      })
      .finally(() => setAvailabilityLoading(false));
  };

  useEffect(() => {
    if (!availabilityModalOpen || role !== ROLES.TRAINER) return;
    setAvailabilityLoading(true);
    fetchAvailabilityList();
    trainerApi
      .trainerServiceList()
      .then((res) => {
        const data = res?.data as Record<string, unknown> | undefined;
        const areas = (data?.trainerServiceList ?? data?.list) as
          | { id: string; label: string; isActive: boolean }[]
          | undefined;
        setAvailabilityServiceAreas(
          (areas ?? [])
            .filter((a) => a.isActive !== false)
            .map((a) => ({ id: a.id, label: a.label, isActive: a.isActive }))
        );
      })
      .catch(() => setAvailabilityServiceAreas([]));
  }, [availabilityModalOpen, role]);

  // Google Places Autocomplete for service location address (when modal form shown + "Search with Google", restricted by country)
  useEffect(() => {
    if (
      !serviceLocationsModalOpen ||
      !showServiceForm ||
      !GOOGLE_MAPS_API_KEY ||
      serviceLocationEntryMethod !== 'google'
    )
      return;
    const inputEl = serviceAddressInputRef.current;
    if (!inputEl) return;
    const inputForAutocomplete: HTMLInputElement = inputEl;
    const country = serviceFormCountryCode?.trim().toLowerCase();
    const componentRestrictions = country ? { country } : undefined;

    function initAutocomplete() {
      const win =
        typeof window !== 'undefined'
          ? (window as unknown as {
              google?: {
                maps: {
                  places: {
                    Autocomplete: new (
                      el: HTMLInputElement,
                      opts?: { types?: string[]; componentRestrictions?: { country: string } }
                    ) => {
                      addListener: (ev: string, fn: () => void) => void;
                      getPlace: () => {
                        formatted_address?: string;
                        geometry?: { location: { lat: () => number; lng: () => number } };
                      };
                    };
                  };
                };
              };
            })
          : null;
      const g = win?.google;
      if (!g?.maps?.places?.Autocomplete) return;
      const Autocomplete = g.maps.places.Autocomplete;
      const autocomplete = new Autocomplete(inputForAutocomplete, {
        types: ['address'],
        ...(componentRestrictions && { componentRestrictions }),
      });
      serviceAutocompleteRef.current = autocomplete;
      autocomplete.addListener('place_changed', () => {
        const place = (
          autocomplete as {
            getPlace: () => {
              formatted_address?: string;
              geometry?: { location: { lat: () => number; lng: () => number } };
            };
          }
        ).getPlace();
        if (place.formatted_address) setServiceFormAddress(place.formatted_address);
        if (place.geometry?.location) {
          setServiceFormLatitude(String(place.geometry.location.lat()));
          setServiceFormLongitude(String(place.geometry.location.lng()));
        }
      });
    }

    if ((window as unknown as { google?: unknown }).google) {
      initAutocomplete();
      return () => {
        serviceAutocompleteRef.current = null;
      };
    }
    const scriptId = 'google-maps-places-service-modal';
    if (document.getElementById(scriptId)) {
      if ((window as unknown as { google?: unknown }).google) initAutocomplete();
      return () => {
        serviceAutocompleteRef.current = null;
      };
    }
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => initAutocomplete();
    document.head.appendChild(script);
    return () => {
      serviceAutocompleteRef.current = null;
    };
  }, [
    serviceLocationsModalOpen,
    showServiceForm,
    serviceLocationEntryMethod,
    serviceFormCountryCode,
  ]);

  // Google Places Autocomplete for trainer address (only when "Search with Google" and country set; restricts by country)
  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY || addressEntryMethod !== 'google') return;
    const inputEl = trainerAddressInputRef.current;
    if (!inputEl) return;
    const inputForAutocomplete: HTMLInputElement = inputEl;
    const country = countryCode?.trim().toLowerCase();
    const componentRestrictions = country ? { country: country } : undefined;

    function initAutocomplete() {
      const win =
        typeof window !== 'undefined'
          ? (window as unknown as {
              google?: {
                maps: {
                  places: {
                    Autocomplete: new (
                      el: HTMLInputElement,
                      opts?: { types?: string[]; componentRestrictions?: { country: string } }
                    ) => {
                      addListener: (ev: string, fn: () => void) => void;
                      getPlace: () => { address_components?: AddressComponents };
                    };
                  };
                };
              };
            })
          : null;
      const g = win?.google;
      if (!g?.maps?.places?.Autocomplete) return;
      const Autocomplete = g.maps.places.Autocomplete;
      const autocomplete = new Autocomplete(inputForAutocomplete, {
        types: ['address'],
        ...(componentRestrictions && { componentRestrictions }),
      });
      trainerAutocompleteRef.current = autocomplete;
      autocomplete.addListener('place_changed', () => {
        const place = (
          autocomplete as { getPlace: () => { address_components?: AddressComponents } }
        ).getPlace();
        if (!place?.address_components) return;
        const parsed = parsePlaceAddress(place);
        trainerForm.setValue('streetLine1', parsed.streetLine1);
        trainerForm.setValue('streetLine2', parsed.streetLine2);
        trainerForm.setValue('city', parsed.city);
        trainerForm.setValue('state', parsed.state);
        trainerForm.setValue('postalCode', parsed.postalCode);
        if (parsed.countryCode) {
          trainerForm.setValue('countryCode', parsed.countryCode.toUpperCase());
        }
      });
    }
    if ((window as unknown as { google?: unknown }).google) {
      initAutocomplete();
      return () => {
        trainerAutocompleteRef.current = null;
      };
    }
    const scriptId = 'google-maps-places-profile-edit';
    if (document.getElementById(scriptId)) {
      if ((window as unknown as { google?: unknown }).google) initAutocomplete();
      return () => {
        trainerAutocompleteRef.current = null;
      };
    }
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => initAutocomplete();
    document.head.appendChild(script);
    return () => {
      trainerAutocompleteRef.current = null;
    };
  }, [addressEntryMethod, countryCode]);

  const openAddService = () => {
    setEditingServiceArea(null);
    setServiceFormLabel('');
    setServiceFormAddress('');
    setServiceFormLatitude('');
    setServiceFormLongitude('');
    setServiceFormRadiusKm('');
    setServiceFormCountryCode('');
    setServiceLocationEntryMethod('manual');
    setShowServiceForm(true);
  };

  const openEditService = (row: ServiceAreaItem) => {
    setEditingServiceArea(row);
    setServiceFormLabel(row.label);
    setServiceFormAddress(row.address ?? '');
    setServiceFormLatitude(row.latitude != null ? String(row.latitude) : '');
    setServiceFormLongitude(row.longitude != null ? String(row.longitude) : '');
    setServiceFormRadiusKm(row.radiusKm != null ? String(row.radiusKm) : '');
    setServiceFormCountryCode('');
    setServiceLocationEntryMethod('manual');
    setShowServiceForm(true);
  };

  const closeServiceForm = () => {
    setShowServiceForm(false);
    setEditingServiceArea(null);
    setServiceFormLabel('');
    setServiceFormAddress('');
    setServiceFormLatitude('');
    setServiceFormLongitude('');
    setServiceFormRadiusKm('');
  };

  const handleServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const label = serviceFormLabel.trim();
    if (!label) return;
    const address = serviceFormAddress.trim();
    if (!address) {
      setServiceLocationsError(
        'Address is required. Please choose a location from the suggestions.'
      );
      return;
    }
    const radiusRaw = serviceFormRadiusKm.trim();
    if (!radiusRaw) {
      setServiceLocationsError('Travel radius (km) is required.');
      return;
    }
    const radius = Number(radiusRaw);
    if (Number.isNaN(radius) || radius < 0 || radius > 100) {
      setServiceLocationsError('Please enter a valid travel radius between 0 and 100 km.');
      return;
    }
    setServiceSubmitLoading(true);
    setServiceLocationsError(null);
    const lat = serviceFormLatitude.trim() ? Number(serviceFormLatitude) : null;
    const lng = serviceFormLongitude.trim() ? Number(serviceFormLongitude) : null;
    if (editingServiceArea) {
      trainerApi
        .editTrainerService({
          id: editingServiceArea.id,
          label,
          address,
          latitude: lat,
          longitude: lng,
          radiusKm: radius,
        })
        .then((res) => {
          const data = res?.data as Record<string, unknown>;
          if (data?.mtype === 'success') {
            closeServiceForm();
            fetchServiceLocationsList();
          } else {
            setServiceLocationsError(String(data?.message ?? 'Update failed'));
          }
        })
        .catch(() => setServiceLocationsError('Update failed'))
        .finally(() => setServiceSubmitLoading(false));
    } else {
      trainerApi
        .addTrainerService({
          label,
          address,
          latitude: lat,
          longitude: lng,
          radiusKm: radius,
        })
        .then((res) => {
          const data = res?.data as Record<string, unknown>;
          if (data?.mtype === 'success') {
            closeServiceForm();
            fetchServiceLocationsList();
          } else {
            setServiceLocationsError(String(data?.message ?? 'Add failed'));
          }
        })
        .catch((err) => setServiceLocationsError(getApiErrorMessage(err, 'Add failed')))
        .finally(() => setServiceSubmitLoading(false));
    }
  };

  const handleServiceDelete = (id: string) => {
    if (!confirm('Remove this service area?')) return;
    setServiceActionId(id);
    trainerApi
      .deleteTrainerService(id)
      .then((res) => {
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'success') fetchServiceLocationsList();
        else setServiceLocationsError(String(data?.message ?? 'Delete failed'));
      })
      .catch((err) => setServiceLocationsError(getApiErrorMessage(err, 'Delete failed')))
      .finally(() => setServiceActionId(null));
  };

  const handleServiceToggleActive = (id: string, currentActive: boolean) => {
    setServiceActionId(id);
    trainerApi
      .serviceAreaOnOff(id, !currentActive)
      .then((res) => {
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'success') fetchServiceLocationsList();
        else setServiceLocationsError(String(data?.message ?? 'Update failed'));
      })
      .catch((err) => setServiceLocationsError(getApiErrorMessage(err, 'Update failed')))
      .finally(() => setServiceActionId(null));
  };

  const openAddAvailability = () => {
    setEditingAvailability(null);
    setAvailabilityFormDay(1);
    setAvailabilityFormStart('09:00');
    setAvailabilityFormEnd('17:00');
    setAvailabilityFormServiceAreaId('');
    setShowAvailabilityForm(true);
  };

  const openEditAvailability = (row: AvailabilitySlotItem) => {
    setEditingAvailability(row);
    setAvailabilityFormDay(row.dayOfWeek);
    setAvailabilityFormStart(formatAvailabilityTime(row.startTime));
    setAvailabilityFormEnd(formatAvailabilityTime(row.endTime));
    setAvailabilityFormServiceAreaId(row.serviceAreaId ?? '');
    setShowAvailabilityForm(true);
  };

  const closeAvailabilityForm = () => {
    setShowAvailabilityForm(false);
    setEditingAvailability(null);
    setAvailabilityFormDay(1);
    setAvailabilityFormStart('09:00');
    setAvailabilityFormEnd('17:00');
    setAvailabilityFormServiceAreaId('');
  };

  const handleAvailabilitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const start = formatAvailabilityTime(availabilityFormStart.trim());
    const end = formatAvailabilityTime(availabilityFormEnd.trim());
    if (!start || !end) {
      setAvailabilityError('Start and end time are required.');
      return;
    }
    setAvailabilitySubmitLoading(true);
    setAvailabilityError(null);
    if (editingAvailability) {
      trainerApi
        .editTrainerAvailability({
          id: editingAvailability.id,
          dayOfWeek: availabilityFormDay,
          startTime: start,
          endTime: end,
          serviceAreaId: availabilityFormServiceAreaId.trim() || null,
        })
        .then((res) => {
          const data = res?.data as Record<string, unknown>;
          if (data?.mtype === 'success') {
            closeAvailabilityForm();
            fetchAvailabilityList();
          } else {
            setAvailabilityError(String(data?.message ?? 'Update failed'));
          }
        })
        .catch((err) => setAvailabilityError(getApiErrorMessage(err, 'Update failed')))
        .finally(() => setAvailabilitySubmitLoading(false));
    } else {
      trainerApi
        .addTrainerAvailability({
          dayOfWeek: availabilityFormDay,
          startTime: start,
          endTime: end,
          serviceAreaId: availabilityFormServiceAreaId.trim() || null,
        })
        .then((res) => {
          const data = res?.data as Record<string, unknown>;
          if (data?.mtype === 'success') {
            closeAvailabilityForm();
            fetchAvailabilityList();
          } else {
            setAvailabilityError(String(data?.message ?? 'Add failed'));
          }
        })
        .catch((err) => setAvailabilityError(getApiErrorMessage(err, 'Add failed')))
        .finally(() => setAvailabilitySubmitLoading(false));
    }
  };

  const handleAvailabilityDelete = (id: string) => {
    if (!confirm('Remove this time slot?')) return;
    setAvailabilityActionId(id);
    trainerApi
      .deleteAvaibilitySlot(id)
      .then((res) => {
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'success') fetchAvailabilityList();
        else setAvailabilityError(String(data?.message ?? 'Delete failed'));
      })
      .catch((err) => setAvailabilityError(getApiErrorMessage(err, 'Delete failed')))
      .finally(() => setAvailabilityActionId(null));
  };

  const fetchCertList = () => {
    trainerApi
      .trainerCertificateList()
      .then((res) => {
        const data = res?.data as Record<string, unknown> | undefined;
        if (data?.mtype === 'error') {
          setCertError(String(data.message ?? 'Failed to load'));
          setCertList([]);
        } else {
          const list = (data?.trainerCertificateList ?? data?.list) as CertItem[] | undefined;
          setCertList(list ?? []);
          setCertError(null);
        }
      })
      .catch((err) => {
        setCertError(getApiErrorMessage(err, 'Failed to load certificates'));
        setCertList([]);
      })
      .finally(() => setCertLoading(false));
  };

  useEffect(() => {
    if (!certificationsModalOpen || role !== ROLES.TRAINER) return;
    setCertLoading(true);
    fetchCertList();
  }, [certificationsModalOpen, role]);

  const openAddCert = () => {
    setEditingCert(null);
    setCertFormName('');
    setCertFormDocumentUrl('');
    setShowCertForm(true);
  };

  const openEditCert = (row: CertItem) => {
    setEditingCert(row);
    setCertFormName(row.name);
    setCertFormDocumentUrl(row.documentUrl ?? '');
    setShowCertForm(true);
  };

  const closeCertForm = () => {
    setShowCertForm(false);
    setEditingCert(null);
    setCertFormName('');
    setCertFormDocumentUrl('');
  };

  const handleCertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = certFormName.trim();
    if (!name) return;
    setCertSubmitLoading(true);
    setCertError(null);
    if (editingCert) {
      trainerApi
        .editTrainerCertificate({
          id: editingCert.id,
          name,
          documentUrl: certFormDocumentUrl.trim() || null,
        })
        .then((res) => {
          const data = res?.data as Record<string, unknown>;
          if (data?.mtype === 'success') {
            closeCertForm();
            fetchCertList();
          } else {
            setCertError(String(data?.message ?? 'Update failed'));
          }
        })
        .catch((err) => setCertError(getApiErrorMessage(err, 'Update failed')))
        .finally(() => setCertSubmitLoading(false));
    } else {
      trainerApi
        .addTrainerCertificate({
          name,
          documentUrl: certFormDocumentUrl.trim() || null,
        })
        .then((res) => {
          const data = res?.data as Record<string, unknown>;
          if (data?.mtype === 'success') {
            closeCertForm();
            fetchCertList();
          } else {
            setCertError(String(data?.message ?? 'Add failed'));
          }
        })
        .catch((err) => setCertError(getApiErrorMessage(err, 'Add failed')))
        .finally(() => setCertSubmitLoading(false));
    }
  };

  const handleCertDelete = (id: string) => {
    if (!confirm('Remove this certificate?')) return;
    setCertActionId(id);
    trainerApi
      .deleteCertification(id)
      .then((res) => {
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'success') {
          fetchCertList();
          if (editingCert?.id === id) closeCertForm();
        } else {
          setCertError(String(data?.message ?? 'Delete failed'));
        }
      })
      .catch((err) => setCertError(getApiErrorMessage(err, 'Delete failed')))
      .finally(() => setCertActionId(null));
  };

  async function onCustomerSubmit(values: CustomerProfileFormValues) {
    setSubmitError(null);
    try {
      const body = {
        name: values.name?.trim() || undefined,
        avatarUrl: values.avatarUrl?.trim() || undefined,
        gender: values.gender?.trim() || undefined,
        dateOfBirth: values.dateOfBirth?.trim() || undefined,
        heightCm:
          values.heightCm != null && !Number.isNaN(Number(values.heightCm))
            ? Number(values.heightCm)
            : undefined,
        weightKg:
          values.weightKg != null && !Number.isNaN(Number(values.weightKg))
            ? Number(values.weightKg)
            : undefined,
        preExistingConditions: values.preExistingConditions?.trim() || undefined,
      };
      const res = await customerApi.editProfile(body);
      const data = res.data as { mtype?: string; message?: string };
      if (data?.mtype === 'success') {
        router.push('/profile');
        router.refresh();
      } else {
        setSubmitError('Update failed');
      }
    } catch (e) {
      setSubmitError(getApiErrorMessage(e, 'Failed to save'));
    }
  }

  async function onTrainerSubmit(values: TrainerProfileFormValues) {
    setSubmitError(null);
    try {
      const body = {
        name: values.name?.trim() || undefined,
        phone: values.phone?.trim() || undefined,
        avatarUrl: values.avatarUrl?.trim() || undefined,
        locale: values.locale?.trim() || undefined,
        countryCode: values.countryCode?.trim().toUpperCase() || undefined,
        state: values.state?.trim() || undefined,
        gender: values.gender?.trim() || undefined,
        dateOfBirth: values.dateOfBirth?.trim() || undefined,
        streetLine1: values.streetLine1?.trim() || undefined,
        streetLine2: values.streetLine2?.trim() || undefined,
        city: values.city?.trim() || undefined,
        postalCode: values.postalCode?.trim() || undefined,
        languageSpoken: values.languageSpoken?.trim() || undefined,
        about: values.about?.trim() || undefined,
        yearsExperience:
          values.yearsExperience != null && !Number.isNaN(Number(values.yearsExperience))
            ? Number(values.yearsExperience)
            : undefined,
        gstRegistered: values.gstRegistered,
      };
      const res = await trainerApi.editProfile(body);
      const data = res.data as { mtype?: string; message?: string };
      if (data?.mtype === 'success') {
        router.push('/profile');
        router.refresh();
      } else {
        setSubmitError('Update failed');
      }
    } catch (e) {
      setSubmitError(getApiErrorMessage(e, 'Failed to save'));
    }
  }

  const Layout = role === ROLES.TRAINER ? TrainerLayout : CustomerLayout;

  if (loading) {
    return (
      <Layout>
        <main className="gf-profile-main" style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Loading...</p>
        </main>
      </Layout>
    );
  }

  const inputStyle = {
    width: '100%',
    padding: '0.5rem 0.75rem',
    border: '1px solid var(--groupfit-border-light, #ccc)',
    borderRadius: 8,
    fontSize: 14,
  };
  const labelStyle = { display: 'block' as const, fontWeight: 600, marginBottom: 4, fontSize: 14 };
  const fieldStyle = { marginBottom: '1rem' };
  const readOnlyInputStyle = {
    ...inputStyle,
    backgroundColor: 'var(--groupfit-border-light, #eee)',
    cursor: 'not-allowed',
  };

  return (
    <Layout>
      <CustomerHeader
        title="Edit Profile"
        backLink={
          <Link href={ROUTES.account} className="gf-home__header-link">
            ← Back to Profile
          </Link>
        }
      />
      <main
        className="gf-profile-main"
        style={{ margin: '0 auto', padding: '0 2rem 2rem', maxWidth: 480 }}
      >
        {submitError && (
          <p style={{ color: 'var(--groupfit-secondary)', marginBottom: '1rem' }}>{submitError}</p>
        )}

        {role === ROLES.TRAINER && missingRequiredFields.length > 0 && (
          <div
            role="alert"
            style={{
              marginBottom: '1rem',
              padding: '1rem',
              backgroundColor: 'var(--groupfit-primary-light, #e3f2fd)',
              border: '1px solid var(--groupfit-primary, #1976d2)',
              borderRadius: 8,
              fontSize: 14,
            }}
          >
            <strong>Complete your profile to be visible to customers.</strong>
            <p style={{ margin: '0.5rem 0 0', padding: 0 }}>
              Still missing: {missingRequiredFields.join(', ')}.
            </p>
          </div>
        )}

        {role === ROLES.CUSTOMER ? (
          <form onSubmit={customerForm.handleSubmit(onCustomerSubmit)}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 12,
                flexDirection: 'column',
              }}
            >
              <label style={labelStyle}>Profile picture</label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  flexWrap: 'wrap',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                {(() => {
                  const avatarUrl = customerForm.watch('avatarUrl');
                  if (avatarUrl) {
                    return (
                      <div
                        style={{
                          position: 'relative',
                          width: 80,
                          height: 80,
                          borderRadius: '50%',
                          overflow: 'hidden',
                          flexShrink: 0,
                        }}
                      >
                        <Image
                          src={avatarUrl}
                          alt="Profile"
                          fill
                          style={{ objectFit: 'cover' }}
                          unoptimized
                        />
                      </div>
                    );
                  }
                  return (
                    <div
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: 'var(--groupfit-border-light, #eee)',
                        flexShrink: 0,
                      }}
                      aria-hidden
                    />
                  );
                })()}
                <div>
                  <CloudinaryUploadButton
                    onUpload={(url) => customerForm.setValue('avatarUrl', url)}
                    label="Upload photo"
                  />
                </div>
              </div>
            </div>

            <div style={fieldStyle}>
              <label htmlFor="customer-name" style={labelStyle}>
                Name
              </label>
              <input
                id="customer-name"
                type="text"
                {...customerForm.register('name')}
                placeholder="Your name"
                style={inputStyle}
                aria-invalid={Boolean(customerForm.formState.errors.name)}
              />
              {customerForm.formState.errors.name && (
                <span style={{ color: 'var(--groupfit-secondary)', fontSize: '0.875rem' }}>
                  {customerForm.formState.errors.name.message}
                </span>
              )}
            </div>

            <div style={fieldStyle}>
              <label htmlFor="customer-email" style={labelStyle}>
                Email
              </label>
              <input
                id="customer-email"
                type="email"
                {...customerForm.register('email')}
                readOnly
                style={readOnlyInputStyle}
                title="Email cannot be changed"
              />
            </div>

            <div style={fieldStyle}>
              <label htmlFor="customer-phone" style={labelStyle}>
                Phone number
              </label>
              <input
                id="customer-phone"
                type="tel"
                {...customerForm.register('phone')}
                readOnly
                style={readOnlyInputStyle}
                title="Phone cannot be changed"
              />
            </div>

            <div style={fieldStyle}>
              <label htmlFor="customer-gender" style={labelStyle}>
                Gender
              </label>
              <select
                id="customer-gender"
                {...customerForm.register('gender')}
                style={inputStyle}
                aria-invalid={Boolean(customerForm.formState.errors.gender)}
              >
                {GENDER_OPTIONS.map((opt) => (
                  <option key={opt.value || 'empty'} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={fieldStyle}>
              <label htmlFor="customer-dob" style={labelStyle}>
                Date of birth
              </label>
              <input
                id="customer-dob"
                type="date"
                {...customerForm.register('dateOfBirth')}
                style={inputStyle}
                aria-invalid={Boolean(customerForm.formState.errors.dateOfBirth)}
              />
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
                marginBottom: '1rem',
              }}
            >
              <div>
                <label htmlFor="customer-height" style={labelStyle}>
                  Height (cm)
                </label>
                <input
                  id="customer-height"
                  type="number"
                  min={50}
                  max={300}
                  step={1}
                  placeholder="170"
                  {...customerForm.register('heightCm', { valueAsNumber: true })}
                  style={inputStyle}
                  aria-invalid={Boolean(customerForm.formState.errors.heightCm)}
                />
                {customerForm.formState.errors.heightCm && (
                  <span style={{ color: 'var(--groupfit-secondary)', fontSize: '0.875rem' }}>
                    {customerForm.formState.errors.heightCm.message}
                  </span>
                )}
              </div>
              <div>
                <label htmlFor="customer-weight" style={labelStyle}>
                  Weight (kg)
                </label>
                <input
                  id="customer-weight"
                  type="number"
                  min={20}
                  max={500}
                  step={0.1}
                  placeholder="70"
                  {...customerForm.register('weightKg', { valueAsNumber: true })}
                  style={inputStyle}
                  aria-invalid={Boolean(customerForm.formState.errors.weightKg)}
                />
                {customerForm.formState.errors.weightKg && (
                  <span style={{ color: 'var(--groupfit-secondary)', fontSize: '0.875rem' }}>
                    {customerForm.formState.errors.weightKg.message}
                  </span>
                )}
              </div>
            </div>

            <div style={fieldStyle}>
              <label htmlFor="customer-conditions" style={labelStyle}>
                Pre-existing conditions
              </label>
              <textarea
                id="customer-conditions"
                {...customerForm.register('preExistingConditions')}
                placeholder="Any medical or health conditions we should know about (optional)"
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
                aria-invalid={Boolean(customerForm.formState.errors.preExistingConditions)}
              />
              {customerForm.formState.errors.preExistingConditions && (
                <span style={{ color: 'var(--groupfit-secondary)', fontSize: '0.875rem' }}>
                  {customerForm.formState.errors.preExistingConditions.message}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={customerForm.formState.isSubmitting}
              style={{
                padding: '0.5rem 1.5rem',
                background: 'var(--groupfit-secondary)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                cursor: customerForm.formState.isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              {customerForm.formState.isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </form>
        ) : (
          <>
            <form onSubmit={trainerForm.handleSubmit(onTrainerSubmit)}>
              <div style={fieldStyle}>
                <label style={labelStyle}>Profile picture</label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    flexWrap: 'wrap',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  {(() => {
                    const avatarUrl = trainerForm.watch('avatarUrl');
                    if (avatarUrl) {
                      return (
                        <div
                          style={{
                            position: 'relative',
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            overflow: 'hidden',
                            flexShrink: 0,
                          }}
                        >
                          <Image
                            src={avatarUrl}
                            alt="Profile"
                            fill
                            style={{ objectFit: 'cover' }}
                            unoptimized
                          />
                        </div>
                      );
                    }
                    return (
                      <div
                        style={{
                          width: 80,
                          height: 80,
                          borderRadius: '50%',
                          background: 'var(--groupfit-border-light, #eee)',
                          flexShrink: 0,
                        }}
                        aria-hidden
                      />
                    );
                  })()}
                  <div>
                    <CloudinaryUploadButton
                      onUpload={(url) => trainerForm.setValue('avatarUrl', url)}
                      label="Upload photo"
                    />
                  </div>
                </div>
              </div>
              <div style={fieldStyle}>
                <label htmlFor="trainer-name" style={labelStyle}>
                  Name
                </label>
                <input
                  id="trainer-name"
                  type="text"
                  {...trainerForm.register('name')}
                  placeholder="Your name"
                  style={inputStyle}
                  aria-invalid={Boolean(trainerForm.formState.errors.name)}
                />
                {trainerForm.formState.errors.name && (
                  <span style={{ color: 'var(--groupfit-secondary)', fontSize: '0.875rem' }}>
                    {trainerForm.formState.errors.name.message}
                  </span>
                )}
              </div>
              <div style={fieldStyle}>
                <label htmlFor="trainer-email" style={labelStyle}>
                  Email
                </label>
                <input
                  id="trainer-email"
                  type="email"
                  {...trainerForm.register('email')}
                  readOnly
                  style={readOnlyInputStyle}
                />
              </div>
              <div style={fieldStyle}>
                <label htmlFor="trainer-phone" style={labelStyle}>
                  Phone
                </label>
                <input
                  id="trainer-phone"
                  type="tel"
                  {...trainerForm.register('phone')}
                  placeholder="+44 7700 900000"
                  style={inputStyle}
                  aria-invalid={Boolean(trainerForm.formState.errors.phone)}
                />
                {trainerForm.formState.errors.phone && (
                  <span style={{ color: 'var(--groupfit-secondary)', fontSize: '0.875rem' }}>
                    {trainerForm.formState.errors.phone.message}
                  </span>
                )}
              </div>
              <div style={fieldStyle}>
                <label htmlFor="trainer-dob" style={labelStyle}>
                  Date of birth
                </label>
                <input
                  id="trainer-dob"
                  type="date"
                  {...trainerForm.register('dateOfBirth')}
                  style={inputStyle}
                  aria-invalid={Boolean(trainerForm.formState.errors.dateOfBirth)}
                />
                {trainerForm.formState.errors.dateOfBirth && (
                  <span style={{ color: 'var(--groupfit-secondary)', fontSize: '0.875rem' }}>
                    {trainerForm.formState.errors.dateOfBirth.message}
                  </span>
                )}
              </div>
              <div style={fieldStyle}>
                <label htmlFor="trainer-gender" style={labelStyle}>
                  Gender
                </label>
                <select
                  id="trainer-gender"
                  {...trainerForm.register('gender')}
                  style={inputStyle}
                  aria-invalid={Boolean(trainerForm.formState.errors.gender)}
                >
                  {GENDER_OPTIONS.map((opt) => (
                    <option key={opt.value || 'empty'} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ ...fieldStyle, marginTop: '1.5rem' }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>Address</span>
              </div>
              <div style={fieldStyle}>
                <label htmlFor="trainer-countryCode" style={labelStyle}>
                  Country
                </label>
                <select
                  id="trainer-countryCode"
                  {...countryRegister}
                  onChange={handleCountryChange}
                  style={inputStyle}
                  aria-invalid={Boolean(trainerForm.formState.errors.countryCode)}
                >
                  {COUNTRY_CODES.map((country: CountryCode) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
                {trainerForm.formState.errors.countryCode && (
                  <span style={{ color: 'var(--groupfit-secondary)', fontSize: '0.875rem' }}>
                    {trainerForm.formState.errors.countryCode.message}
                  </span>
                )}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <p
                  style={{
                    fontSize: 14,
                    color: 'var(--groupfit-secondary)',
                    marginBottom: 10,
                    marginTop: 0,
                  }}
                >
                  How would you like to enter your address?
                </p>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 12,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => GOOGLE_MAPS_API_KEY && setAddressEntryMethod('google')}
                    disabled={!GOOGLE_MAPS_API_KEY}
                    style={{
                      padding: '14px 16px',
                      textAlign: 'left',
                      border:
                        addressEntryMethod === 'google'
                          ? '2px solid var(--groupfit-primary, #1976d2)'
                          : '1px solid var(--groupfit-border-light, #ccc)',
                      borderRadius: 8,
                      background:
                        addressEntryMethod === 'google'
                          ? 'var(--groupfit-primary-light, #e3f2fd)'
                          : 'transparent',
                      cursor: GOOGLE_MAPS_API_KEY ? 'pointer' : 'not-allowed',
                      fontSize: 14,
                      fontWeight: 600,
                      opacity: GOOGLE_MAPS_API_KEY ? 1 : 0.7,
                    }}
                  >
                    <span style={{ display: 'block', marginBottom: 4 }}>Search with Google</span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 400,
                        color: 'var(--groupfit-secondary)',
                        lineHeight: 1.35,
                      }}
                    >
                      Find your address quickly. Country above narrows results.
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddressEntryMethod('manual')}
                    style={{
                      padding: '14px 16px',
                      textAlign: 'left',
                      border:
                        addressEntryMethod === 'manual'
                          ? '2px solid var(--groupfit-primary, #1976d2)'
                          : '1px solid var(--groupfit-border-light, #ccc)',
                      borderRadius: 8,
                      background:
                        addressEntryMethod === 'manual'
                          ? 'var(--groupfit-primary-light, #e3f2fd)'
                          : 'transparent',
                      cursor: 'pointer',
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    <span style={{ display: 'block', marginBottom: 4 }}>Enter manually</span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 400,
                        color: 'var(--groupfit-secondary)',
                        lineHeight: 1.35,
                      }}
                    >
                      Type street, city, and postal code in the fields below.
                    </span>
                  </button>
                </div>
                {!GOOGLE_MAPS_API_KEY && (
                  <p
                    style={{
                      fontSize: 12,
                      color: 'var(--groupfit-secondary)',
                      marginTop: 8,
                      marginBottom: 0,
                    }}
                  >
                    Google address search is not configured. Use manual entry.
                  </p>
                )}
              </div>
              {addressEntryMethod === 'google' && GOOGLE_MAPS_API_KEY && (
                <div
                  style={{
                    ...fieldStyle,
                    padding: '1rem',
                    background: 'var(--groupfit-border-light, #f5f5f5)',
                    borderRadius: 8,
                  }}
                >
                  <label htmlFor="trainer-address-search" style={labelStyle}>
                    Search for your address
                  </label>
                  <input
                    id="trainer-address-search"
                    type="text"
                    ref={trainerAddressInputRef}
                    placeholder={
                      countryCode
                        ? `e.g. 123 Main St, ${COUNTRY_CODES.find((c: CountryCode) => c.code === countryCode)?.name ?? countryCode}`
                        : 'Select a country above, then type your address'
                    }
                    style={{ ...inputStyle, padding: '10px 12px' }}
                    autoComplete="off"
                  />
                  {countryCode ? (
                    <p
                      style={{
                        fontSize: 12,
                        color: 'var(--groupfit-secondary)',
                        marginTop: 6,
                        marginBottom: 0,
                      }}
                    >
                      Suggestions are limited to{' '}
                      {COUNTRY_CODES.find((c: CountryCode) => c.code === countryCode)?.name ??
                        countryCode}
                      .
                    </p>
                  ) : (
                    <p
                      style={{
                        fontSize: 12,
                        color: 'var(--groupfit-secondary)',
                        marginTop: 6,
                        marginBottom: 0,
                      }}
                    >
                      Select a country above to narrow search and get better suggestions.
                    </p>
                  )}
                </div>
              )}
              <div
                style={{
                  ...fieldStyle,
                  marginTop: addressEntryMethod === 'google' && GOOGLE_MAPS_API_KEY ? 8 : 0,
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--groupfit-secondary)',
                    marginBottom: 8,
                    display: 'block',
                  }}
                >
                  Address details
                </span>
              </div>
              <div style={fieldStyle}>
                <label htmlFor="trainer-street1" style={labelStyle}>
                  Address line 1
                </label>
                <input
                  id="trainer-street1"
                  type="text"
                  {...streetLine1Register}
                  ref={streetLine1Register.ref}
                  placeholder="Street address"
                  style={inputStyle}
                  autoComplete="off"
                  aria-invalid={Boolean(trainerForm.formState.errors.streetLine1)}
                />
                {trainerForm.formState.errors.streetLine1 && (
                  <span style={{ color: 'var(--groupfit-secondary)', fontSize: '0.875rem' }}>
                    {trainerForm.formState.errors.streetLine1.message}
                  </span>
                )}
              </div>
              <div style={fieldStyle}>
                <label htmlFor="trainer-street2" style={labelStyle}>
                  Address line 2
                </label>
                <input
                  id="trainer-street2"
                  type="text"
                  {...trainerForm.register('streetLine2')}
                  placeholder="Apt, suite, etc. (optional)"
                  style={inputStyle}
                />
              </div>
              <div style={fieldStyle}>
                <label htmlFor="trainer-state" style={labelStyle}>
                  State / Province
                </label>
                {stateOptions ? (
                  <select
                    id="trainer-state"
                    {...trainerForm.register('state')}
                    style={inputStyle}
                    aria-invalid={Boolean(trainerForm.formState.errors.state)}
                  >
                    {stateOptions.map((opt) => (
                      <option key={opt.code} value={opt.code}>
                        {opt.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id="trainer-state"
                    type="text"
                    {...trainerForm.register('state')}
                    placeholder="State / Province"
                    style={inputStyle}
                    aria-invalid={Boolean(trainerForm.formState.errors.state)}
                  />
                )}
                {trainerForm.formState.errors.state && (
                  <span style={{ color: 'var(--groupfit-secondary)', fontSize: '0.875rem' }}>
                    {trainerForm.formState.errors.state.message}
                  </span>
                )}
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                  marginBottom: '1rem',
                }}
              >
                <div>
                  <label htmlFor="trainer-city" style={labelStyle}>
                    City
                  </label>
                  <input
                    id="trainer-city"
                    type="text"
                    {...trainerForm.register('city')}
                    placeholder="City"
                    style={inputStyle}
                    aria-invalid={Boolean(trainerForm.formState.errors.city)}
                  />
                  {trainerForm.formState.errors.city && (
                    <span style={{ color: 'var(--groupfit-secondary)', fontSize: '0.875rem' }}>
                      {trainerForm.formState.errors.city.message}
                    </span>
                  )}
                </div>
                <div>
                  <label htmlFor="trainer-postalCode" style={labelStyle}>
                    Postal code
                  </label>
                  <input
                    id="trainer-postalCode"
                    type="text"
                    {...trainerForm.register('postalCode')}
                    placeholder="Postal code"
                    style={inputStyle}
                    aria-invalid={Boolean(trainerForm.formState.errors.postalCode)}
                  />
                  {trainerForm.formState.errors.postalCode && (
                    <span style={{ color: 'var(--groupfit-secondary)', fontSize: '0.875rem' }}>
                      {trainerForm.formState.errors.postalCode.message}
                    </span>
                  )}
                </div>
              </div>
              <div style={fieldStyle}>
                <label htmlFor="trainer-languageSpoken" style={labelStyle}>
                  Language(s) spoken
                </label>
                <input
                  id="trainer-languageSpoken"
                  type="text"
                  {...trainerForm.register('languageSpoken')}
                  placeholder="e.g. English, French"
                  style={inputStyle}
                />
              </div>
              <div style={fieldStyle}>
                <label htmlFor="trainer-about" style={labelStyle}>
                  About yourself
                </label>
                <textarea
                  id="trainer-about"
                  {...trainerForm.register('about')}
                  placeholder="Brief bio for customers"
                  rows={4}
                  style={{ ...inputStyle, resize: 'vertical' }}
                  aria-invalid={Boolean(trainerForm.formState.errors.about)}
                />
                {trainerForm.formState.errors.about && (
                  <span style={{ color: 'var(--groupfit-secondary)', fontSize: '0.875rem' }}>
                    {trainerForm.formState.errors.about.message}
                  </span>
                )}
              </div>
              <div style={fieldStyle}>
                <label htmlFor="trainer-yearsExperience" style={labelStyle}>
                  Years of experience
                </label>
                <input
                  id="trainer-yearsExperience"
                  type="number"
                  min={0}
                  max={80}
                  {...trainerForm.register('yearsExperience', { valueAsNumber: true })}
                  placeholder="0"
                  style={inputStyle}
                  aria-invalid={Boolean(trainerForm.formState.errors.yearsExperience)}
                />
                {trainerForm.formState.errors.yearsExperience && (
                  <span style={{ color: 'var(--groupfit-secondary)', fontSize: '0.875rem' }}>
                    {trainerForm.formState.errors.yearsExperience.message}
                  </span>
                )}
              </div>
              <div style={{ ...fieldStyle, display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  id="trainer-gstRegistered"
                  type="checkbox"
                  {...trainerForm.register('gstRegistered')}
                  style={{ width: 'auto' }}
                />
                <label htmlFor="trainer-gstRegistered" style={{ ...labelStyle, marginBottom: 0 }}>
                  Are you registered for GST/HST?
                </label>
              </div>
              <button
                type="submit"
                disabled={trainerForm.formState.isSubmitting}
                style={{
                  padding: '0.5rem 1.5rem',
                  background: 'var(--groupfit-secondary)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: trainerForm.formState.isSubmitting ? 'not-allowed' : 'pointer',
                }}
              >
                {trainerForm.formState.isSubmitting ? 'Saving...' : 'Save'}
              </button>
            </form>

            <section
              style={{
                marginTop: '2rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid var(--groupfit-border-light)',
              }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
                Personal information
              </h3>
              <p style={{ fontSize: 14, color: 'var(--groupfit-grey)', marginBottom: 16 }}>
                Manage service areas, availability, specializations, and more. Required sections
                must be completed for your profile to be visible to customers.
              </p>
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                {(
                  [
                    {
                      label: 'Service Locations',
                      required: true,
                      complete: serviceLocationsList.length > 0,
                      detail:
                        serviceLocationsList.length > 0
                          ? `${serviceLocationsList.length} location${serviceLocationsList.length !== 1 ? 's' : ''}`
                          : 'Missing',
                      onClick: () => setServiceLocationsModalOpen(true),
                      asLink: false,
                    },
                    {
                      label: 'Availability',
                      required: true,
                      complete: availabilityList.length > 0,
                      detail:
                        availabilityList.length > 0
                          ? `${availabilityList.length} slot${availabilityList.length !== 1 ? 's' : ''}`
                          : 'Missing',
                      onClick: () => setAvailabilityModalOpen(true),
                      asLink: false,
                    },
                    {
                      label: 'Specializations',
                      required: true,
                      complete: specializationsCount > 0,
                      detail:
                        specializationsCount > 0
                          ? `${specializationsCount} activit${specializationsCount !== 1 ? 'ies' : 'y'}`
                          : 'Missing',
                      href: ROUTES.myActivities,
                      asLink: true,
                    },
                    {
                      label: 'Certifications / Resume',
                      required: true,
                      complete: certList.length > 0,
                      detail:
                        certList.length > 0
                          ? `${certList.length} item${certList.length !== 1 ? 's' : ''}`
                          : 'Missing',
                      onClick: () => setCertificationsModalOpen(true),
                      asLink: false,
                    },
                    {
                      label: 'Additional Images',
                      required: false,
                      complete: imagesList.length > 0,
                      detail:
                        imagesList.length > 0
                          ? `${imagesList.length} image${imagesList.length !== 1 ? 's' : ''}`
                          : 'Empty',
                      onClick: () => setImagesModalOpen(true),
                      asLink: false,
                    },
                    {
                      label: 'Social Media Links',
                      required: false,
                      complete: hasSocialLinks,
                      detail: hasSocialLinks ? 'Complete' : 'Empty',
                      onClick: () => setSocialModalOpen(true),
                      asLink: false,
                    },
                  ] as const
                ).map((item) => {
                  const baseStyle = {
                    width: '100%' as const,
                    padding: '14px 16px',
                    border: '1px solid var(--groupfit-border-light)',
                    borderRadius: 10,
                    background: 'var(--groupfit-bg-secondary, #f8f9fa)',
                    color: 'var(--groupfit-secondary)',
                    fontWeight: 600,
                    fontSize: 14,
                    textAlign: 'left' as const,
                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    flexWrap: 'wrap' as const,
                  };
                  const content = (
                    <>
                      <span>{item.label} →</span>
                      <span
                        style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            padding: '2px 6px',
                            borderRadius: 4,
                            background: item.required
                              ? 'rgba(200, 60, 60, 0.12)'
                              : 'var(--groupfit-border-light)',
                            color: item.required
                              ? 'var(--groupfit-error, #c00)'
                              : 'var(--groupfit-grey)',
                          }}
                        >
                          {item.required ? 'Required' : 'Optional'}
                        </span>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 500,
                            color: item.complete
                              ? 'var(--groupfit-success, #0a6b2c)'
                              : 'var(--groupfit-grey)',
                          }}
                        >
                          {item.complete ? '✓ ' : ''}
                          {item.detail}
                        </span>
                      </span>
                    </>
                  );
                  return (
                    <li key={item.label}>
                      {item.asLink && item.href ? (
                        <Link
                          href={item.href}
                          style={{ ...baseStyle, textDecoration: 'none', cursor: 'pointer' }}
                        >
                          {content}
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={item.onClick}
                          style={{ ...baseStyle, cursor: 'pointer', border: 'none' }}
                        >
                          {content}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>

            {trainerProfileUrl && (
              <p style={{ marginTop: '1.5rem' }}>
                <Link
                  href={trainerProfileUrl}
                  style={{ color: 'var(--groupfit-secondary)', fontWeight: 600, fontSize: 14 }}
                >
                  View my profile as a customer would →
                </Link>
              </p>
            )}

            <div
              style={{
                marginTop: '2rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid var(--groupfit-border-light)',
              }}
            >
              <button
                type="button"
                disabled={deleteLoading}
                onClick={async () => {
                  if (
                    !confirm(
                      'Are you sure you want to delete your profile? This action may require support to complete.'
                    )
                  )
                    return;
                  setDeleteLoading(true);
                  setSubmitError(null);
                  try {
                    const res = await trainerApi.deleteProfile();
                    const data = res?.data as { mtype?: string; message?: string };
                    if (data?.mtype === 'success') {
                      router.push(ROUTES.login);
                      router.refresh();
                    } else {
                      setSubmitError(data?.message ?? 'Delete request failed');
                    }
                  } catch (e) {
                    setSubmitError(getApiErrorMessage(e, 'Failed to request deletion'));
                  } finally {
                    setDeleteLoading(false);
                  }
                }}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'transparent',
                  color: 'var(--groupfit-error)',
                  border: '1px solid var(--groupfit-error)',
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: deleteLoading ? 'not-allowed' : 'pointer',
                }}
              >
                {deleteLoading ? 'Processing...' : 'Delete profile'}
              </button>
            </div>

            {socialModalOpen && (
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="trainer-social-links-title"
                style={{
                  position: 'fixed',
                  inset: 0,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1000,
                }}
              >
                <div
                  style={{
                    background: '#fff',
                    borderRadius: 12,
                    padding: '1.5rem',
                    width: '100%',
                    maxWidth: 480,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '1rem',
                    }}
                  >
                    <h3
                      id="trainer-social-links-title"
                      style={{ fontSize: 16, fontWeight: 600, margin: 0 }}
                    >
                      Social media links
                    </h3>
                    <button
                      type="button"
                      onClick={() => setSocialModalOpen(false)}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        fontSize: 18,
                        cursor: 'pointer',
                      }}
                      aria-label="Close"
                    >
                      ×
                    </button>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--groupfit-grey)', marginBottom: '1rem' }}>
                    Add your social profiles so customers can learn more about you. All fields are
                    optional.
                  </p>
                  {socialLoading ? (
                    <p style={{ fontSize: 14 }}>Loading...</p>
                  ) : (
                    <>
                      <div style={fieldStyle}>
                        <label htmlFor="trainer-facebookId" style={labelStyle}>
                          Facebook ID
                        </label>
                        <input
                          id="trainer-facebookId"
                          type="text"
                          value={socialFacebookId}
                          onChange={(e) => setSocialFacebookId(e.target.value)}
                          placeholder="e.g. facebook.com/yourpage"
                          style={inputStyle}
                        />
                      </div>
                      <div style={fieldStyle}>
                        <label htmlFor="trainer-instagramId" style={labelStyle}>
                          Instagram handle
                        </label>
                        <input
                          id="trainer-instagramId"
                          type="text"
                          value={socialInstagramId}
                          onChange={(e) => setSocialInstagramId(e.target.value)}
                          placeholder="e.g. @yourprofile"
                          style={inputStyle}
                        />
                      </div>
                      <div style={fieldStyle}>
                        <label htmlFor="trainer-tiktokId" style={labelStyle}>
                          TikTok handle
                        </label>
                        <input
                          id="trainer-tiktokId"
                          type="text"
                          value={socialTiktokId}
                          onChange={(e) => setSocialTiktokId(e.target.value)}
                          placeholder="e.g. @yourtiktok"
                          style={inputStyle}
                        />
                      </div>
                      <div style={fieldStyle}>
                        <label htmlFor="trainer-twitterId" style={labelStyle}>
                          Twitter / X handle
                        </label>
                        <input
                          id="trainer-twitterId"
                          type="text"
                          value={socialTwitterId}
                          onChange={(e) => setSocialTwitterId(e.target.value)}
                          placeholder="e.g. @yourtwitter"
                          style={inputStyle}
                        />
                      </div>
                      <div style={fieldStyle}>
                        <label htmlFor="trainer-youtubeId" style={labelStyle}>
                          YouTube channel URL
                        </label>
                        <input
                          id="trainer-youtubeId"
                          type="text"
                          value={socialYoutubeId}
                          onChange={(e) => setSocialYoutubeId(e.target.value)}
                          placeholder="e.g. youtube.com/@yourchannel"
                          style={inputStyle}
                        />
                      </div>
                    </>
                  )}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      gap: 8,
                      marginTop: '1.5rem',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setSocialModalOpen(false)}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: 8,
                        border: '1px solid var(--groupfit-border-light)',
                        background: '#fff',
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={socialSaving}
                      onClick={async () => {
                        setSocialSaving(true);
                        try {
                          await trainerApi.saveSocialLinks({
                            facebookId: socialFacebookId || undefined,
                            instagramId: socialInstagramId || undefined,
                            tiktokId: socialTiktokId || undefined,
                            twitterId: socialTwitterId || undefined,
                            youtubeId: socialYoutubeId || undefined,
                          });
                          setSocialModalOpen(false);
                          trainerApi
                            .getSocialLinks()
                            .then((res) => {
                              const data = res?.data as {
                                socialLinks?: Record<string, string | null>;
                              };
                              const s = data?.socialLinks;
                              const any =
                                s &&
                                (s.facebookId ||
                                  s.instagramId ||
                                  s.tiktokId ||
                                  s.twitterId ||
                                  s.youtubeId);
                              setHasSocialLinks(Boolean(any));
                            })
                            .catch(() => {});
                        } catch (e) {
                           
                          console.error('Failed to save social links', e);
                        } finally {
                          setSocialSaving(false);
                        }
                      }}
                      style={{
                        padding: '0.5rem 1.25rem',
                        borderRadius: 8,
                        border: 'none',
                        background: 'var(--groupfit-secondary)',
                        color: '#fff',
                        fontWeight: 600,
                        cursor: socialSaving ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {socialSaving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {imagesModalOpen && (
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="trainer-additional-images-title"
                style={{
                  position: 'fixed',
                  inset: 0,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1000,
                }}
              >
                <div
                  style={{
                    background: '#fff',
                    borderRadius: 12,
                    padding: '1.5rem',
                    width: '100%',
                    maxWidth: 520,
                    maxHeight: '90vh',
                    overflow: 'auto',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '1rem',
                    }}
                  >
                    <h3
                      id="trainer-additional-images-title"
                      style={{ fontSize: 16, fontWeight: 600, margin: 0 }}
                    >
                      Additional images
                    </h3>
                    <button
                      type="button"
                      onClick={() => setImagesModalOpen(false)}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        fontSize: 18,
                        cursor: 'pointer',
                      }}
                      aria-label="Close"
                    >
                      ×
                    </button>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--groupfit-grey)', marginBottom: '1rem' }}>
                    Add photos to your profile (e.g. workouts, certifications). Upload or paste
                    image URLs.
                  </p>
                  {imagesLoading ? (
                    <p style={{ fontSize: 14 }}>Loading...</p>
                  ) : (
                    <>
                      {imagesList.length > 0 && (
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                            gap: 12,
                            marginBottom: '1rem',
                          }}
                        >
                          {imagesList.map((img, index) => (
                            <div
                              key={img.id ?? `img-${index}-${img.imageUrl.slice(0, 30)}`}
                              style={{
                                position: 'relative',
                                borderRadius: 8,
                                overflow: 'hidden',
                                aspectRatio: '1',
                                background: 'var(--groupfit-border-light, #eee)',
                              }}
                            >
                              <img
                                src={img.imageUrl}
                                alt=""
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  display: 'block',
                                }}
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setImagesList((prev) => prev.filter((_, i) => i !== index))
                                }
                                style={{
                                  position: 'absolute',
                                  top: 4,
                                  right: 4,
                                  width: 24,
                                  height: 24,
                                  borderRadius: '50%',
                                  border: 'none',
                                  background: 'rgba(0,0,0,0.6)',
                                  color: '#fff',
                                  cursor: 'pointer',
                                  fontSize: 14,
                                  lineHeight: 1,
                                  padding: 0,
                                }}
                                aria-label="Remove image"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <div style={{ ...fieldStyle, marginBottom: 8 }}>
                        <CloudinaryUploadButton
                          onUpload={(url) => setImagesList((prev) => [...prev, { imageUrl: url }])}
                          label="Upload image"
                        />
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          gap: 8,
                          alignItems: 'flex-end',
                          flexWrap: 'wrap',
                        }}
                      >
                        <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                          <label htmlFor="trainer-image-url" style={labelStyle}>
                            Or paste image URL
                          </label>
                          <input
                            id="trainer-image-url"
                            type="url"
                            value={imageUrlInput}
                            onChange={(e) => setImageUrlInput(e.target.value)}
                            placeholder="https://..."
                            style={inputStyle}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const url = imageUrlInput.trim();
                            if (url) {
                              setImagesList((prev) => [...prev, { imageUrl: url }]);
                              setImageUrlInput('');
                            }
                          }}
                          style={{
                            padding: '0.5rem 1rem',
                            borderRadius: 8,
                            border: 'none',
                            background: 'var(--groupfit-secondary)',
                            color: '#fff',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Add
                        </button>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                          gap: 8,
                          marginTop: '1.5rem',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setImagesModalOpen(false)}
                          style={{
                            padding: '0.5rem 1rem',
                            borderRadius: 8,
                            border: '1px solid var(--groupfit-border-light)',
                            background: '#fff',
                            cursor: 'pointer',
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={imagesSaving}
                          onClick={async () => {
                            setImagesSaving(true);
                            try {
                              const res = await trainerApi.saveTrainerImages({
                                urls: imagesList.map((img) => img.imageUrl),
                              });
                              const data = res?.data as {
                                mtype?: string;
                                images?: { id: string; imageUrl: string }[];
                              };
                              if (data?.mtype === 'success' && Array.isArray(data.images)) {
                                setImagesList(
                                  data.images.map((img) => ({ id: img.id, imageUrl: img.imageUrl }))
                                );
                              }
                              setImagesModalOpen(false);
                            } catch (e) {
                               
                              console.error('Failed to save images', e);
                            } finally {
                              setImagesSaving(false);
                            }
                          }}
                          style={{
                            padding: '0.5rem 1.25rem',
                            borderRadius: 8,
                            border: 'none',
                            background: 'var(--groupfit-secondary)',
                            color: '#fff',
                            fontWeight: 600,
                            cursor: imagesSaving ? 'not-allowed' : 'pointer',
                          }}
                        >
                          {imagesSaving ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {serviceLocationsModalOpen && (
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="trainer-service-locations-title"
                style={{
                  position: 'fixed',
                  inset: 0,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1000,
                }}
              >
                <div
                  style={{
                    background: '#fff',
                    borderRadius: 12,
                    padding: '1.5rem',
                    width: '100%',
                    maxWidth: 560,
                    maxHeight: '90vh',
                    overflow: 'auto',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '1rem',
                    }}
                  >
                    <h3
                      id="trainer-service-locations-title"
                      style={{ fontSize: 16, fontWeight: 600, margin: 0 }}
                    >
                      Service locations
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setServiceLocationsModalOpen(false);
                        closeServiceForm();
                      }}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        fontSize: 18,
                        cursor: 'pointer',
                      }}
                      aria-label="Close"
                    >
                      ×
                    </button>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--groupfit-grey)', marginBottom: 16 }}>
                    Define where you offer sessions. Add a name, choose an address (location is set
                    from the map), and set how far you&apos;ll travel from that spot. Toggle an area
                    off to hide it from search.
                  </p>
                  {serviceLocationsError && (
                    <p style={{ color: 'var(--groupfit-error)', marginBottom: 12, fontSize: 14 }}>
                      {serviceLocationsError}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={openAddService}
                    style={{
                      marginBottom: 16,
                      padding: '8px 14px',
                      borderRadius: 8,
                      border: 'none',
                      background: 'var(--groupfit-secondary)',
                      color: '#fff',
                      fontWeight: 600,
                      fontSize: 14,
                      cursor: 'pointer',
                    }}
                  >
                    Add service area
                  </button>
                  {showServiceForm && (
                    <div
                      style={{
                        marginBottom: 20,
                        padding: 16,
                        border: '1px solid var(--groupfit-border-light)',
                        borderRadius: 8,
                      }}
                    >
                      <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>
                        {editingServiceArea ? 'Edit service area' : 'New service area'}
                      </h4>
                      <form onSubmit={handleServiceSubmit}>
                        <div style={fieldStyle}>
                          <label style={labelStyle}>Name *</label>
                          <input
                            type="text"
                            value={serviceFormLabel}
                            onChange={(e) => setServiceFormLabel(e.target.value)}
                            placeholder="e.g. Downtown, North Side"
                            required
                            style={inputStyle}
                          />
                        </div>
                        <div style={fieldStyle}>
                          <label style={labelStyle}>Country</label>
                          <select
                            value={serviceFormCountryCode}
                            onChange={(e) => setServiceFormCountryCode(e.target.value)}
                            style={inputStyle}
                          >
                            <option value="">Select country</option>
                            {COUNTRY_CODES.map((country: CountryCode) => (
                              <option key={country.code} value={country.code}>
                                {country.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div style={{ marginBottom: 12 }}>
                          <p
                            style={{
                              fontSize: 14,
                              color: 'var(--groupfit-secondary)',
                              marginBottom: 8,
                              marginTop: 0,
                            }}
                          >
                            How would you like to enter the address?
                          </p>
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                              gap: 10,
                            }}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                GOOGLE_MAPS_API_KEY && setServiceLocationEntryMethod('google')
                              }
                              disabled={!GOOGLE_MAPS_API_KEY}
                              style={{
                                padding: '12px 14px',
                                textAlign: 'left',
                                border:
                                  serviceLocationEntryMethod === 'google'
                                    ? '2px solid var(--groupfit-primary, #1976d2)'
                                    : '1px solid var(--groupfit-border-light, #ccc)',
                                borderRadius: 8,
                                background:
                                  serviceLocationEntryMethod === 'google'
                                    ? 'var(--groupfit-primary-light, #e3f2fd)'
                                    : 'transparent',
                                cursor: GOOGLE_MAPS_API_KEY ? 'pointer' : 'not-allowed',
                                fontSize: 13,
                                fontWeight: 600,
                                opacity: GOOGLE_MAPS_API_KEY ? 1 : 0.7,
                              }}
                            >
                              Search with Google
                            </button>
                            <button
                              type="button"
                              onClick={() => setServiceLocationEntryMethod('manual')}
                              style={{
                                padding: '12px 14px',
                                textAlign: 'left',
                                border:
                                  serviceLocationEntryMethod === 'manual'
                                    ? '2px solid var(--groupfit-primary, #1976d2)'
                                    : '1px solid var(--groupfit-border-light, #ccc)',
                                borderRadius: 8,
                                background:
                                  serviceLocationEntryMethod === 'manual'
                                    ? 'var(--groupfit-primary-light, #e3f2fd)'
                                    : 'transparent',
                                cursor: 'pointer',
                                fontSize: 13,
                                fontWeight: 600,
                              }}
                            >
                              Enter manually
                            </button>
                          </div>
                        </div>
                        {serviceLocationEntryMethod === 'google' && GOOGLE_MAPS_API_KEY && (
                          <div
                            style={{
                              ...fieldStyle,
                              padding: '12px',
                              background: 'var(--groupfit-border-light, #f5f5f5)',
                              borderRadius: 8,
                            }}
                          >
                            <label style={labelStyle}>Search for address</label>
                            <input
                              ref={serviceAddressInputRef}
                              type="text"
                              placeholder={
                                serviceFormCountryCode
                                  ? `e.g. 123 Main St, ${COUNTRY_CODES.find((c: CountryCode) => c.code === serviceFormCountryCode)?.name ?? serviceFormCountryCode}`
                                  : 'Select a country above, then type address'
                              }
                              style={{ ...inputStyle, padding: '10px 12px' }}
                              autoComplete="off"
                            />
                            {serviceFormCountryCode ? (
                              <p
                                style={{
                                  fontSize: 12,
                                  color: 'var(--groupfit-secondary)',
                                  marginTop: 6,
                                  marginBottom: 0,
                                }}
                              >
                                Suggestions limited to{' '}
                                {COUNTRY_CODES.find(
                                  (c: CountryCode) => c.code === serviceFormCountryCode
                                )?.name ?? serviceFormCountryCode}
                                .
                              </p>
                            ) : (
                              <p
                                style={{
                                  fontSize: 12,
                                  color: 'var(--groupfit-secondary)',
                                  marginTop: 6,
                                  marginBottom: 0,
                                }}
                              >
                                Select a country above to narrow search.
                              </p>
                            )}
                          </div>
                        )}
                        <div style={fieldStyle}>
                          <label style={labelStyle}>Address *</label>
                          <input
                            type="text"
                            value={serviceFormAddress}
                            onChange={(e) => setServiceFormAddress(e.target.value)}
                            placeholder="Street, city"
                            required
                            style={inputStyle}
                            autoComplete="off"
                          />
                        </div>
                        <div style={fieldStyle}>
                          <label style={labelStyle}>Travel radius (km) *</label>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            step={0.5}
                            value={serviceFormRadiusKm}
                            onChange={(e) => setServiceFormRadiusKm(e.target.value)}
                            placeholder="How far you'll travel from this location (0–100)"
                            required
                            style={{ ...inputStyle, width: 120 }}
                          />
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            type="submit"
                            disabled={serviceSubmitLoading}
                            style={{
                              padding: '8px 14px',
                              borderRadius: 8,
                              border: 'none',
                              background: 'var(--groupfit-secondary)',
                              color: '#fff',
                              fontWeight: 600,
                              cursor: serviceSubmitLoading ? 'not-allowed' : 'pointer',
                            }}
                          >
                            {serviceSubmitLoading
                              ? 'Saving…'
                              : editingServiceArea
                                ? 'Update'
                                : 'Add'}
                          </button>
                          <button
                            type="button"
                            onClick={closeServiceForm}
                            style={{
                              padding: '8px 14px',
                              borderRadius: 8,
                              border: '1px solid var(--groupfit-border-light)',
                              background: '#fff',
                              cursor: 'pointer',
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                  {serviceLocationsLoading ? (
                    <p style={{ fontSize: 14, color: 'var(--groupfit-grey)' }}>Loading…</p>
                  ) : serviceLocationsList.length === 0 ? (
                    <p style={{ fontSize: 14, color: 'var(--groupfit-grey)' }}>
                      No service areas yet. Add one above.
                    </p>
                  ) : (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {serviceLocationsList.map((row) => (
                        <li
                          key={row.id}
                          style={{
                            padding: 12,
                            marginBottom: 10,
                            border: '1px solid var(--groupfit-border-light)',
                            borderRadius: 8,
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              flexWrap: 'wrap',
                              gap: 8,
                            }}
                          >
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontWeight: 600, marginBottom: 4 }}>{row.label}</div>
                              {row.address && (
                                <div
                                  style={{
                                    fontSize: 13,
                                    color: 'var(--groupfit-grey)',
                                    marginBottom: 4,
                                  }}
                                >
                                  {row.address}
                                </div>
                              )}
                              {(row.latitude != null || row.longitude != null) && (
                                <div style={{ fontSize: 12, color: 'var(--groupfit-grey)' }}>
                                  {row.latitude}, {row.longitude}
                                  {row.radiusKm != null ? ` · ${row.radiusKm} km` : ''}
                                </div>
                              )}
                              <span
                                style={{
                                  fontSize: 13,
                                  fontWeight: 600,
                                  color: row.isActive
                                    ? 'var(--groupfit-secondary)'
                                    : 'var(--groupfit-grey)',
                                }}
                              >
                                {row.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                              <button
                                type="button"
                                onClick={() => handleServiceToggleActive(row.id, row.isActive)}
                                disabled={serviceActionId === row.id}
                                style={{
                                  padding: '5px 10px',
                                  fontSize: 12,
                                  borderRadius: 6,
                                  border: '1px solid var(--groupfit-secondary)',
                                  background: row.isActive ? 'var(--groupfit-secondary)' : '#fff',
                                  color: row.isActive ? '#fff' : 'var(--groupfit-secondary)',
                                  cursor: serviceActionId === row.id ? 'not-allowed' : 'pointer',
                                }}
                              >
                                {serviceActionId === row.id ? '…' : row.isActive ? 'Off' : 'On'}
                              </button>
                              <button
                                type="button"
                                onClick={() => openEditService(row)}
                                style={{
                                  padding: '5px 10px',
                                  fontSize: 12,
                                  borderRadius: 6,
                                  border: '1px solid var(--groupfit-secondary)',
                                  background: '#fff',
                                  color: 'var(--groupfit-secondary)',
                                  cursor: 'pointer',
                                }}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleServiceDelete(row.id)}
                                disabled={serviceActionId === row.id}
                                style={{
                                  padding: '5px 10px',
                                  fontSize: 12,
                                  borderRadius: 6,
                                  border: '1px solid var(--groupfit-error)',
                                  background: '#fff',
                                  color: 'var(--groupfit-error)',
                                  cursor: serviceActionId === row.id ? 'not-allowed' : 'pointer',
                                }}
                              >
                                {serviceActionId === row.id ? '…' : 'Remove'}
                              </button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {availabilityModalOpen && (
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="trainer-availability-title"
                style={{
                  position: 'fixed',
                  inset: 0,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1000,
                }}
              >
                <div
                  style={{
                    background: '#fff',
                    borderRadius: 12,
                    padding: '1.5rem',
                    width: '100%',
                    maxWidth: 520,
                    maxHeight: '90vh',
                    overflow: 'auto',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '1rem',
                    }}
                  >
                    <h3
                      id="trainer-availability-title"
                      style={{ fontSize: 16, fontWeight: 600, margin: 0 }}
                    >
                      Availability
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setAvailabilityModalOpen(false);
                        closeAvailabilityForm();
                      }}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        fontSize: 18,
                        cursor: 'pointer',
                      }}
                      aria-label="Close"
                    >
                      ×
                    </button>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--groupfit-grey)', marginBottom: 12 }}>
                    Set when you&apos;re available for sessions. Times are in 15-minute steps (e.g.
                    12:00, 12:15, 12:30). Sessions are typically 1 hour.
                  </p>
                  <div
                    style={{
                      padding: 12,
                      marginBottom: 16,
                      background: 'var(--groupfit-border-light, #f0f0f0)',
                      borderRadius: 8,
                      fontSize: 13,
                      color: 'var(--groupfit-grey)',
                    }}
                  >
                    <strong>Disclaimer:</strong> You can select a time range; we will automatically
                    schedule sessions within that range. Session length and the cooldown between
                    sessions use the parameters chosen for each service area location.
                  </div>
                  {availabilityError && (
                    <p
                      style={{
                        color: 'var(--groupfit-error)',
                        marginBottom: 12,
                        fontSize: 14,
                      }}
                    >
                      {availabilityError}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={openAddAvailability}
                    style={{
                      marginBottom: 16,
                      padding: '8px 14px',
                      borderRadius: 8,
                      border: 'none',
                      background: 'var(--groupfit-secondary)',
                      color: '#fff',
                      fontWeight: 600,
                      fontSize: 14,
                      cursor: 'pointer',
                    }}
                  >
                    Add time slot
                  </button>
                  {showAvailabilityForm && (
                    <div
                      style={{
                        marginBottom: 20,
                        padding: 16,
                        border: '1px solid var(--groupfit-border-light)',
                        borderRadius: 8,
                      }}
                    >
                      <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>
                        {editingAvailability ? 'Edit time slot' : 'New time slot'}
                      </h4>
                      <form onSubmit={handleAvailabilitySubmit}>
                        <div style={fieldStyle}>
                          <label style={labelStyle}>Day of week</label>
                          <select
                            value={availabilityFormDay}
                            onChange={(e) => setAvailabilityFormDay(Number(e.target.value))}
                            style={inputStyle}
                          >
                            {AVAILABILITY_DAY_NAMES.map((name, i) => (
                              <option key={i} value={i}>
                                {name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div style={fieldStyle}>
                          <label style={labelStyle}>Location (service area)</label>
                          <select
                            value={availabilityFormServiceAreaId}
                            onChange={(e) => setAvailabilityFormServiceAreaId(e.target.value)}
                            style={inputStyle}
                          >
                            <option value="">No specific location</option>
                            {availabilityServiceAreas.map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div style={fieldStyle}>
                          <label style={labelStyle}>Start time (15-min steps)</label>
                          <select
                            value={availabilityFormStart}
                            onChange={(e) => setAvailabilityFormStart(e.target.value)}
                            required
                            style={inputStyle}
                          >
                            {AVAILABILITY_TIME_OPTIONS.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div style={fieldStyle}>
                          <label style={labelStyle}>End time (15-min steps)</label>
                          <select
                            value={availabilityFormEnd}
                            onChange={(e) => setAvailabilityFormEnd(e.target.value)}
                            required
                            style={inputStyle}
                          >
                            {AVAILABILITY_TIME_OPTIONS.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            type="submit"
                            disabled={availabilitySubmitLoading}
                            style={{
                              padding: '8px 14px',
                              borderRadius: 8,
                              border: 'none',
                              background: 'var(--groupfit-secondary)',
                              color: '#fff',
                              fontWeight: 600,
                              cursor: availabilitySubmitLoading ? 'not-allowed' : 'pointer',
                            }}
                          >
                            {availabilitySubmitLoading
                              ? 'Saving…'
                              : editingAvailability
                                ? 'Update'
                                : 'Add'}
                          </button>
                          <button
                            type="button"
                            onClick={closeAvailabilityForm}
                            style={{
                              padding: '8px 14px',
                              borderRadius: 8,
                              border: '1px solid var(--groupfit-border-light)',
                              background: '#fff',
                              cursor: 'pointer',
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                  {availabilityLoading ? (
                    <p style={{ fontSize: 14, color: 'var(--groupfit-grey)' }}>Loading…</p>
                  ) : availabilityList.length === 0 ? (
                    <p style={{ fontSize: 14, color: 'var(--groupfit-grey)' }}>
                      No time slots yet. Add when you&apos;re available for sessions.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {AVAILABILITY_DAY_NAMES.map((dayName, dayIndex) => {
                        const daySlots = availabilityList.filter(
                          (row) => row.dayOfWeek === dayIndex
                        );
                        if (daySlots.length === 0) return null;
                        return (
                          <div key={dayIndex}>
                            <h4
                              style={{
                                fontSize: 14,
                                fontWeight: 700,
                                marginBottom: 8,
                                color: 'var(--groupfit-secondary)',
                              }}
                            >
                              {dayName}
                            </h4>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                              {daySlots.map((row) => (
                                <li
                                  key={row.id}
                                  style={{
                                    padding: 12,
                                    marginBottom: 8,
                                    border: '1px solid var(--groupfit-border-light)',
                                    borderRadius: 8,
                                  }}
                                >
                                  <div
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      flexWrap: 'wrap',
                                      gap: 8,
                                    }}
                                  >
                                    <div>
                                      <span style={{ color: 'var(--groupfit-grey)' }}>
                                        {formatAvailabilityTime(row.startTime)} –{' '}
                                        {formatAvailabilityTime(row.endTime)}
                                      </span>
                                      {row.serviceAreaLabel && (
                                        <span
                                          style={{
                                            display: 'block',
                                            fontSize: 12,
                                            color: 'var(--groupfit-grey)',
                                            marginTop: 4,
                                          }}
                                        >
                                          {row.serviceAreaLabel}
                                        </span>
                                      )}
                                    </div>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                      <button
                                        type="button"
                                        onClick={() => openEditAvailability(row)}
                                        style={{
                                          padding: '5px 10px',
                                          fontSize: 12,
                                          borderRadius: 6,
                                          border: '1px solid var(--groupfit-secondary)',
                                          background: '#fff',
                                          color: 'var(--groupfit-secondary)',
                                          cursor: 'pointer',
                                        }}
                                      >
                                        Edit
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleAvailabilityDelete(row.id)}
                                        disabled={availabilityActionId === row.id}
                                        style={{
                                          padding: '5px 10px',
                                          fontSize: 12,
                                          borderRadius: 6,
                                          border: '1px solid var(--groupfit-error)',
                                          background: '#fff',
                                          color: 'var(--groupfit-error)',
                                          cursor:
                                            availabilityActionId === row.id
                                              ? 'not-allowed'
                                              : 'pointer',
                                        }}
                                      >
                                        {availabilityActionId === row.id ? '…' : 'Remove'}
                                      </button>
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {certificationsModalOpen && (
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="certifications-modal-title"
                style={{
                  position: 'fixed',
                  inset: 0,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1000,
                }}
                onClick={(e) => e.target === e.currentTarget && setCertificationsModalOpen(false)}
              >
                <div
                  style={{
                    background: '#fff',
                    borderRadius: 12,
                    padding: '1.5rem',
                    width: '100%',
                    maxWidth: 520,
                    maxHeight: '90vh',
                    overflow: 'auto',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 16,
                    }}
                  >
                    <h2
                      id="certifications-modal-title"
                      style={{ fontSize: 18, fontWeight: 700, margin: 0 }}
                    >
                      Certifications / Resume
                    </h2>
                    <button
                      type="button"
                      onClick={() => setCertificationsModalOpen(false)}
                      style={{
                        padding: '4px 8px',
                        border: 'none',
                        background: 'none',
                        fontSize: 18,
                        cursor: 'pointer',
                        color: 'var(--groupfit-grey)',
                      }}
                      aria-label="Close"
                    >
                      ×
                    </button>
                  </div>
                  {certError && (
                    <p style={{ color: 'var(--groupfit-error)', fontSize: 14, marginBottom: 12 }}>
                      {certError}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={openAddCert}
                    style={{
                      marginBottom: 16,
                      padding: '8px 14px',
                      borderRadius: 8,
                      border: 'none',
                      background: 'var(--groupfit-secondary)',
                      color: '#fff',
                      fontWeight: 600,
                      fontSize: 14,
                      cursor: 'pointer',
                    }}
                  >
                    Add certificate or resume
                  </button>
                  {showCertForm && (
                    <div
                      style={{
                        marginBottom: 20,
                        padding: 16,
                        border: '1px solid var(--groupfit-border-light)',
                        borderRadius: 8,
                      }}
                    >
                      <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>
                        {editingCert ? 'Edit certificate / resume' : 'New certificate or resume'}
                      </h4>
                      <form onSubmit={handleCertSubmit}>
                        <div style={fieldStyle}>
                          <label style={labelStyle}>Label *</label>
                          <input
                            type="text"
                            value={certFormName}
                            onChange={(e) => setCertFormName(e.target.value)}
                            placeholder="e.g. CPR, NASM-CPT, Resume"
                            required
                            style={inputStyle}
                          />
                        </div>
                        <div style={fieldStyle}>
                          <label style={labelStyle}>Document (image)</label>
                          <div style={{ marginBottom: 8 }}>
                            <CloudinaryUploadButton
                              onUpload={(url) => setCertFormDocumentUrl(url)}
                              label="Upload image or PDF"
                              allowPdf
                            />
                          </div>
                          {certFormDocumentUrl && (
                            <button
                              type="button"
                              onClick={() => setCertFormDocumentUrl('')}
                              style={{
                                fontSize: 13,
                                color: 'var(--groupfit-secondary)',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 0,
                                marginTop: 4,
                              }}
                            >
                              Remove document
                            </button>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            type="submit"
                            disabled={certSubmitLoading}
                            style={{
                              padding: '8px 14px',
                              borderRadius: 8,
                              border: 'none',
                              background: 'var(--groupfit-secondary)',
                              color: '#fff',
                              fontWeight: 600,
                              cursor: certSubmitLoading ? 'not-allowed' : 'pointer',
                            }}
                          >
                            {certSubmitLoading ? 'Saving…' : editingCert ? 'Update' : 'Add'}
                          </button>
                          {editingCert && (
                            <button
                              type="button"
                              onClick={() => handleCertDelete(editingCert.id)}
                              disabled={certActionId === editingCert.id}
                              style={{
                                padding: '8px 14px',
                                borderRadius: 8,
                                border: '1px solid var(--groupfit-error)',
                                background: '#fff',
                                color: 'var(--groupfit-error)',
                                cursor: certActionId === editingCert.id ? 'not-allowed' : 'pointer',
                              }}
                            >
                              {certActionId === editingCert.id ? '…' : 'Remove'}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={closeCertForm}
                            style={{
                              padding: '8px 14px',
                              borderRadius: 8,
                              border: '1px solid var(--groupfit-border-light)',
                              background: '#fff',
                              cursor: 'pointer',
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                  {certLoading ? (
                    <p style={{ fontSize: 14, color: 'var(--groupfit-grey)' }}>Loading…</p>
                  ) : certList.length === 0 ? (
                    <p style={{ fontSize: 14, color: 'var(--groupfit-grey)' }}>
                      No certificates or resume yet. Add one above.
                    </p>
                  ) : (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {certList.map((row) => (
                        <li
                          key={row.id}
                          style={{
                            padding: 12,
                            marginBottom: 8,
                            border: '1px solid var(--groupfit-border-light)',
                            borderRadius: 8,
                          }}
                        >
                          <div style={{ fontWeight: 600, marginBottom: 4 }}>{row.name}</div>
                          {row.documentUrl && (
                            <a
                              href={row.documentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ fontSize: 13, color: 'var(--groupfit-secondary)' }}
                            >
                              View document
                            </a>
                          )}
                          <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                            <button
                              type="button"
                              onClick={() => openEditCert(row)}
                              style={{
                                padding: '5px 10px',
                                fontSize: 12,
                                borderRadius: 6,
                                border: '1px solid var(--groupfit-secondary)',
                                background: '#fff',
                                color: 'var(--groupfit-secondary)',
                                cursor: 'pointer',
                              }}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCertDelete(row.id)}
                              disabled={certActionId === row.id}
                              style={{
                                padding: '5px 10px',
                                fontSize: 12,
                                borderRadius: 6,
                                border: '1px solid var(--groupfit-error)',
                                background: '#fff',
                                color: 'var(--groupfit-error)',
                                cursor: certActionId === row.id ? 'not-allowed' : 'pointer',
                              }}
                            >
                              {certActionId === row.id ? '…' : 'Remove'}
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </Layout>
  );
}
