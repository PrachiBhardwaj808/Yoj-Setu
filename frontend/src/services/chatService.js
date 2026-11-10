/**
 * Catalogue helper with Bhashini translation support.
 */
import { translateText } from './bhashiniService.js';
import { getAllSchemes } from './schemeService.js';
import api from './api.js';

const CATEGORY_TERMS = {
  agriculture: /farm|agri|kisan|किसान|ਖੇਤੀ|কৃষি|शेतकरी|விவசாயி|రైతు|ખેડૂત|ರೈತ|കർഷകൻ/i,
  health: /health|hospital|insurance|ayushman|स्वास्थ्य|सेहत|স্বাস্থ্য|आरोग্য|சுகாதாரம்|ఆరోగ్యం|આરોગ્ય|ಆರೋಗ್ಯ|ആരോഗ്യം/i,
  housing: /housing|house|ghar|awas|solar|आवास|घर|ਮਕਾਨ|ঘর|வீடு|ఇల్లు|ઘર|ಮನೆ|വീട്/i,
  education: /scholarship|education|study|college|छात्रवृत्ति|ਪੜ੍ਹਾਈ|বৃত্তি|शिष्यवृत्ती|கல்வி உதவித்தொகை|స్కాలర్‌షిప్|શિષ્યવૃત્તિ|ವಿದ್ಯಾರ್ಥಿವೇತನ|സ്കോളർഷിപ്പ്/i,
  employment: /mgnrega|employment|rural work|मनरेगा|ग्रामीण रोजगार|ਮਨਰੇਗਾ|গ্রামীণ কর্মসংস্থান|ஊரக வேலைவாய்ப்பு|గ్రామీణ ఉపాధి|ગ્રામીણ રોજગાર|ಗ್ರামীણ ಉದ್ಯೋಗ|ഗ്രামীണ തൊഴിൽ/i,
};

const ELIGIBILITY_TERMS = /eligible|eligibility|पात्र|योग्य|ਯੋਗ|যোগ্য|தகுதி|అర్హత|પાત્ર|ಅರ್ಹ|അർഹത/i;
const TRACKING_TERMS = /track|status|application|आवेदन|स्थिति|ਅਰਜ਼ੀ|ਸਥਿਤੀ|আবেদন|অবস্থা|விண்ணப்பம்|நிலை|దరఖాస్తు|స్థితి|અરજી|ಸ್ಥિતિ|ಅರ್ಜಿ|സ്ഥിതി|അപേക്ഷ|നില/i;

function schemeSearchText(scheme) {
  const rules = Array.isArray(scheme.rules)
    ? scheme.rules.map((rule) => rule.raw_condition_text || '').join(' ')
    : '';
  return [
    scheme.name,
    scheme.category,
    scheme.description,
    scheme.benefits,
    rules,
  ].filter(Boolean).join(' ').toLowerCase();
}

function formatScheme(scheme) {
  const details = [scheme.benefits || scheme.benefitAmount, scheme.description]
    .filter(Boolean)
    .join(' ');
  return `• ${scheme.name}${details ? `: ${details}` : ''}`;
}

/**
 * Answers using the current catalogue and local tracker behavior only.
 */
export async function sendMessage(text, language = 'en') {
  const query = String(text || '').trim();
  if (!query) {
    return 'Enter a question about a scheme in the catalogue.';
  }

  // Attempt backend assistant endpoint first
  try {
    const res = await api.post('/api/assistant/chat', { message: query, language });
    if (res?.data?.reply) {
      return res.data.reply;
    }
  } catch (err) {
    // Offline / fallback to local catalogue matching
  }

  let rawReply;
  const catalogue = await getAllSchemes();
    const category = Object.entries(CATEGORY_TERMS)
      .find(([, pattern]) => pattern.test(query))?.[0];
    const matchingSchemes = catalogue.filter((scheme) => {
      const fields = schemeSearchText(scheme);
      const schemeName = String(scheme.name || '').toLowerCase();
      return fields.includes(query.toLowerCase()) ||
        (schemeName && query.toLowerCase().includes(schemeName)) ||
        (category && String(scheme.category || '').toLowerCase().includes(category)) ||
        Object.values(CATEGORY_TERMS).some((pattern) => pattern.test(query) && pattern.test(fields));
    }).slice(0, 4);

    if (ELIGIBILITY_TERMS.test(query)) {
      rawReply = matchingSchemes.length
        ? `I can show catalogue information, but I cannot determine or confirm personal eligibility. Review the listed criteria and contact the official scheme source.\n\n${matchingSchemes.map(formatScheme).join('\n')}`
        : 'I cannot determine personal eligibility. No matching scheme was found in the current catalogue; browse the catalogue or check an official scheme source.';
    } else if (TRACKING_TERMS.test(query)) {
      rawReply = 'The tracker stores a private reminder in this browser. You can mark a scheme as planning or applied (self-reported); it does not submit an application or receive official status updates.';
    } else if (matchingSchemes.length) {
      rawReply = `Here is information listed in the current scheme catalogue:\n\n${matchingSchemes.map(formatScheme).join('\n')}\n\nCheck the scheme details and official source for eligibility, documents, and application steps.`;
    } else {
      rawReply = 'I could not find a matching scheme in the current catalogue. Browse the catalogue or search using a scheme name or category.';
    }

  if (language && language !== 'en') {
    return translateText(rawReply, language, 'en');
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

export function getSuggestedQuestions(language = 'en') {
  return MULTILINGUAL_SUGGESTIONS[language] || MULTILINGUAL_SUGGESTIONS.en;
}

export const SUGGESTED_QUESTIONS = MULTILINGUAL_SUGGESTIONS.en;
