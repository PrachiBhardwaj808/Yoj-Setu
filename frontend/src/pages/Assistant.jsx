import { useState, useRef, useEffect } from 'react';
import { sendMessage, getSuggestedQuestions } from '@/services/chatService';
import { useLanguage } from '@/context/LanguageContext';

export default function Assistant() {
  const { language, currentLanguage, t } = useLanguage();

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: t(
        'assistant.welcome',
        'Namaste! I am Yojsetu AI Sathi — your government scheme companion. Ask me anything about farming subsidies, scholarships, housing grants, health insurance, or loan schemes.'
      ),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // If conversation has not started yet, update welcome greeting when language changes
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'welcome') {
        return [
          {
            ...prev[0],
            text: t(
              'assistant.welcome',
              'Namaste! I am Yojsetu AI Sathi — your government scheme companion. Ask me anything about farming subsidies, scholarships, housing grants, health insurance, or loan schemes.'
            ),
          },
        ];
      }
      return prev;
    });
  }, [language, t]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const reply = await sendMessage(text, language);
      const assistantMessage = {
        id: `assistant_${Date.now()}`,
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'assistant',
          text: t('assistant.error', 'Sorry, I encountered an issue processing your query. Please try asking again.'),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedQuestions = getSuggestedQuestions(language);

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)] bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden font-sans">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-lg">
            🤖
          </div>
          <div>
            <h2 className="text-base font-bold flex items-center gap-2">
              <span>{t('assistant.title', 'Yojsetu AI Sathi')}</span>
              <span className="px-2 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-400 font-semibold rounded-full border border-emerald-500/30">
                {t('assistant.online', 'Online')}
              </span>
              <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] bg-blue-500/20 text-blue-300 font-medium rounded-full border border-blue-500/30">
                🌐 {currentLanguage.nativeName}
              </span>
            </h2>
            <p className="text-xs text-slate-300">
              {t('assistant.subtitle', 'Intelligent Welfare & Scheme Advisory')}
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                id: 'welcome',
                sender: 'assistant',
                text: t('assistant.chatCleared', 'Chat cleared. How can I assist you with government schemes today?'),
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ])
          }
          className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg border border-slate-700 hover:border-slate-500 transition-colors cursor-pointer"
        >
          {t('assistant.resetChat', 'Reset Chat')}
        </button>
      </div>

      {/* Suggested Questions Pills */}
      <div className="p-3 bg-slate-50 border-b border-gray-100 overflow-x-auto flex gap-2">
        <span className="text-xs font-semibold text-gray-500 flex items-center gap-1 flex-shrink-0">
          💡 {t('assistant.tryAsking', 'Try asking:')}
        </span>
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="text-xs bg-white text-gray-700 hover:text-blue-600 hover:border-blue-300 border border-gray-200 px-3 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex items-end gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm flex-shrink-0 mb-1">
                  🤖
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-slate-100 text-gray-900 rounded-bl-none'
                }`}
              >
                <p className="whitespace-pre-wrap">{m.text}</p>
                <span
                  className={`block text-[10px] mt-1.5 ${
                    isUser ? 'text-blue-200 text-right' : 'text-gray-400'
                  }`}
                >
                  {m.timestamp}
                </span>
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mb-1">
                  You
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-end gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm flex-shrink-0 mb-1">
              🤖
            </div>
            <div className="bg-slate-100 rounded-2xl rounded-bl-none px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse delay-150" />
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse delay-300" />
              <span className="text-xs text-gray-400 ml-1">
                {t('assistant.searching', 'AI Sathi is searching scheme rules...')}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 border-t border-gray-100 bg-white flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={t('assistant.placeholder', "Ask in your language (e.g. 'What is PM Kisan subsidy amount?')...")}
          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <span>{t('assistant.send', 'Send')}</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </form>
    </div>
  );
}
