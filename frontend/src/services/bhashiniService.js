/**
 * bhashiniService.js
 * Integration layer for Digital India Bhashini (National Language Translation Mission - MeitY).
 * Provides NMT (Neural Machine Translation) with deterministic offline fallbacks for supported Indian languages.
 */

import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '../translations/index.js';

// Common scheme keywords and phrases mapped to Indian languages
const SCHEME_TRANSLATION_MAP = {
  hi: {
    'The catalogue lists PM Kisan Samman Nidhi with ₹6,000 / year direct transfer. See the scheme details for eligibility and required documents.':
      'योजना सूची में पीएम किसान सम्मान निधि के लिए प्रति वर्ष ₹6,000 का प्रत्यक्ष हस्तांतरण दर्ज है। पात्रता और आवश्यक दस्तावेज़ों के लिए योजना का विवरण देखें।',
    'The catalogue lists Ayushman Bharat (PM-JAY) with ₹5 Lakhs health cover / year. See the scheme details and official portal before applying.':
      'योजना सूची में आयुष्मान भारत (PM-JAY) के लिए प्रति वर्ष ₹5 लाख का स्वास्थ्य कवर दर्ज है। आवेदन से पहले योजना का विवरण और आधिकारिक पोर्टल देखें।',
    'The catalogue lists PM Awas Yojana (PMAY-Urban/Rural) with up to ₹2.5 Lakhs house subsidy, and PM Surya Ghar: Muft Bijli Yojana with up to ₹78,000 solar subsidy. Check each scheme’s details for eligibility.':
      'योजना सूची में पीएम आवास योजना (PMAY-Urban/Rural) के लिए ₹2.5 लाख तक की आवास सहायता और पीएम सूर्य घर: मुफ्त बिजली योजना के लिए ₹78,000 तक की सौर सब्सिडी दर्ज है। पात्रता के लिए प्रत्येक योजना का विवरण देखें।',
    'The catalogue lists the Post-Matric Scholarship Scheme with 100% tuition + allowance. See the scheme details for eligibility and required documents.':
      'योजना सूची में पोस्ट-मैट्रिक छात्रवृत्ति योजना के लिए 100% शिक्षण शुल्क और भत्ता दर्ज है। पात्रता और आवश्यक दस्तावेज़ों के लिए योजना का विवरण देखें।',
    'I do not have a verified pension scheme in the current catalogue. Please check the catalogue for currently listed schemes.':
      'वर्तमान योजना सूची में मेरे पास कोई सत्यापित पेंशन योजना नहीं है। सूची में उपलब्ध योजनाओं को देखें।',
    'I do not have a verified business-loan scheme in the current catalogue. Please check the catalogue for currently listed schemes.':
      'वर्तमान योजना सूची में मेरे पास कोई सत्यापित व्यवसाय ऋण योजना नहीं है। सूची में उपलब्ध योजनाओं को देखें।',
    'The catalogue lists MGNREGA Rural Employment Guarantee as providing 100 days of wage employment in a financial year for adult members of rural households.':
      'योजना सूची में मनरेगा ग्रामीण रोजगार गारंटी के तहत ग्रामीण परिवारों के वयस्क सदस्यों को एक वित्तीय वर्ष में 100 दिन का मजदूरी रोजगार दर्ज है।',
    'I can help with schemes in the current catalogue. Ask about farming, health, housing, education, or employment, or check the catalogue for available schemes.':
      'मैं वर्तमान योजना सूची में उपलब्ध योजनाओं के बारे में सहायता कर सकता हूँ। कृषि, स्वास्थ्य, आवास, शिक्षा या रोजगार के बारे में पूछें, या उपलब्ध योजनाओं के लिए सूची देखें।',
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
