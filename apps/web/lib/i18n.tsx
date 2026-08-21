"use client";

import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Language = "en" | "bn";

export interface Translations {
  appName: string;
  tagline: string;
  // Nav
  feed: string;
  map: string;
  emergency: string;
  profile: string;
  leaderboard: string;
  reportIssue: string;
  login: string;
  register: string;
  logout: string;
  // Feed
  allDhaka: string;
  wardPrefix: string;
  hot: string;
  new: string;
  top: string;
  filterByCategory: string;
  filterByStatus: string;
  searchPlaceholder: string;
  noPostsFound: string;
  // Categories
  cat_all: string;
  cat_traffic: string;
  cat_infrastructure: string;
  cat_safety: string;
  cat_health: string;
  cat_environment: string;
  cat_crime: string;
  cat_other: string;
  // Severity & Status
  severity_normal: string;
  severity_emergency: string;
  status_open: string;
  status_in_progress: string;
  status_resolved: string;
  // Create Post
  createPostTitle: string;
  createPostSubtitle: string;
  postTitleLabel: string;
  postTitlePlaceholder: string;
  postBodyLabel: string;
  postBodyPlaceholder: string;
  postCategoryLabel: string;
  postSeverityLabel: string;
  postLocationLabel: string;
  pickOnMap: string;
  addressLabel: string;
  addressPlaceholder: string;
  wardLabel: string;
  selectWard: string;
  postAnonLabel: string;
  postAnonDesc: string;
  allowAiLabel: string;
  allowAiDesc: string;
  submitPost: string;
  submitting: string;
  // Post Details
  upvotes: string;
  comments: string;
  share: string;
  copiedToClipboard: string;
  aiHelpTitle: string;
  aiHelpDesc: string;
  getAiSuggestions: string;
  aiDisclaimer: string;
  aiModalTitle: string;
  aiModalDesc: string;
  confirmAi: string;
  cancel: string;
  statusUpdate: string;
  markResolved: string;
  markInProgress: string;
  reopenIssue: string;
  writeComment: string;
  postComment: string;
  reply: string;
  anonymous: string;
  // Emergency
  sosTitle: string;
  sosSubtitle: string;
  holdToArm: string;
  holding: string;
  confirmSos: string;
  call999: string;
  activeAlerts: string;
  allClear: string;
  // Ward
  wardHubTitle: string;
  totalReports: string;
  activeIssues: string;
  resolvedIssues: string;
  wardCommissioner: string;
  switchWard: string;
  // Profile & Leaderboard
  citizenScore: string;
  volunteerBadge: string;
  myReports: string;
  myUpvotes: string;
  topContributors: string;
  rank: string;
  points: string;
}

const translations: Record<Language, Translations> = {
  en: {
    appName: "UpAware",
    tagline: "Community-Powered Civic Awareness for Dhaka",
    feed: "Feed",
    map: "Live Map",
    emergency: "Emergency",
    profile: "Profile",
    leaderboard: "Leaderboard",
    reportIssue: "Report Issue",
    login: "Log in",
    register: "Register",
    logout: "Log out",
    allDhaka: "All Dhaka",
    wardPrefix: "Ward",
    hot: "Hot",
    new: "New",
    top: "Top",
    filterByCategory: "All Categories",
    filterByStatus: "All Statuses",
    searchPlaceholder: "Search civic issues in Dhaka...",
    noPostsFound: "No issues reported matching your filters.",
    cat_all: "All",
    cat_traffic: "Traffic",
    cat_infrastructure: "Infrastructure",
    cat_safety: "Safety",
    cat_health: "Health",
    cat_environment: "Environment",
    cat_crime: "Crime",
    cat_other: "Other",
    severity_normal: "Normal",
    severity_emergency: "Emergency",
    status_open: "Open",
    status_in_progress: "In Progress",
    status_resolved: "Resolved",
    createPostTitle: "Report a Civic Issue",
    createPostSubtitle: "Alert your community and local authorities with an accurate location.",
    postTitleLabel: "Issue Title",
    postTitlePlaceholder: "e.g. Severe waterlogging in Kazipara main road",
    postBodyLabel: "Description & Details",
    postBodyPlaceholder: "Explain what is happening, how long it has been an issue, and who is affected...",
    postCategoryLabel: "Category",
    postSeverityLabel: "Severity Level",
    postLocationLabel: "Issue Location",
    pickOnMap: "Pick on Dhaka Map",
    addressLabel: "Street Address / Landmark",
    addressPlaceholder: "e.g. Mirpur Road, opposite Kazipara Metro Station",
    wardLabel: "Dhaka Ward Number (1-92)",
    selectWard: "Select a ward",
    postAnonLabel: "Post Anonymously",
    postAnonDesc: "Hide your identity from public view",
    allowAiLabel: "Allow AI Suggestions",
    allowAiDesc: "Permit Claude AI to analyze this issue and suggest municipal escalation steps",
    submitPost: "Submit Civic Report",
    submitting: "Submitting...",
    upvotes: "Upvotes",
    comments: "Comments",
    share: "Share",
    copiedToClipboard: "Link copied to clipboard!",
    aiHelpTitle: "Civic Resolution Suggestions",
    aiHelpDesc: "Get actionable steps and authority contact points for this problem.",
    getAiSuggestions: "Get AI Suggestions",
    aiDisclaimer: "AI suggestions are tailored to Dhaka civic bodies (DSCC/DNCC, WASA, DMP, 999).",
    aiModalTitle: "Generate AI Resolution Plan?",
    aiModalDesc: "Our AI assistant will analyze this issue report and provide 3 concrete municipal escalation and action steps.",
    confirmAi: "Generate Suggestions",
    cancel: "Cancel",
    statusUpdate: "Update Status",
    markResolved: "Mark as Resolved",
    markInProgress: "Mark In Progress",
    reopenIssue: "Re-open Issue",
    writeComment: "Write a comment or community update...",
    postComment: "Post Comment",
    reply: "Reply",
    anonymous: "Anonymous",
    sosTitle: "Emergency SOS Hub",
    sosSubtitle: "Trigger a geo-targeted alert to notify nearby citizens in real time.",
    holdToArm: "Press & hold for 500ms to arm SOS",
    holding: "Keep holding...",
    confirmSos: "Confirm SOS Alert",
    call999: "Call National Emergency: 999",
    activeAlerts: "Active Emergency Alerts",
    allClear: "All clear — no active emergencies in Dhaka right now.",
    wardHubTitle: "Dhaka Ward Community",
    totalReports: "Total Reports",
    activeIssues: "Active Issues",
    resolvedIssues: "Resolved",
    wardCommissioner: "Local Ward Office",
    switchWard: "Switch Ward",
    citizenScore: "Citizen Karma Points",
    volunteerBadge: "Verified Community Volunteer",
    myReports: "My Reported Issues",
    myUpvotes: "Upvoted Issues",
    topContributors: "Top Civic Contributors",
    rank: "Rank",
    points: "Points",
  },
  bn: {
    appName: "আপঅ্যাওয়ার",
    tagline: "ঢাকার নাগরিক সচেতনতা ও সমস্যা সমাধানের কমিউনিটি প্ল্যাটফর্ম",
    feed: "ফিড",
    map: "লাইভ ম্যাপ",
    emergency: "জরুরি SOS",
    profile: "প্রোফাইল",
    leaderboard: "লিডারবোর্ড",
    reportIssue: "সমস্যা জানান",
    login: "লগইন",
    register: "নিবন্ধন",
    logout: "লগআউট",
    allDhaka: "সমগ্র ঢাকা",
    wardPrefix: "ওয়ার্ড",
    hot: "জনপ্রিয়",
    new: "নতুন",
    top: "শীর্ষ",
    filterByCategory: "সকল ক্যাটাগরি",
    filterByStatus: "সকল অবস্থা",
    searchPlaceholder: "ঢাকার নাগরিক সমস্যা খুঁজুন...",
    noPostsFound: "আপনার ফিল্টারের সাথে মিলে এমন কোনো পোস্ট পাওয়া যায়নি।",
    cat_all: "সকল",
    cat_traffic: "ট্রাফিক ও যানজট",
    cat_infrastructure: "অবকাঠামো ও রাস্তাঘাট",
    cat_safety: "নিরাপত্তা",
    cat_health: "স্বাস্থ্য ও ড্রেনেজ",
    cat_environment: "পরিবেশ ও আবর্জনা",
    cat_crime: "অপরাধ ও ছিনতাই",
    cat_other: "অন্যান্য",
    severity_normal: "সাধারণ",
    severity_emergency: "জরুরি",
    status_open: "উন্মুক্ত (সমাধানহীন)",
    status_in_progress: "চলমান",
    status_resolved: "সমাধানকৃত",
    createPostTitle: "একটি নাগরিক সমস্যা রিপোর্ট করুন",
    createPostSubtitle: "সঠিক লোকেশন দিয়ে আপনার এলাকাবাসী ও কর্তৃপক্ষকে অবহিত করুন।",
    postTitleLabel: "সমস্যার শিরোনাম",
    postTitlePlaceholder: "যেমন: কাজীপাডা প্রধান সড়কে তীব্র জলজট",
    postBodyLabel: "বিস্তারিত বিবরণ",
    postBodyPlaceholder: "সমস্যাটি কতদিন ধরে এবং সাধারণ মানুষ কীভাবে ক্ষতিগ্রস্ত হচ্ছে বিস্তারিত লিখুন...",
    postCategoryLabel: "ক্যাটাগরি",
    postSeverityLabel: "জরুরিতা মাত্রা",
    postLocationLabel: "সমস্যার অবস্থান (ম্যাপ পিন)",
    pickOnMap: "ম্যাপে অবস্থান নির্বাচন করুন",
    addressLabel: "ঠিকানা / পরিচিত ল্যান্ডমার্ক",
    addressPlaceholder: "যেমন: মিরপুর রোড, কাজীপাড়া মেট্রো স্টেশনের বিপরীতে",
    wardLabel: "ঢাকা সিটি কর্পোরেশন ওয়ার্ড নং (১-৯২)",
    selectWard: "ওয়ার্ড নির্বাচন করুন",
    postAnonLabel: "বেনামে পোস্ট করুন",
    postAnonDesc: "পাবলিক ফিডে আপনার নাম ও পরিচয় গোপন রাখুন",
    allowAiLabel: "AI সমাধান প্রস্তাবনার অনুমতি দিন",
    allowAiDesc: "Claude AI-কে সমস্যাটি বিশ্লেষণ করে সমাধান ও অভিযোগের উপায় জানাতে অনুমতি দিন",
    submitPost: "রিপোর্ট জমা দিন",
    submitting: "জমা হচ্ছে...",
    upvotes: "ভোট",
    comments: "মন্তব্য",
    share: "শেয়ার",
    copiedToClipboard: "লিংক কপি করা হয়েছে!",
    aiHelpTitle: "AI সমাধান ও অভিযোগ পরামর্শ",
    aiHelpDesc: "সমস্যা সমাধানের কার্যকর পদক্ষেপ ও সংশ্লিষ্ট সরকারি দপ্তরের তথ্য।",
    getAiSuggestions: "AI পরামর্শ দেখুন",
    aiDisclaimer: "পরামর্শগুলো ঢাকার সিটি কর্পোরেশন, ওয়াসা, ডিএমপি এবং ৯৯৯ সার্ভিসের উপর ভিত্তি করে তৈরি।",
    aiModalTitle: "AI সমাধান প্রস্তাবনা গ্রহণ করবেন?",
    aiModalDesc: "আমাদের AI অ্যাসিস্ট্যান্ট সমস্যাটি বিশ্লেষণ করে ৩টি বাস্তবমুখী নাগরিক সমাধান ও অভিযোগের উপায় জানাবে।",
    confirmAi: "পরামর্শ তৈরি করুন",
    cancel: "বাতিল",
    statusUpdate: "অবস্থা পরিবর্তন",
    markResolved: "সমাধান হিসেবে চিহ্নিত করুন",
    markInProgress: "কাজ চলমান চিহ্নিত করুন",
    reopenIssue: "পুনরায় চালু করুন",
    writeComment: "একটি মন্তব্য বা আপডেটের তথ্য লিখুন...",
    postComment: "মন্তব্য পোস্ট করুন",
    reply: "উত্তর দিন",
    anonymous: "বেনামী",
    sosTitle: "জরুরি SOS হাব",
    sosSubtitle: "তাৎক্ষণিক সাহায্য পেতে এলাকার অন্যান্য নাগরিকদের সতর্কবার্তা পাঠান।",
    holdToArm: "SOS পাঠাতে ৫০০ মিলিসেকেন্ড চেপে ধরে রাখুন",
    holding: "ধরে রাখুন...",
    confirmSos: "জরুরি অ্যালার্ট নিশ্চিত করুন",
    call999: "জাতীয় জরুরি সেবা: ৯৯৯",
    activeAlerts: "চলমান জরুরি অ্যালার্টসমূহ",
    allClear: "সব ঠিক আছে — এই মুহূর্তে আপনার এলাকায় কোনো জরুরি সতর্কবার্তা নেই।",
    wardHubTitle: "ঢাকা ওয়ার্ড কমিউনিটি",
    totalReports: "মোট রিপোর্ট",
    activeIssues: "অমীমাংসিত সমস্যা",
    resolvedIssues: "সমাধানকৃত",
    wardCommissioner: "স্থানীয় ওয়ার্ড কাউন্সিলর কার্যালয়",
    switchWard: "ওয়ার্ড পরিবর্তন",
    citizenScore: "নাগরিক কর্মা পয়েন্ট",
    volunteerBadge: "যাচাইকৃত কমিউনিটি ভলান্টিয়ার",
    myReports: "আমার রিপোর্টসমূহ",
    myUpvotes: "আমার আপভোট করা সমস্যা",
    topContributors: "শীর্ষ নাগরিক অবাদানকারী",
    rank: "র‌্যাংক",
    points: "পয়েন্ট",
  },
};

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("ua_lang") as Language;
    if (saved === "en" || saved === "bn") {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("ua_lang", lang);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: translations[language],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return ctx;
}
