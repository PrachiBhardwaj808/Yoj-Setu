/**
 * chatService.js
 * Conversational scheme advisory service with Bhashini integration and multilingual support.
 */

import { translateText } from './bhashiniService.js';

const MOCK_RESPONSES = [
  {
    pattern: /kisan|farmer|farm|agriculture|किसान|ਖੇਤੀ|কৃষি|शेतकरी|விவசாயி|రైతు|ખેડૂત|ರೈತ|കർഷകൻ/i,
    reply:
      'The catalogue lists PM Kisan Samman Nidhi with ₹6,000 / year direct transfer. See the scheme details for eligibility and required documents.',
  },
  {
    pattern: /health|hospital|insurance|ayushman|स्वास्थ्य|सेहत|স্বাস্থ্য|आरोग्य|சுகாதாரம்|ఆరోగ్యం|આરોગ્ય|ಆರೋಗ್ಯ|ആരോഗ്യം/i,
    reply:
      'The catalogue lists Ayushman Bharat (PM-JAY) with ₹5 Lakhs health cover / year. See the scheme details and official portal before applying.',
  },
  {
    pattern: /housing|house|ghar|awas|आवास|घर|ਮਕਾਨ|ঘর|வீடு|ఇల్లు|ઘર|ಮನೆ|വീട്/i,
    reply:
      'The catalogue lists PM Awas Yojana (PMAY-Urban/Rural) with up to ₹2.5 Lakhs house subsidy, and PM Surya Ghar: Muft Bijli Yojana with up to ₹78,000 solar subsidy. Check each scheme’s details for eligibility.',
  },
  {
    pattern: /scholarship|education|study|college|छात्रवृत्ति|ਪੜ੍ਹਾਈ|বৃত্তি|शिष्यवृत्ती|கல்வி உதவித்தொகை|స్కాలర్‌షిప్|શિષ્યવૃત્તિ|ವಿದ್ಯಾರ್ಥಿವೇತನ|സ്കോളർഷിപ്പ്/i,
    reply:
      'The catalogue lists the Post-Matric Scholarship Scheme with 100% tuition + allowance. See the scheme details for eligibility and required documents.',
  },
  {
    pattern: /pension|atal|apy|पेंशन|ਪੈਨਸ਼ਨ|পেনশন|पेन्शन|ஓய்வூதியம்|పెన్షన్|પેન્શન|ಪಿಂಚಣಿ|പെൻഷൻ/i,
    reply:
      'I do not have a verified pension scheme in the current catalogue. Please check the catalogue for currently listed schemes.',
  },
  {
    pattern: /loan|mudra|business|ऋण|लोन|ਕਰਜ਼ਾ|ঋণ|कर्ज|கடன்|రుణం|લોન|ಸાલ|ಸಾಲ|വായ്പ/i,
    reply:
      'I do not have a verified business-loan scheme in the current catalogue. Please check the catalogue for currently listed schemes.',
  },
  {
    pattern: /mgnrega|employment|rural work|मनरेगा|ग्रामीण रोजगार|ਮਨਰੇਗਾ|গ্রামীণ কর্মসংস্থান|मनरेगा|ஊரக வேலைவாய்ப்பு|గ్రామీణ ఉపాధి|ગ્રામીણ રોજગાર|ಗ್ರಾಮೀಣ ಉದ್ಯೋಗ|ഗ്രാമീണ തൊഴിൽ/i,
    reply:
      'The catalogue lists MGNREGA Rural Employment Guarantee as providing 100 days of wage employment in a financial year for adult members of rural households.',
  },
  {
    pattern: /scheme|yojana|benefit|योजना|ਯੋਜਨਾ|প্রকল্প|திட்டம்|పథకం|યોજના|ಯೋಜನೆ|പദ്ധതി/i,
    reply:
      'I can help with schemes in the current catalogue. Ask about farming, health, housing, education, or employment, or check the catalogue for available schemes.',
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
    'How does MGNREGA support rural employment?',
    'How to track my application status?',
  ],
  hi: [
    'मैं किन कृषि योजनाओं के लिए पात्र हूँ?',
    'आयुष्मान भारत कार्ड के लिए आवेदन कैसे करें?',
    'पीएम आवास योजना की सब्सिडी क्या है?',
    'मनरेगा ग्रामीण रोजगार को कैसे समर्थन देता है?',
    'आवेदन की स्थिति कैसे ट्रैक करें?',
  ],
  pa: [
    'ਮੈਂ ਕਿਹੜੀਆਂ ਖੇਤੀਬਾੜੀ ਸਕੀਮਾਂ ਲਈ ਯੋਗ ਹਾਂ?',
    'ਆਯੁਸ਼ਮਾਨ ਭਾਰਤ ਲਈ ਅਰਜ਼ੀ ਕਿਵੇਂ ਦੇਣੀ ਹੈ?',
    'ਪੀਐਮ ਆਵਾਸ ਯੋਜਨਾ ਸਬਸਿਡੀ ਕੀ ਹੈ?',
    'ਮਨਰੇਗਾ ਪੇਂਡੂ ਰੁਜ਼ਗਾਰ ਵਿੱਚ ਕਿਵੇਂ ਮਦਦ ਕਰਦਾ ਹੈ?',
  ],
  bn: [
    'আমি কোন কোন কৃষি প্রকল্পের জন্য যোগ্য?',
    'আয়ুষ্মান ভারতের জন্য কীভাবে আবেদন করব?',
    'পিএম আবাস যোজনার ভর্তুকি কত?',
    'মনরেগা কীভাবে গ্রামীণ কর্মসংস্থানে সহায়তা করে?',
  ],
  mr: [
    'मी कोणत्या कृषी योजनांसाठी पात्र आहे?',
    'आयुष्मान भारतसाठी अर्ज कसा करावा?',
    'पीएम आवास योजना अनुदान काय आहे?',
    'मनरेगा ग्रामीण रोजगाराला कशी मदत करते?',
  ],
  ta: [
    'நான் எந்த விவசாயத் திட்டங்களுக்கு தகுதியானவன்?',
    'ஆயுஷ்மான் பாரத்திற்கு எவ்வாறு விண்ணப்பிப்பது?',
    'பிரதம மந்திரி அவாஸ் யோஜனா மானியம் என்ன?',
    'மகாத்மா காந்தி தேசிய ஊரக வேலை உறுதித் திட்டம் கிராமப்புற வேலைவாய்ப்புக்கு எவ்வாறு உதவுகிறது?',
  ],
  te: [
    'నేను ఏ వ్యవసాయ పథకాలకు అర్హుడిని?',
    'ఆయుష్మాన్ భారత్ కోసం ఎలా దరఖాస్తు చేయాలి?',
    'పీఎం ఆవాస్ యోజన రాయితీ ఎంత?',
    'ఎంజీఎన్ఆర్ఈజీఏ గ్రామీణ ఉపాధికి ఎలా తోడ్పడుతుంది?',
  ],
  gu: [
    'હું કઈ કૃષિ યોજનાઓ માટે પાત્ર છું?',
    'આયુષ્માન ભારત માટે કેવી રીતે અરજી કરવી?',
    'પીએમ આવાસ યોજના સબસિડી શું છે?',
    'મનરેગા ગ્રામ્ય રોજગારમાં કેવી રીતે મદદ કરે છે?',
  ],
  kn: [
    'ನಾನು ಯಾವ ಕೃಷಿ ಯೋಜನೆಗಳಿಗೆ ಅರ್ಹನಾಗಿದ್ದೇನೆ?',
    'ಆಯುಷ್ಮಾನ್ ಭಾರತ್‌ಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸುವುದು ಹೇಗೆ?',
    'ಪಿಎಂ ಆವಾಸ್ ಯೋಜನೆ ಸಬ್ಸಿಡಿ ಏನು?',
    'ಮನರೇಗಾ ಗ್ರಾಮೀಣ ಉದ್ಯೋಗಕ್ಕೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡುತ್ತದೆ?',
  ],
  ml: [
    'ഏതൊക്കെ കാർഷിക പദ്ധതികൾക്കാണ് എനിക്ക് അർഹതയുള്ളത്?',
    'ആയുഷ്മാൻ ഭാരതിന് എങ്ങനെ അപേക്ഷിക്കാം?',
    'പിഎം ആവാസ് യോജന സബ്‌സിഡി എത്രയാണ്?',
    'മന്രേഗ ഗ്രാമീണ തൊഴിലിനെ എങ്ങനെ സഹായിക്കുന്നു?',
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
