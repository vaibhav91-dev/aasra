import type { Language } from "./i18n";

export const officialSources = [
  {
    title: "myScheme",
    url: "https://www.myscheme.gov.in/",
    summary:
      "Government scheme discovery across central and State/UT schemes. Users can review eligibility, benefits, documents and application steps on the relevant scheme page.",
  },
  {
    title: "e-Shram",
    url: "https://eshram.gov.in/",
    summary:
      "Official Ministry of Labour and Employment portal for unorganised workers. Check the portal for registration information; registration must not be described as a guarantee of benefits.",
  },
] as const;

export const guidance = {
  en: {
    title: "Take your next step",
    safety: "Workplace safety",
    rights: "Know my rights",
    welfare: "Find welfare schemes",
    state: "State or Union Territory",
    work: "Type of work",
    hint: "For local guidance, add your state and type of work. No address or identity numbers needed.",
    sources: "Official starting points",
    caveat:
      "Eligibility depends on the scheme and your circumstances. Confirm current rules on the official scheme page. Aasra cannot verify eligibility or guarantee legal accuracy.",
    journey: "From earnings to action",
    steps:
      "1. Record earnings → 2. Explain a payment notice → 3. Review facts and draft a grievance → 4. Sign in, wait for Saved, then refresh to restore your work.",
    safetyPrompt:
      "Help me make a practical workplace safety checklist. Ask about my work and immediate risks.",
    rightsPrompt:
      "Help me understand rights relevant to my work. Ask my state and work arrangement before giving local guidance. Distinguish general guidance from verified law.",
    welfarePrompt:
      "Help me find welfare schemes. First ask my state or Union Territory and type of work if missing. Use the supplied official sources, explain what I must check, and do not assume I am eligible.",
  },
  hi: {
    title: "अपना अगला कदम चुनें",
    safety: "काम की सुरक्षा",
    rights: "अपने अधिकार जानें",
    welfare: "कल्याण योजनाएँ खोजें",
    state: "राज्य या केंद्र शासित प्रदेश",
    work: "काम का प्रकार",
    hint: "स्थानीय जानकारी के लिए राज्य और काम का प्रकार बताएँ। पता या पहचान संख्या न दें।",
    sources: "आधिकारिक जानकारी",
    caveat:
      "पात्रता योजना और आपकी स्थिति पर निर्भर है। आधिकारिक योजना पृष्ठ पर वर्तमान नियम जाँचें। आसरा पात्रता या कानूनी सटीकता की गारंटी नहीं देता।",
    journey: "कमाई से अगले कदम तक",
    steps:
      "1. कमाई दर्ज करें → 2. भुगतान नोटिस समझें → 3. तथ्य जाँचकर शिकायत का मसौदा बनाएँ → 4. साइन इन करें, सहेजे जाने का इंतज़ार करें, फिर रीफ़्रेश करके देखें।",
    safetyPrompt:
      "मेरे काम की सुरक्षा की व्यावहारिक सूची बनाने में मदद करें। मेरे काम और तत्काल जोखिम पूछें।",
    rightsPrompt:
      "मेरे काम से जुड़े अधिकार समझाएँ। स्थानीय जानकारी देने से पहले मेरा राज्य और काम का प्रकार पूछें। सामान्य जानकारी और सत्यापित कानून में अंतर बताएँ।",
    welfarePrompt:
      "कल्याण योजनाएँ खोजने में मदद करें। पहले मेरा राज्य और काम का प्रकार पूछें अगर नहीं बताया है। दिए गए आधिकारिक स्रोतों का उपयोग करें और पात्रता की गारंटी न दें।",
  },
  pa: {
    title: "ਆਪਣਾ ਅਗਲਾ ਕਦਮ ਚੁਣੋ",
    safety: "ਕੰਮ ਦੀ ਸੁਰੱਖਿਆ",
    rights: "ਆਪਣੇ ਹੱਕ ਜਾਣੋ",
    welfare: "ਭਲਾਈ ਯੋਜਨਾਵਾਂ ਲੱਭੋ",
    state: "ਰਾਜ ਜਾਂ ਕੇਂਦਰ ਸ਼ਾਸਿਤ ਪ੍ਰਦੇਸ਼",
    work: "ਕੰਮ ਦੀ ਕਿਸਮ",
    hint: "ਸਥਾਨਕ ਜਾਣਕਾਰੀ ਲਈ ਰਾਜ ਅਤੇ ਕੰਮ ਦੀ ਕਿਸਮ ਦੱਸੋ। ਪਤਾ ਜਾਂ ਪਛਾਣ ਨੰਬਰ ਨਾ ਦਿਓ।",
    sources: "ਅਧਿਕਾਰਤ ਜਾਣਕਾਰੀ",
    caveat:
      "ਯੋਗਤਾ ਯੋਜਨਾ ਅਤੇ ਤੁਹਾਡੀ ਸਥਿਤੀ ਉੱਤੇ ਨਿਰਭਰ ਹੈ। ਅਧਿਕਾਰਤ ਪੰਨੇ ਉੱਤੇ ਮੌਜੂਦਾ ਨਿਯਮ ਜਾਂਚੋ। ਆਸਰਾ ਯੋਗਤਾ ਜਾਂ ਕਾਨੂੰਨੀ ਸਹੀਪਣ ਦੀ ਗਾਰੰਟੀ ਨਹੀਂ ਦਿੰਦਾ।",
    journey: "ਕਮਾਈ ਤੋਂ ਅਗਲੇ ਕਦਮ ਤੱਕ",
    steps:
      "1. ਕਮਾਈ ਦਰਜ ਕਰੋ → 2. ਭੁਗਤਾਨ ਨੋਟਿਸ ਸਮਝੋ → 3. ਤੱਥ ਜਾਂਚ ਕੇ ਸ਼ਿਕਾਇਤ ਦਾ ਖਰੜਾ ਬਣਾਓ → 4. ਸਾਈਨ ਇਨ ਕਰੋ, ਸੰਭਾਲਣ ਦੀ ਉਡੀਕ ਕਰੋ, ਫਿਰ ਰੀਫ਼੍ਰੈਸ਼ ਕਰਕੇ ਵੇਖੋ।",
    safetyPrompt:
      "ਮੇਰੇ ਕੰਮ ਦੀ ਸੁਰੱਖਿਆ ਦੀ ਸੂਚੀ ਬਣਾਉਣ ਵਿੱਚ ਮਦਦ ਕਰੋ। ਮੇਰੇ ਕੰਮ ਅਤੇ ਤੁਰੰਤ ਖ਼ਤਰਿਆਂ ਬਾਰੇ ਪੁੱਛੋ।",
    rightsPrompt:
      "ਮੇਰੇ ਕੰਮ ਨਾਲ ਜੁੜੇ ਹੱਕ ਸਮਝਾਓ। ਸਥਾਨਕ ਜਾਣਕਾਰੀ ਤੋਂ ਪਹਿਲਾਂ ਮੇਰਾ ਰਾਜ ਅਤੇ ਕੰਮ ਦੀ ਕਿਸਮ ਪੁੱਛੋ। ਆਮ ਜਾਣਕਾਰੀ ਅਤੇ ਤਸਦੀਕ ਕੀਤੇ ਕਾਨੂੰਨ ਵਿੱਚ ਫ਼ਰਕ ਦੱਸੋ।",
    welfarePrompt:
      "ਭਲਾਈ ਯੋਜਨਾਵਾਂ ਲੱਭਣ ਵਿੱਚ ਮਦਦ ਕਰੋ। ਪਹਿਲਾਂ ਮੇਰਾ ਰਾਜ ਅਤੇ ਕੰਮ ਦੀ ਕਿਸਮ ਪੁੱਛੋ ਜੇ ਨਹੀਂ ਦੱਸੇ। ਦਿੱਤੇ ਅਧਿਕਾਰਤ ਸਰੋਤ ਵਰਤੋ ਅਤੇ ਯੋਗਤਾ ਦੀ ਗਾਰੰਟੀ ਨਾ ਦਿਓ।",
  },
} satisfies Record<Language, Record<string, string>>;
