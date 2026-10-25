/**
 * bhashiniService.js
 * Integration layer for Digital India Bhashini (National Language Translation Mission - MeitY).
 * Provides NMT (Neural Machine Translation) with deterministic offline fallbacks for supported Indian languages.
 */

import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '@/translations';

// Common scheme keywords and phrases mapped to Indian languages
const SCHEME_TRANSLATION_MAP = {
  hi: {
    'PM Kisan Samman Nidhi gives ₹6,000 per year directly to your bank account. If you are a registered farmer with land under 2 hectares, you likely qualify. Would you like me to check your eligibility?':
      'पीएम किसान सम्मान निधि आपके बैंक खाते में सीधे ₹6,000 प्रति वर्ष प्रदान करती है। यदि आप 2 हेक्टेयर से कम भूमि वाले पंजीकृत किसान हैं, तो आप पात्र हैं। क्या आप चाहते हैं कि मैं आपकी पात्रता की जांच करूँ?',
    'Ayushman Bharat PM-JAY provides up to ₹5,00,000 per year in health insurance coverage. Treatment at any empanelled government or private hospital is free. Shall I help you apply?':
      'आयुष्मान भारत पीएम-जेएवाई ₹5,00,000 प्रति वर्ष तक का स्वास्थ्य बीमा कवरेज प्रदान करता है। किसी भी सूचीबद्ध सरकारी या निजी अस्पताल में इलाज निःशुल्क है। क्या मैं आवेदन करने में आपकी सहायता करूँ?',
    'PM Awas Yojana offers housing subsidies of up to ₹2.67 lakh for urban families. PM Surya Ghar Muft Bijli additionally provides up to ₹78,000 for solar panels. Would you like details on both?':
      'पीएम आवास योजना शहरी परिवारों को ₹2.67 लाख तक की आवास सब्सिडी प्रदान करती है। पीएम सूर्य घर मुफ्त बिजली योजना सौर पैनलों के लिए ₹78,000 तक अतिरिक्त प्रदान करती है। क्या आप दोनों का विवरण चाहते हैं?',
    'PM Scholarship for Higher Education provides ₹36,000 per year for eligible students. You need minimum 80% marks and family income below ₹8 lakh. Should I check your profile for eligibility?':
      'उच्च शिक्षा के लिए पीएम छात्रवृत्ति योग्य छात्रों को ₹36,000 प्रति वर्ष प्रदान करती है। इसके लिए न्यूनतम 80% अंक और पारिवारिक आय ₹8 लाख से कम होनी चाहिए। क्या मैं पात्रता के लिए आपकी प्रोफ़ाइल जांचूं?',
    'Atal Pension Yojana guarantees ₹1,000 to ₹5,000 per month pension for workers in the unorganized sector. You can enroll if you are between 18–40 years old with a bank account.':
      'अटल पेंशन योजना असंगठित क्षेत्र के श्रमिकों के लिए ₹1,000 से ₹5,000 प्रति माह पेंशन की गारंटी देती है। यदि आप बैंक खाते के साथ 18-40 वर्ष की आयु के हैं तो आप नामांकन कर सकते हैं।',
    'Mudra Loan Scheme provides collateral-free loans up to ₹10 lakh for small business owners. Three tiers: Shishu (up to ₹50K), Kishore (₹50K–5L), Tarun (₹5L–10L). Want to know which tier fits your need?':
      'मुद्रा ऋण योजना छोटे व्यवसाय मालिकों के लिए ₹10 लाख तक संपार्श्विक-मुक्त ऋण प्रदान करती है। तीन श्रेणियां: शिशु (₹50,000 तक), किशोर (₹50 हजार-5 लाख), तरुण (₹5-10 लाख)। क्या आप जानना चाहते हैं कि कौन सा आपकी आवश्यकता के अनुकूल है?',
    'There are 500+ Central and State government schemes available. Based on your profile, I can recommend the most relevant ones. Would you like me to run a full eligibility check?':
      '500+ से अधिक केंद्रीय और राज्य सरकारी योजनाएं उपलब्ध हैं। आपकी प्रोफ़ाइल के आधार पर, मैं सबसे प्रासंगिक योजनाओं की सिफारिश कर सकता हूँ। क्या आप पूर्ण पात्रता जांच चलाना चाहते हैं?',
    "I'm Yojsetu AI Sathi — I can help you find government schemes, check your eligibility, and guide your applications. Try asking me about farming, health, housing, education, or loans!":
      'मैं योजसेतु एआई साथी हूँ — मैं आपको सरकारी योजनाएं खोजने, पात्रता जांचने और आवेदन में मार्गदर्शन करने में मदद कर सकता हूँ। मुझसे खेती, स्वास्थ्य, आवास, शिक्षा या ऋण के बारे में पूछें!',
  },
  bn: {
    "I'm Yojsetu AI Sathi — I can help you find government schemes, check your eligibility, and guide your applications. Try asking me about farming, health, housing, education, or loans!":
      'আমি যোজসেতু এআই সাথী — সরকারি প্রকল্প খোঁজা, যোগ্যতা যাচাই ও আবেদনে আপনাকে সহায়তা করতে পারি। কৃষি, স্বাস্থ্য, বাসস্থান বা শিক্ষা নিয়ে আমাকে জিজ্ঞাসা করতে পারেন!',
  },
  mr: {
    "I'm Yojsetu AI Sathi — I can help you find government schemes, check your eligibility, and guide your applications. Try asking me about farming, health, housing, education, or loans!":
      'मी योजसेतू एआय साथी आहे — मी तुम्हाला शासकीय योजना शोधण्यात, पात्रता तपासण्यात आणि अर्जासाठी मार्गदर्शन करण्यात मदत करू शकतो!',
  },
  ta: {
    "I'm Yojsetu AI Sathi — I can help you find government schemes, check your eligibility, and guide your applications. Try asking me about farming, health, housing, education, or loans!":
      'நான் யோஜ்சேது AI சாதி — அரசு திட்டங்களைக் கண்டறியவும், தகுதியைச் சரிபார்க்கவும், விண்ணப்பங்களுக்கு வழிகாட்டவும் உங்களுக்கு உதவ முடியும்!',
  },
  te: {
    "I'm Yojsetu AI Sathi — I can help you find government schemes, check your eligibility, and guide your applications. Try asking me about farming, health, housing, education, or loans!":
      'నేను యోజసేతు AI సాథి — ప్రభుత్వ పథకాలను కనుగొనడంలో, మీ అర్హతను తనిఖీ చేయడంలో మరియు మార్గదర్శకత్వం చేయడంలో సహాయపడతాను!',
  },
  pa: {
    "I'm Yojsetu AI Sathi — I can help you find government schemes, check your eligibility, and guide your applications. Try asking me about farming, health, housing, education, or loans!":
      'ਮੈਂ ਯੋਜਸੇਤੂ ਏਆਈ ਸਾਥੀ ਹਾਂ — ਮੈਂ ਸਰਕਾਰੀ ਸਕੀਮਾਂ ਲੱਭਣ, ਤੁਹਾਡੀ ਯੋਗਤਾ ਦੀ ਜਾਂਚ ਕਰਨ ਅਤੇ ਤੁਹਾਡੀਆਂ ਅਰਜ਼ੀਆਂ ਵਿੱਚ ਤੁਹਾਡੀ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ!',
  },
  gu: {
    "I'm Yojsetu AI Sathi — I can help you find government schemes, check your eligibility, and guide your applications. Try asking me about farming, health, housing, education, or loans!":
      'હું યોજસેતુ AI સાથી છું — હું તમને સરકારી યોજનાઓ શોધવામાં, પાત્રતા ચકાસવામાં અને અરજી કરવામાં મદદ કરી શકું છું!',
  },
  kn: {
    "I'm Yojsetu AI Sathi — I can help you find government schemes, check your eligibility, and guide your applications. Try asking me about farming, health, housing, education, or loans!":
      'ನಾನು ಯೋಜಸೇತು AI ಸಾಥಿ — ಸರ್ಕಾರಿ ಯೋಜನೆಗಳನ್ನು ಹುಡುಕಲು, ನಿಮ್ಮ ಅರ್ಹತೆ ಪರಿಶೀಲಿಸಲು ಮತ್ತು ಅಪ್ಲಿಕೇಶನ್‌ನಲ್ಲಿ ನಿಮಗೆ ಮಾರ್ಗದರ್ಶನ ನೀಡಲು ಸಹಾಯ ಮಾಡುತ್ತೇನೆ!',
  },
  ml: {
    "I'm Yojsetu AI Sathi — I can help you find government schemes, check your eligibility, and guide your applications. Try asking me about farming, health, housing, education, or loans!":
      'ഞാൻ യോജ്സേതു AI സാഥി — സർക്കാർ പദ്ധതികൾ കണ്ടെത്താനും അർഹത പരിശോധിക്കാനും അപേക്ഷകളിൽ സഹായിക്കാനും ഞാൻ തയ്യാറാണ്!',
  },
};

/**
 * Translates text into target Indian language using Bhashini pipeline or local translation dictionary.
 *
 * @param {string} text - Source text in English
 * @param {string} targetLang - Target language code ('hi', 'pa', 'bn', etc.)
 * @param {string} sourceLang - Source language code (default 'en')
 * @returns {Promise<string>} Translated text or original text as fallback
 */
export async function translateText(text, targetLang = DEFAULT_LANGUAGE, sourceLang = 'en') {
  if (!text || targetLang === sourceLang) {
    return text;
  }

  // Check offline dictionary match
  const langDict = SCHEME_TRANSLATION_MAP[targetLang];
  if (langDict && langDict[text]) {
    return langDict[text];
  }

  // If live Bhashini API key is configured in environment
  const apiKey = typeof import.meta !== 'undefined' && import.meta.env?.VITE_BHASHINI_API_KEY;
  const userId = typeof import.meta !== 'undefined' && import.meta.env?.VITE_BHASHINI_USER_ID;

  if (apiKey && userId) {
    try {
      const response = await fetch('https://dhruva-api.bhashini.gov.in/services/inference/pipeline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': apiKey,
          'userID': userId,
        },
        body: JSON.stringify({
          pipelineTasks: [
            {
              taskType: 'translation',
              config: {
                language: {
                  sourceLanguage: sourceLang,
                  targetLanguage: targetLang,
                },
              },
            },
          ],
          inputData: {
            input: [{ source: text }],
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const translated = data?.pipelineResponse?.[0]?.output?.[0]?.target;
        if (translated) {
          return translated;
        }
      }
    } catch {
      // Fallback silently if network or API key is invalid
    }
  }

  // Graceful fallback to original text
  return text;
}

/**
 * Check if a language code is supported by Bhashini in Yojsetu.
 */
export function isBhashiniSupported(langCode) {
  return SUPPORTED_LANGUAGES.some(l => l.code === langCode || l.bhashiniCode === langCode);
}
