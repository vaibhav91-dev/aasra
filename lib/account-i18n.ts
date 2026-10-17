import type { Language } from "./i18n";
const en = {
  account: "Account & backup",
  signIn: "Sign in",
  signUp: "Create account",
  username: "Username",
  email: "Email",
  password: "Password",
  passwordHint: "Use 12–128 characters. Never reuse a password.",
  usernameHint: "3–30 letters, numbers, dots or underscores.",
  signOut: "Sign out",
  guest: "On this device",
  cloud: "Saved to your account",
  cloudSaved: "All changes saved to your account.",
  cloudSaving: "Saving to your account…",
  cloudPending: "Changes not saved yet.",
  cloudError:
    "Cloud save failed. Your work remains on this screen. Retry before refreshing.",
  cloudConflict:
    "A newer version was saved in another tab or device. Copy any unsaved work before reloading your account.",
  cloudLoading: "Loading your saved records…",
  cloudConfig:
    "Cloud accounts need server database and authentication configuration. Device earnings still work.",
  cloudUnavailable:
    "Account service is unavailable. Try again before changing records.",
  authError:
    "Could not sign in or create the account. Check your details and try again.",
  privacy:
    "When signed in, earnings, completed chats, and grievance forms/drafts are saved to your account. Pasted document text and unsent chat input are not saved.",
  guestPrivacy:
    "Guest earnings stay on this device. Chat and grievances clear on refresh. Sign in to save them to your account.",
  import: "Import device earnings",
  importHint:
    "Review the count below, then import only if these device records belong to you. Import does not delete the device copy.",
  importConfirm: "Import these records",
  cancel: "Cancel",
  retry: "Retry save",
  reload: "Reload account",
  close: "Close",
  loginHint:
    "Create an account with email, username and password. Sign in using username and password. Email recovery is not configured yet.",
  savedEntries: "device entries",
  syncWait: "Please wait for saving to finish before signing out.",
  reloadConfirm:
    "Discard unsaved screen changes and load the latest account data?",
  checking: "Checking account…",
  switchHint:
    "Sign out clears account chats and drafts from this screen. Guest device entries are restored.",
};
type AccountStrings = typeof en;
const hi: AccountStrings = {
  account: "खाता और बैकअप",
  signIn: "साइन इन",
  signUp: "खाता बनाएँ",
  username: "यूज़रनेम",
  email: "ईमेल",
  password: "पासवर्ड",
  passwordHint: "12–128 अक्षर रखें। पुराना पासवर्ड न दोहराएँ।",
  usernameHint: "3–30 अंग्रेज़ी अक्षर, अंक, बिंदु या अंडरस्कोर।",
  signOut: "साइन आउट",
  guest: "इस डिवाइस पर",
  cloud: "आपके खाते में सुरक्षित",
  cloudSaved: "सभी बदलाव खाते में सहेजे गए।",
  cloudSaving: "खाते में सहेज रहे हैं…",
  cloudPending: "बदलाव अभी सहेजे नहीं गए।",
  cloudError:
    "खाते में सहेजना विफल। आपका काम स्क्रीन पर है। रीफ़्रेश से पहले फिर कोशिश करें।",
  cloudConflict:
    "दूसरे डिवाइस या टैब में नया संस्करण है। दोबारा लोड करने से पहले अपना काम कॉपी करें।",
  cloudLoading: "सहेजे रिकॉर्ड लोड हो रहे हैं…",
  cloudConfig:
    "खाते के लिए सर्वर पर डेटाबेस और लॉगिन सेटअप चाहिए। डिवाइस कमाई चलती रहेगी।",
  cloudUnavailable:
    "खाता सेवा उपलब्ध नहीं। रिकॉर्ड बदलने से पहले फिर कोशिश करें।",
  authError: "साइन इन या खाता बनाना विफल। विवरण जाँचें और फिर कोशिश करें।",
  privacy:
    "साइन इन पर कमाई, पूरी चैट और शिकायत फ़ॉर्म/मसौदे खाते में सहेजे जाते हैं। चिपकाया दस्तावेज़ और न भेजा सवाल नहीं सहेजते।",
  guestPrivacy:
    "अतिथि कमाई इस डिवाइस पर है। चैट और शिकायत रीफ़्रेश पर मिटते हैं। उन्हें सहेजने के लिए साइन इन करें।",
  import: "डिवाइस की कमाई लाएँ",
  importHint:
    "नीचे संख्या जाँचें। केवल अपने रिकॉर्ड लाएँ। डिवाइस की प्रति नहीं मिटेगी।",
  importConfirm: "ये रिकॉर्ड लाएँ",
  cancel: "रद्द करें",
  retry: "फिर सहेजें",
  reload: "खाता फिर लोड करें",
  close: "बंद करें",
  loginHint:
    "ईमेल, यूज़रनेम और पासवर्ड से खाता बनाएँ। यूज़रनेम और पासवर्ड से साइन इन करें। ईमेल से पासवर्ड वापसी अभी उपलब्ध नहीं।",
  savedEntries: "डिवाइस प्रविष्टियाँ",
  syncWait: "साइन आउट से पहले सहेजना पूरा होने दें।",
  reloadConfirm: "बिना सहेजे बदलाव छोड़कर खाते का नया डेटा लोड करें?",
  checking: "खाता जाँच रहे हैं…",
  switchHint:
    "साइन आउट पर खाते की चैट और मसौदे स्क्रीन से हटते हैं। अतिथि कमाई फिर दिखेगी।",
};
const pa: AccountStrings = {
  account: "ਖਾਤਾ ਅਤੇ ਬੈਕਅਪ",
  signIn: "ਸਾਈਨ ਇਨ",
  signUp: "ਖਾਤਾ ਬਣਾਓ",
  username: "ਯੂਜ਼ਰਨੇਮ",
  email: "ਈਮੇਲ",
  password: "ਪਾਸਵਰਡ",
  passwordHint: "12–128 ਅੱਖਰ ਰੱਖੋ। ਪੁਰਾਣਾ ਪਾਸਵਰਡ ਨਾ ਵਰਤੋ।",
  usernameHint: "3–30 ਅੰਗਰੇਜ਼ੀ ਅੱਖਰ, ਅੰਕ, ਬਿੰਦੂ ਜਾਂ ਅੰਡਰਸਕੋਰ।",
  signOut: "ਸਾਈਨ ਆਉਟ",
  guest: "ਇਸ ਡਿਵਾਈਸ ਤੇ",
  cloud: "ਤੁਹਾਡੇ ਖਾਤੇ ਵਿੱਚ ਸੰਭਾਲਿਆ",
  cloudSaved: "ਸਾਰੇ ਬਦਲਾਅ ਖਾਤੇ ਵਿੱਚ ਸੰਭਾਲੇ ਗਏ।",
  cloudSaving: "ਖਾਤੇ ਵਿੱਚ ਸੰਭਾਲ ਰਹੇ ਹਾਂ…",
  cloudPending: "ਬਦਲਾਅ ਅਜੇ ਨਹੀਂ ਸੰਭਾਲੇ।",
  cloudError:
    "ਖਾਤੇ ਵਿੱਚ ਸੰਭਾਲਣਾ ਫੇਲ੍ਹ। ਕੰਮ ਸਕ੍ਰੀਨ ਤੇ ਹੈ। ਰੀਫ਼੍ਰੈਸ਼ ਤੋਂ ਪਹਿਲਾਂ ਮੁੜ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
  cloudConflict:
    "ਦੂਜੇ ਟੈਬ ਜਾਂ ਡਿਵਾਈਸ ਤੇ ਨਵਾਂ ਵਰਜਨ ਹੈ। ਮੁੜ ਲੋਡ ਤੋਂ ਪਹਿਲਾਂ ਆਪਣਾ ਕੰਮ ਕਾਪੀ ਕਰੋ।",
  cloudLoading: "ਸੰਭਾਲੇ ਰਿਕਾਰਡ ਲੋਡ ਹੋ ਰਹੇ ਹਨ…",
  cloudConfig:
    "ਖਾਤੇ ਲਈ ਸਰਵਰ ਉੱਤੇ ਡਾਟਾਬੇਸ ਅਤੇ ਲਾਗਇਨ ਸੈਟਅਪ ਚਾਹੀਦਾ ਹੈ। ਡਿਵਾਈਸ ਕਮਾਈ ਚੱਲਦੀ ਰਹੇਗੀ।",
  cloudUnavailable:
    "ਖਾਤਾ ਸੇਵਾ ਉਪਲਬਧ ਨਹੀਂ। ਰਿਕਾਰਡ ਬਦਲਣ ਤੋਂ ਪਹਿਲਾਂ ਮੁੜ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
  authError: "ਸਾਈਨ ਇਨ ਜਾਂ ਖਾਤਾ ਬਣਾਉਣਾ ਫੇਲ੍ਹ। ਵੇਰਵੇ ਜਾਂਚੋ ਅਤੇ ਮੁੜ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
  privacy:
    "ਸਾਈਨ ਇਨ ਤੇ ਕਮਾਈ, ਪੂਰੀ ਚੈਟ ਅਤੇ ਸ਼ਿਕਾਇਤ ਫ਼ਾਰਮ/ਖਰੜੇ ਖਾਤੇ ਵਿੱਚ ਸੰਭਾਲੇ ਜਾਂਦੇ ਹਨ। ਪੇਸਟ ਦਸਤਾਵੇਜ਼ ਅਤੇ ਨਾ ਭੇਜਿਆ ਸਵਾਲ ਨਹੀਂ ਸੰਭਾਲਦੇ।",
  guestPrivacy:
    "ਮਹਿਮਾਨ ਕਮਾਈ ਡਿਵਾਈਸ ਤੇ ਹੈ। ਚੈਟ ਅਤੇ ਸ਼ਿਕਾਇਤ ਰੀਫ਼੍ਰੈਸ਼ ਤੇ ਮਿਟਦੇ ਹਨ। ਸੰਭਾਲਣ ਲਈ ਸਾਈਨ ਇਨ ਕਰੋ।",
  import: "ਡਿਵਾਈਸ ਕਮਾਈ ਲਿਆਓ",
  importHint:
    "ਹੇਠਾਂ ਗਿਣਤੀ ਜਾਂਚੋ। ਸਿਰਫ਼ ਆਪਣੇ ਰਿਕਾਰਡ ਲਿਆਓ। ਡਿਵਾਈਸ ਦੀ ਕਾਪੀ ਨਹੀਂ ਮਿਟੇਗੀ।",
  importConfirm: "ਇਹ ਰਿਕਾਰਡ ਲਿਆਓ",
  cancel: "ਰੱਦ ਕਰੋ",
  retry: "ਮੁੜ ਸੰਭਾਲੋ",
  reload: "ਖਾਤਾ ਮੁੜ ਲੋਡ ਕਰੋ",
  close: "ਬੰਦ ਕਰੋ",
  loginHint:
    "ਈਮੇਲ, ਯੂਜ਼ਰਨੇਮ ਅਤੇ ਪਾਸਵਰਡ ਨਾਲ ਖਾਤਾ ਬਣਾਓ। ਯੂਜ਼ਰਨੇਮ ਅਤੇ ਪਾਸਵਰਡ ਨਾਲ ਸਾਈਨ ਇਨ ਕਰੋ। ਈਮੇਲ ਪਾਸਵਰਡ ਵਾਪਸੀ ਅਜੇ ਨਹੀਂ ਹੈ।",
  savedEntries: "ਡਿਵਾਈਸ ਐਂਟਰੀਆਂ",
  syncWait: "ਸਾਈਨ ਆਉਟ ਤੋਂ ਪਹਿਲਾਂ ਸੰਭਾਲਣਾ ਪੂਰਾ ਹੋਣ ਦਿਓ।",
  reloadConfirm: "ਬਿਨਾਂ ਸੰਭਾਲੇ ਬਦਲਾਅ ਛੱਡ ਕੇ ਖਾਤੇ ਦਾ ਨਵਾਂ ਡਾਟਾ ਲੋਡ ਕਰਨਾ ਹੈ?",
  checking: "ਖਾਤਾ ਜਾਂਚ ਰਹੇ ਹਾਂ…",
  switchHint:
    "ਸਾਈਨ ਆਉਟ ਨਾਲ ਖਾਤੇ ਦੀ ਚੈਟ ਅਤੇ ਖਰੜੇ ਸਕ੍ਰੀਨ ਤੋਂ ਹਟਦੇ ਹਨ। ਮਹਿਮਾਨ ਕਮਾਈ ਮੁੜ ਦਿਸੇਗੀ।",
};
export const accountStrings: Record<Language, AccountStrings> = { en, hi, pa };
