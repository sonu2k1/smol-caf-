'use client';

import React, { useState } from 'react';
import { MessageSquare, Sparkles, Send, ShieldAlert, Coffee, Utensils, HelpCircle } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'smol';
  text: string;
  time: string;
}

export default function AskSmolPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'smol',
      text: "hello! i'm smol concierge. how can we make your visit at table 07 warm & special tonight?",
      time: 'Just now',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const predefinedPrompts = [
    {
      icon: MessageSquare,
      title: 'i have a question about the menu',
      response: 'All our coffee beans are single-origin South Indian estate roasted. For something sweet and creamy, try our Oat Milk Flat White or Jaggery Sea-Salt Latte!',
    },
    {
      icon: Sparkles,
      title: 'dietary preferences (allergies, vegan, gluten-free)',
      response: '100% of our drinks can be made with Barista Oat Milk or Almond Milk. Our Avocado Sourdough & Rishikesh Grain Bowl are 100% vegan!',
    },
    {
      icon: Utensils,
      title: 'recommend something (surprise me!)',
      response: 'Pair a hot Tapovan Pour Over with our Triple Decker Masala Toast! It’s the ultimate smol café late-night comfort combo. ☕🍞',
    },
    {
      icon: ShieldAlert,
      title: 'report an issue (something not right?)',
      response: 'We apologize! I have pinged the head barista at the counter. Someone is coming over to Table 07 immediately.',
    },
  ];

  const handlePromptClick = (title: string, response: string) => {
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: title,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      const smolMsg: ChatMessage = {
        id: `smol-${Date.now()}`,
        sender: 'smol',
        text: response,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, smolMsg]);
      setIsTyping(false);
    }, 800);
  };

  const handleSendCustom = () => {
    if (!inputQuery.trim()) return;

    const query = inputQuery;
    setInputQuery('');

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      let botResponse = "Thanks for asking! I've notified our barista team at Table 07 to assist you.";
      const lower = query.toLowerCase();
      if (lower.includes('wifi') || lower.includes('password')) {
        botResponse = 'Our Wi-Fi network is "smol_cafe_guest" and the password is "goodcoffee2026".';
      } else if (lower.includes('chai') || lower.includes('tea')) {
        botResponse = 'Our Himalayan Kulhad Masala Chai is brewed fresh with lemongrass, ginger & green cardamom!';
      } else if (lower.includes('bill') || lower.includes('pay')) {
        botResponse = 'You can tap the "Table" tab at the bottom to view your bill and settle up via UPI or Card anytime.';
      }

      const smolMsg: ChatMessage = {
        id: `smol-${Date.now()}`,
        sender: 'smol',
        text: botResponse,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, smolMsg]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <div className="px-4 py-4 space-y-5 animate-in fade-in duration-300 relative pb-20">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-brand-biscuit/30 dark:border-brand-espressoCard pb-3">
        <div>
          <span className="font-mono text-[10px] text-brand-electricViolet dark:text-purple-400 uppercase tracking-widest block">
            5. ask smol
          </span>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-brand-espresso dark:text-brand-creme lowercase">
            ask smol
          </h2>
          <p className="font-serif italic text-xs text-brand-walnut dark:text-brand-biscuit">
            we&apos;re here to help
          </p>
        </div>

        <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-400 flex items-center justify-center shadow-neonViolet">
          <Sparkles className="w-4 h-4" />
        </div>
      </div>

      {/* Arched Neon Doorway Graphic */}
      <div className="w-full relative flex flex-col items-center">
        <div className="w-full h-44 rounded-arch border-2 border-purple-500/50 bg-gradient-to-b from-purple-950/40 to-brand-espresso p-5 flex flex-col items-center justify-center text-center shadow-neonViolet relative overflow-hidden group">
          <div className="border border-purple-400/40 rounded-arch h-full w-full flex flex-col items-center justify-center p-3 space-y-1 bg-black/40 backdrop-blur">
            <img
              src="/logo-transparent.png"
              alt="smol café official logo (day)"
              className="h-10 w-auto object-contain drop-shadow-md hover:scale-105 transition-transform dark:hidden"
            />
            <img
              src="/logo-dark-transparent.png"
              alt="smol café official logo (night)"
              className="h-10 w-auto object-contain drop-shadow-[0_0_12px_rgba(117,76,255,0.8)] hover:scale-105 transition-transform hidden dark:block"
            />
            <span className="font-serif text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-amber-200">
              how can we make your night better?
            </span>
            <p className="font-sans text-[11px] text-purple-200/80">
              ask anything about brews, seating, or dietary preferences
            </p>
          </div>
        </div>
      </div>

      {/* Predefined Interactive Options */}
      <div className="space-y-2">
        <span className="font-mono text-[10px] text-brand-walnut dark:text-brand-biscuit uppercase tracking-wider block">
          quick options
        </span>

        <div className="space-y-2">
          {predefinedPrompts.map((p, idx) => {
            const Icon = p.icon;
            return (
              <button
                key={idx}
                onClick={() => handlePromptClick(p.title, p.response)}
                className="w-full p-3 rounded-2xl bg-brand-creme dark:bg-brand-espressoLight border border-brand-biscuit/40 dark:border-brand-espressoCard flex items-center justify-between text-left hover:border-purple-500/60 transition-all group shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-500 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-sans text-xs font-medium text-brand-espresso dark:text-brand-creme leading-tight group-hover:text-purple-400 transition-colors">
                    {p.title}
                  </span>
                </div>
                <span className="font-mono text-xs text-brand-walnut dark:text-brand-biscuit">
                  &gt;
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Live Chat History */}
      <div className="space-y-3 pt-2">
        <span className="font-mono text-[10px] text-brand-walnut dark:text-brand-biscuit uppercase tracking-wider block">
          concierge chat
        </span>

        <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[82%] p-3 rounded-2xl text-xs font-sans leading-relaxed shadow-sm ${
                  m.sender === 'user'
                    ? 'bg-brand-cherry text-white rounded-br-none'
                    : 'bg-purple-950/40 text-purple-100 border border-purple-500/30 rounded-bl-none'
                }`}
              >
                {m.text}
              </div>
              <span className="text-[9px] font-mono text-brand-walnut/60 dark:text-brand-biscuit/60 mt-0.5 px-1">
                {m.time}
              </span>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-1.5 text-xs text-purple-400 font-mono italic">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>smol is thinking...</span>
            </div>
          )}
        </div>
      </div>

      {/* Input Query Field */}
      <div className="flex items-center gap-2 pt-2">
        <input
          type="text"
          placeholder="type your question here..."
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendCustom()}
          className="flex-1 px-4 py-2.5 rounded-xl bg-brand-biscuit/20 dark:bg-brand-espressoLight border border-brand-biscuit/40 dark:border-brand-espressoCard text-xs font-sans text-brand-espresso dark:text-brand-creme placeholder:text-brand-walnut/50 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
        />
        <button
          onClick={handleSendCustom}
          className="w-10 h-10 rounded-xl bg-brand-cherry text-white flex items-center justify-center shadow-neonCherry hover:scale-105 active:scale-95 transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
