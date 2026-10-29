import type { GovtJobDetail } from '@/types/jobs';
import { formatBanglaDate, toBengaliNumber } from '@/utils/bengali';

export const govtJobDetailTag = (jobId: string) => `govt-job:${jobId}`;

const TELETALK_ORIGIN = 'https://alljobs.teletalk.com.bd';
const AS_PER_CIRCULAR = 'বিজ্ঞপ্তি অনুযায়ী';
export const DEFAULT_ORGANIZATION = 'বাংলাদেশ সরকারি প্রতিষ্ঠান';

export const GOVT_JOB_SECTIONS = [
  { id: 'section-details', label: 'চাকরির বিবরণ' },
  { id: 'section-qualifications', label: 'যোগ্যতা ও অভিজ্ঞতা' },
  { id: 'section-conditions', label: 'শর্তাবলী' },
  { id: 'section-process', label: 'আবেদন প্রক্রিয়া' },
  { id: 'section-documents', label: 'প্রয়োজনীয় কাগজপত্র ও নির্দেশনা' },
] as const;

const DEFAULT_CONDITIONS = [
  'চাকরিপ্রার্থীকে অবশ্যই বাংলাদেশের প্রকৃত নাগরিক হতে হবে।',
  'সরকারি, আধা-সরকারি বা স্বায়ত্তশাসিত সংস্থায় কর্মরত প্রার্থীদের অবশ্যই যথাযথ কর্তৃপক্ষের মাধ্যমে আবেদন করতে হবে।',
  'বয়স প্রমাণের ক্ষেত্রে কোনো প্রকার এফিডেভিট গ্রহণযোগ্য নয়।',
  'মৌখিক পরীক্ষার সময় সকল শিক্ষাগত যোগ্যতার মূল সনদপত্র ও জাতীয় পরিচয়পত্র প্রদর্শন করতে হবে।',
  'নিয়োগের ক্ষেত্রে সরকারের প্রচলিত কোটা নীতিমালা ও অন্যান্য বিধি-বিধান প্রযোজ্য হবে।',
];

const DEFAULT_DOCUMENTS = [
  'আবেদনপত্রে প্রার্থীর রঙিন ছবি (দৈর্ঘ্য ৩০০ pixel x প্রস্থ ৩০০ pixel, সর্বোচ্চ ১০০ KB)।',
  'প্রার্থীর স্বাক্ষর (দৈর্ঘ্য ৩০০ pixel x প্রস্থ ৮০ pixel, সর্বোচ্চ ৬০ KB)।',
  'অনলাইন আবেদনপত্রের Applicant’s Copy এবং পরীক্ষার Admit Card-এর রঙিন প্রিন্ট কপি।',
  'মৌখিক পরীক্ষার সময় সকল শিক্ষাগত যোগ্যতার মূল সনদ ও ১ম শ্রেণীর গেজেটেড কর্মকর্তা কর্তৃক সত্যায়িত ফটোকপি।',
  'নাগরিকত্ব সনদপত্র, জাতীয় পরিচয়পত্র অথবা জন্ম নিবন্ধন সনদের মূলকপি।',
  'প্রযোজ্য ক্ষেত্রে কোটা (মুক্তিযোদ্ধা, ক্ষুদ্র নৃ-গোষ্ঠী, শারীরিক প্রতিবন্ধী ইত্যাদি) সম্পর্কিত মূল সনদ।',
];

/** Teletalk returns media as relative paths; links on the page need absolute URLs. */
export function teletalkUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  const clean = path.replace(/^\/+/, '');
  return clean.startsWith('media/') ? `${TELETALK_ORIGIN}/${clean}` : `${TELETALK_ORIGIN}/media/${clean}`;
}

const nonEmpty = (list: string[] | undefined, fallback: string[]) => (list && list.length > 0 ? list : fallback);
const banglaDateOr = (iso: string | null, fallback = AS_PER_CIRCULAR) => (iso ? formatBanglaDate(iso) : fallback);

/** Everything the detail page shows, with the circular's values first and sensible fallbacks after. */
export function govtJobContent(job: GovtJobDetail) {
  const { circular } = job;
  const stats = circular?.key_stats;
  const process = circular?.application_process;
  const applicationSite = job.applicationSite || process?.portal_url || null;
  const inferredPrefix = applicationSite
    ? applicationSite.replace(/^https?:\/\//, '').split('.')[0].toUpperCase()
    : 'JOB';

  const defaultQualifications = [
    job.minAge && job.maxAge
      ? `বয়সসীমা: ${toBengaliNumber(job.minAge)} হতে ${toBengaliNumber(job.maxAge)} বছর পর্যন্ত।`
      : 'বয়সসীমা: বিজ্ঞপ্তি অনুযায়ী।',
    'শিক্ষাগত যোগ্যতা ও অভিজ্ঞতার বিস্তারিত তালিকা মূল অফিশিয়াল সার্কুলার বিজ্ঞপ্তিতে দেখুন।',
    'স্বীকৃত বিশ্ববিদ্যালয় অথবা শিক্ষা বোর্ড হতে প্রয়োজনীয় শিক্ষাগত যোগ্যতা থাকতে হবে।',
  ];

  return {
    applicationSite,
    teletalkPrefix: process?.teletalk_prefix || inferredPrefix,
    stats: {
      grade: stats?.grade || AS_PER_CIRCULAR,
      salary: stats?.salary_scale || AS_PER_CIRCULAR,
      vacancy: stats?.vacancy || (job.vacancy ? `${toBengaliNumber(job.vacancy)} জন` : AS_PER_CIRCULAR),
      deadline: stats?.deadline || banglaDateOr(job.deadlineDate),
      workplace: stats?.workplace || 'সমগ্র বাংলাদেশ',
    },
    description: circular?.job_description ?? [],
    qualifications: nonEmpty(circular?.qualifications, defaultQualifications),
    conditions: nonEmpty(circular?.conditions, DEFAULT_CONDITIONS),
    documents: nonEmpty(circular?.required_documents, DEFAULT_DOCUMENTS),
    applyStart: process?.start_date || banglaDateOr(job.publishedDate),
    applyEnd: process?.end_date || banglaDateOr(job.deadlineDate),
    feeAmount: process?.fee_amount ?? null,
    smsInstructions: process?.sms_instructions ?? [],
    publishedText: job.publishedDate ? formatBanglaDate(job.publishedDate) : null,
  };
}

export type GovtJobContent = ReturnType<typeof govtJobContent>;

export function govtJobPostingJsonLd(job: GovtJobDetail, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.circular?.job_description?.join('\n') || `${job.title} — ${job.organizationName}`,
    url,
    identifier: { '@type': 'PropertyValue', name: job.organizationName, value: job.id },
    datePosted: job.publishedDate ?? undefined,
    validThrough: job.deadlineDate ?? undefined,
    employmentType: 'FULL_TIME',
    totalJobOpenings: Number(job.vacancy) || undefined,
    hiringOrganization: {
      '@type': 'GovernmentOrganization',
      name: job.organizationName,
      logo: job.organizationLogo ?? undefined,
    },
    jobLocation: {
      '@type': 'Place',
      address: { '@type': 'PostalAddress', addressCountry: 'BD' },
    },
  };
}
