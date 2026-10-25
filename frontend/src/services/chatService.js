/**
 * chatService.js
 * Conversational scheme advisory service with Bhashini integration and multilingual support.
 */

import { translateText } from './bhashiniService';

const MOCK_RESPONSES = [
  {
    pattern: /kisan|farmer|farm|agriculture|किसान|ਖੇਤੀ|কৃষি|शेतकरी|விவசாயி|రైతు|ખેડૂત|ರೈತ|കർഷകൻ/i,
    reply:
      'PM Kisan Samman Nidhi gives ₹6,000 per year directly to your bank account. If you are a registered farmer with land under 2 hectares, you likely qualify. Would you like me to check your eligibility?',
  },
  {
    pattern: /health|hospital|insurance|ayushman|स्वास्थ्य|सेहत|স্বাস্থ্য|आरोग्य|சுகாதாரம்|ఆరోగ్యం|આરોગ્ય|ಆರೋಗ್ಯ|ആരോഗ്യം/i,
    reply:
      'Ayushman Bharat PM-JAY provides up to ₹5,00,000 per year in health insurance coverage. Treatment at any empanelled government or private hospital is free. Shall I help you apply?',
  },
  {
    pattern: /housing|house|ghar|awas|आवास|घर|ਮਕਾਨ|ঘর|வீடு|ఇల్లు|ઘર|ಮನೆ|വീട്/i,
    reply:
      'PM Awas Yojana offers housing subsidies of up to ₹2.67 lakh for urban families. PM Surya Ghar Muft Bijli additionally provides up to ₹78,000 for solar panels. Would you like details on both?',
  },
  {
    pattern: /scholarship|education|study|college|छात्रवृत्ति|ਪੜ੍ਹਾਈ|বৃত্তি|शिष्यवृत्ती|கல்வி உதவித்தொகை|స్కాలర్‌షిప్|શિષ્યવૃત્તિ|ವಿದ್ಯಾರ್ಥಿವೇತನ|സ്കോളർഷിപ്പ്/i,
    reply:
      'PM Scholarship for Higher Education provides ₹36,000 per year for eligible students. You need minimum 80% marks and family income below ₹8 lakh. Should I check your profile for eligibility?',
  },
  {
    pattern: /pension|atal|apy|पेंशन|ਪੈਨਸ਼ਨ|পেনশন|पेन्शन|ஓய்வூதியம்|పెన్షన్|પેન્શન|ಪಿಂಚಣಿ|പെൻഷൻ/i,
    reply:
      'Atal Pension Yojana guarantees ₹1,000 to ₹5,000 per month pension for workers in the unorganized sector. You can enroll if you are between 18–40 years old with a bank account.',
  },
  {
    pattern: /loan|mudra|business|ऋण|लोन|ਕਰਜ਼ਾ|ঋণ|कर्ज|கடன்|రుణం|લોન|ಸಾಲ|വായ്പ/i,
    reply:
      'Mudra Loan Scheme provides collateral-free loans up to ₹10 lakh for small business owners. Three tiers: Shishu (up to ₹50K), Kishore (₹50K–5L), Tarun (₹5L–10L). Want to know which tier fits your need?',
  },
  {
    pattern: /scheme|yojana|benefit|योजना|ਯੋਜਨਾ|প্রকল্প|திட்டம்|పథకం|યોજના|ಯೋಜನೆ|പദ്ധതി/i,
    reply:
      'There are 500+ Central and State government schemes available. Based on your profile, I can recommend the most relevant ones. Would you like me to run a full eligibility check?',
  },
];

const DEFAULT_RESPONSE =
  "I'm Yojsetu AI Sathi — I can help you find government schemes, check your eligibility, and guide your applications. Try asking me about farming, health, housing, education, or loans!";

/**
 * Sends user prompt to the advisory service and returns a response localized in the selected language.
 *
 * @param {string} text - User query
 * @param {string} language - Target language code (default 'en')
 * @returns {Promise<string>} Localized AI response
 */
export async function sendMessage(text, language = 'en') {
  await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));
  const match = MOCK_RESPONSES.find((r) => r.pattern.test(text));
  const rawReply = match?.reply ?? DEFAULT_RESPONSE;

  if (language && language !== 'en') {
    return await translateText(rawReply, language, 'en');
  }

  return rawReply;
}

export const MULTILINGUAL_SUGGESTIONS = {
  en: [
    'What farming schemes am I eligible for?',
    'How do I apply for Ayushman Bharat?',
    'What is PM Awas Yojana subsidy?',
    'Can I get a Mudra business loan?',
    'How to track my application status?',
  ],
  hi: [
    'मैं किन कृषि योजनाओं के लिए पात्र हूँ?',
    'आयुष्मान भारत कार्ड के लिए आवेदन कैसे करें?',
    'पीएम आवास योजना की सब्सिडी क्या है?',
    'क्या मुझे मुद्रा व्यापार ऋण मिल सकता है?',
    'आवेदन की स्थिति कैसे ट्रैक करें?',
  ],
  pa: [
    'ਮੈਂ ਕਿਹੜੀਆਂ ਖੇਤੀਬਾੜੀ ਸਕੀਮਾਂ ਲਈ ਯੋਗ ਹਾਂ?',
    'ਆਯੁਸ਼ਮਾਨ ਭਾਰਤ ਲਈ ਅਰਜ਼ੀ ਕਿਵੇਂ ਦੇਣੀ ਹੈ?',
    'ਪੀਐਮ ਆਵਾਸ ਯੋਜਨਾ ਸਬਸਿਡੀ ਕੀ ਹੈ?',
    'ਕੀ ਮੈਨੂੰ ਮੁਦਰਾ ਲੋਨ ਮਿਲ ਸਕਦਾ ਹੈ?',
  ],
  bn: [
    'আমি কোন কোন কৃষি প্রকল্পের জন্য যোগ্য?',
    'আয়ুষ্মান ভারতের জন্য কীভাবে আবেদন করব?',
    'পিএম আবাস যোজনার ভর্তুকি কত?',
    'মুদ্রা ব্যবসার ঋণ কীভাবে পাব?',
  ],
  mr: [
    'मी कोणत्या कृषी योजनांसाठी पात्र आहे?',
    'आयुष्मान भारतसाठी अर्ज कसा करावा?',
    'पीएम आवास योजना अनुदान काय आहे?',
    'मुद्रा व्यवसाय कर्ज कसे मिळवायचे?',
  ],
  ta: [
    'நான் எந்த விவசாயத் திட்டங்களுக்கு தகுதியானவன்?',
    'ஆயுஷ்மான் பாரத்திற்கு எவ்வாறு விண்ணப்பிப்பது?',
    'பிரதம மந்திரி அவாஸ் யோஜனா மானியம் என்ன?',
    'முத்ரா வணிக கடன் பெற முடியுமா?',
  ],
  te: [
    'నేను ఏ వ్యవసాయ పథకాలకు అర్హుడిని?',
    'ఆయుష్మాన్ భారత్ కోసం ఎలా దరఖాస్తు చేయాలి?',
    'పీఎం ఆవాస్ యోజన రాయితీ ఎంత?',
    'ముద్రా వ్యాపార రుణం పొందవచ్చా?',
  ],
  gu: [
    'હું કઈ કૃષિ યોજનાઓ માટે પાત્ર છું?',
    'આયુષ્માન ભારત માટે કેવી રીતે અરજી કરવી?',
    'પીએમ આવાસ યોજના સબસિડી શું છે?',
    'શું મને મુદ્રા લોન મળી શકે?',
  ],
  kn: [
    'ನಾನು ಯಾವ ಕೃಷಿ ಯೋಜನೆಗಳಿಗೆ ಅರ್ಹನಾಗಿದ್ದೇನೆ?',
    'ಆಯುಷ್ಮಾನ್ ಭಾರತ್‌ಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸುವುದು ಹೇಗೆ?',
    'ಪಿಎಂ ಆವಾಸ್ ಯೋಜನೆ ಸಬ್ಸಿಡಿ ಏನು?',
    'ಮುದ್ರಾ ವ್ಯಾಪಾರ ಸಾಲ ಪಡೆಯಬಹುದೇ?',
  ],
  ml: [
    'ഏതൊക്കെ കാർഷിക പദ്ധതികൾക്കാണ് എനിക്ക് അർഹതയുള്ളത്?',
    'ആയുഷ്മാൻ ഭാരതിന് എങ്ങനെ അപേക്ഷിക്കാം?',
    'പിഎം ആവാസ് യോജന സബ്‌സിഡി എത്രയാണ്?',
    'മുദ്ര ബിസിനസ്സ് വായ്പ ലഭിക്കുമോ?',
  ],
};

/**
 * Returns suggested starter questions tailored to the selected language.
 */
export function getSuggestedQuestions(language = 'en') {
  return MULTILINGUAL_SUGGESTIONS[language] || MULTILINGUAL_SUGGESTIONS.en;
}

// Backward-compatible default export
export const SUGGESTED_QUESTIONS = MULTILINGUAL_SUGGESTIONS.en;
