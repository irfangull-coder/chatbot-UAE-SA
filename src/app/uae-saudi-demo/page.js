'use client';

import React, { useState, useEffect } from 'react';
import Script from 'next/script';
import styles from './demo.module.css';

const FEATURED_PROPERTIES = [
  {
    id: 'DXB-001',
    title: 'Luxury 2-Bedroom with Burj Khalifa View',
    city: 'Dubai',
    area: 'Downtown Dubai',
    country: 'UAE',
    type: 'Apartment',
    price: 'AED 1,850,000',
    intent: 'buy',
    beds: 2,
    baths: 2,
    sqft: '1,250 sq ft',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
    desc: 'High-floor panoramic Burj Khalifa views, premium designer kitchen, and walking distance to Dubai Mall.'
  },
  {
    id: 'DXB-002',
    title: 'Signature Beachfront Villa on Palm Jumeirah',
    city: 'Dubai',
    area: 'Palm Jumeirah',
    country: 'UAE',
    type: 'Villa',
    price: 'AED 8,500,000',
    intent: 'buy',
    beds: 4,
    baths: 5,
    sqft: '5,200 sq ft',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',
    desc: 'Private beach access, infinity pool, landscaped grounds, and modern luxury architecture.'
  },
  {
    id: 'RUH-001',
    title: 'Modern Luxury Villa in North Riyadh',
    city: 'Riyadh',
    area: 'Al Malqa',
    country: 'Saudi Arabia',
    type: 'Villa',
    price: 'SAR 3,200,000',
    intent: 'buy',
    beds: 5,
    baths: 6,
    sqft: '4,500 sq ft',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
    desc: 'Contemporary architectural masterpiece with private elevator, majlis, driver quarters, and smart home.'
  },
  {
    id: 'DXB-003',
    title: 'Sleek Canal-View Furnished 1-Bedroom',
    city: 'Dubai',
    area: 'Business Bay',
    country: 'UAE',
    type: 'Apartment',
    price: 'AED 95,000/yr',
    intent: 'rent',
    beds: 1,
    baths: 2,
    sqft: '850 sq ft',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
    desc: 'Fully furnished waterfront flat 5 minutes from Downtown. Gym, pool, and covered parking included.'
  },
  {
    id: 'RUH-002',
    title: 'Executive Family Villa in Al Yasmin',
    city: 'Riyadh',
    area: 'Al Yasmin',
    country: 'Saudi Arabia',
    type: 'Villa',
    price: 'SAR 150,000/yr',
    intent: 'rent',
    beds: 4,
    baths: 5,
    sqft: '3,800 sq ft',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    desc: 'Gated privacy with front and back gardens, spacious majlis, and proximity to King Salman Road.'
  },
  {
    id: 'JED-001',
    title: 'Corniche View Residence in Al Shati',
    city: 'Jeddah',
    area: 'Al Shati',
    country: 'Saudi Arabia',
    type: 'Apartment',
    price: 'SAR 1,650,000',
    intent: 'buy',
    beds: 3,
    baths: 3,
    sqft: '2,100 sq ft',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
    desc: 'Direct panoramic views of the Red Sea and Jeddah Waterfront. Luxury tower with concierge service.'
  }
];

const PRIME_MARKETS = [
  { name: 'Downtown Dubai', country: 'United Arab Emirates', img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80' },
  { name: 'Palm Jumeirah', country: 'United Arab Emirates', img: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=600&q=80' },
  { name: 'North Riyadh (Al Malqa)', country: 'Kingdom of Saudi Arabia', img: 'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?w=600&q=80' },
  { name: 'Jeddah Waterfront', country: 'Kingdom of Saudi Arabia', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80' },
];

export default function UAESaudiDemoPage() {
  const [activeTab, setActiveTab] = useState('buy'); // 'buy' | 'rent'
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    // Configure AI Chatbot by Gulf Real Estate
    window.CHATBOT_CONFIG = {
      botId: "92e7fbed-ab71-4a6c-9067-f78119dcbad3",
      welcomeMessage: "Hi there! 👋 I'm UAE & SA's AI Real Estate Advisor. Looking to buy, rent, or invest in UAE or Saudi Arabia? How can I assist you today?"
    };

    // Load chatbot embed script if not already present
    const existingScript = document.getElementById('gulf-chatbot-embed-loader');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'gulf-chatbot-embed-loader';
      script.src = 'https://chatbot-uae-sa.vercel.app/chatbot-embed.js';
      script.defer = true;
      document.body.appendChild(script);
    }
  }, []);

  const openChatWithPrompt = (promptText) => {
    // If iframe exists, open it via postMessage
    const iframe = document.getElementById('RealtyPropFlow-chatbot-iframe');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'CHATBOT_TOGGLE', isOpen: true }, '*');
      if (promptText) {
        setTimeout(() => {
          iframe.contentWindow.postMessage({ type: 'CHATBOT_SEND_MESSAGE', text: promptText }, '*');
        }, 300);
      }
      return;
    }

    // Fallback launcher click
    const launcher = document.querySelector('button[aria-label*="chat"], .chat-launcher, [class*="launcher"]');
    if (launcher) {
      launcher.click();
    }
  };

  const filteredProperties = FEATURED_PROPERTIES.filter(p => {
    if (p.intent !== activeTab) return false;
    if (selectedCity !== 'all' && p.city.toLowerCase() !== selectedCity.toLowerCase()) return false;
    if (selectedType !== 'all' && p.type.toLowerCase() !== selectedType.toLowerCase()) return false;
    return true;
  });

  return (
    <div className={styles.pageContainer}>
      {/* ── Navbar ── */}
      <header className={styles.navbar}>
        <div className={styles.logoArea}>
          <div className={styles.logoIcon}>🏰</div>
          <div className={styles.logoText}>
            <span className={styles.brandName}>AL-QASR REALTY</span>
            <span className={styles.brandSub}>UAE & SAUDI ARABIA</span>
          </div>
        </div>

        <nav className={styles.navLinks}>
          <a className={styles.navLink} onClick={() => setSelectedCity('Dubai')}>🇦🇪 Dubai</a>
          <a className={styles.navLink} onClick={() => setSelectedCity('Abu Dhabi')}>🇦🇪 Abu Dhabi</a>
          <a className={styles.navLink} onClick={() => setSelectedCity('Riyadh')}>🇸🇦 Riyadh</a>
          <a className={styles.navLink} onClick={() => setSelectedCity('Jeddah')}>🇸🇦 Jeddah</a>
          <a className={styles.navLink} onClick={() => setActiveTab('buy')}>Buy Properties</a>
          <a className={styles.navLink} onClick={() => setActiveTab('rent')}>Rentals</a>
        </nav>

        <button className={styles.navActionBtn} onClick={() => openChatWithPrompt('Hello, I am looking for properties in Dubai and Riyadh')}>
          <span>💬 Talk to AI Agent</span>
        </button>
      </header>

      {/* ── Hero Section ── */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>
          <span>✨ Gulf Luxury Real Estate & AI Search</span>
        </div>

        <h1 className={styles.heroTitle}>
          Discover Extraordinary Living in <br />
          <span className={styles.heroTitleGold}>Dubai & Saudi Arabia</span>
        </h1>

        <p className={styles.heroSubtitle}>
          Explore premier villas, penthouses, and waterfront residences in Dubai, Riyadh, Abu Dhabi, and Jeddah with our intelligent 24/7 AI Real Estate Assistant.
        </p>

        {/* ── Search Widget ── */}
        <div className={styles.searchWidget}>
          <div className={styles.searchTabs}>
            <button
              className={`${styles.tabBtn} ${activeTab === 'buy' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('buy')}
            >
              🟢 Buy Properties
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === 'rent' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('rent')}
            >
              🔵 Rental Properties
            </button>
          </div>

          <div className={styles.searchInputsRow}>
            <div className={styles.inputGroup}>
              <span className={styles.inputLabel}>Location</span>
              <select
                className={styles.selectField}
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              >
                <option value="all">All Prime Cities</option>
                <option value="Dubai">Dubai (UAE)</option>
                <option value="Abu Dhabi">Abu Dhabi (UAE)</option>
                <option value="Riyadh">Riyadh (KSA)</option>
                <option value="Jeddah">Jeddah (KSA)</option>
              </select>
            </div>

            <div className={styles.inputGroup}>
              <span className={styles.inputLabel}>Property Type</span>
              <select
                className={styles.selectField}
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="Villa">Luxury Villa</option>
                <option value="Apartment">Modern Apartment</option>
                <option value="Townhouse">Townhouse</option>
                <option value="Penthouse">Penthouse</option>
              </select>
            </div>

            <div className={styles.inputGroup}>
              <span className={styles.inputLabel}>Currency & Budget</span>
              <select className={styles.selectField}>
                <option>Any Price Range</option>
                <option>AED 1M – 3M (UAE)</option>
                <option>AED 3M – 10M+ (UAE)</option>
                <option>SAR 1.5M – 3.5M (KSA)</option>
                <option>SAR 3.5M – 8M+ (KSA)</option>
              </select>
            </div>

            <div className={styles.inputGroup}>
              <span className={styles.inputLabel}>Bedrooms</span>
              <select className={styles.selectField}>
                <option>Any Beds</option>
                <option>1–2 Bedrooms</option>
                <option>3–4 Bedrooms</option>
                <option>5+ Bedrooms</option>
              </select>
            </div>

            <button
              className={styles.searchSubmitBtn}
              onClick={() => openChatWithPrompt(`Find me ${selectedType !== 'all' ? selectedType : 'properties'} in ${selectedCity !== 'all' ? selectedCity : 'Dubai or Riyadh'}`)}
            >
              <span>🔍 Search with AI</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── Featured Properties ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>Curated Portfolio</span>
          <h2 className={styles.sectionTitle}>Featured Properties in UAE & KSA</h2>
          <p className={styles.sectionDesc}>
            Hand-picked luxury homes across the Gulf region with verified pricing and real-time AI availability check.
          </p>
        </div>

        <div className={styles.propertiesGrid}>
          {filteredProperties.map((prop) => (
            <div key={prop.id} className={styles.propertyCard}>
              <div className={styles.cardImgWrap}>
                <img src={prop.image} alt={prop.title} className={styles.cardImg} />
                <span className={`${styles.statusBadge} ${prop.intent === 'rent' ? styles.statusRent : styles.statusBuy}`}>
                  {prop.intent === 'rent' ? '🔵 For Rent' : '🟢 For Sale'}
                </span>
                <span className={styles.typeBadge}>{prop.type}</span>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.cardPriceRow}>
                  <span className={styles.cardPrice}>{prop.price}</span>
                  <span className={styles.cardCity}>📍 {prop.area}, {prop.city}</span>
                </div>

                <h3 className={styles.cardTitle}>{prop.title}</h3>
                <p className={styles.cardDesc}>{prop.desc}</p>

                <div className={styles.cardSpecs}>
                  <span className={styles.specItem}>🛏️ {prop.beds} Beds</span>
                  <span className={styles.specItem}>🛁 {prop.baths} Baths</span>
                  <span className={styles.specItem}>📐 {prop.sqft}</span>
                </div>

                <button
                  className={styles.cardActionBtn}
                  onClick={() => openChatWithPrompt(`Tell me more about ${prop.title} in ${prop.city}`)}
                >
                  <span>💬 Ask AI Agent About This Property</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Prime Markets ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>Prime Destinations</span>
          <h2 className={styles.sectionTitle}>High-Growth Gulf Markets</h2>
          <p className={styles.sectionDesc}>
            Explore the most sought-after addresses in Dubai, Abu Dhabi, Riyadh, and Jeddah.
          </p>
        </div>

        <div className={styles.marketsGrid}>
          {PRIME_MARKETS.map((market, idx) => (
            <div
              key={idx}
              className={styles.marketCard}
              onClick={() => openChatWithPrompt(`Show me properties in ${market.name}`)}
            >
              <img src={market.img} alt={market.name} className={styles.marketImg} />
              <div className={styles.marketOverlay}>
                <h4 className={styles.marketName}>{market.name}</h4>
                <span className={styles.marketCountry}>{market.country}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── AI Assistant Callout Banner ── */}
      <div className={styles.aiBanner}>
        <div className={styles.aiBannerText}>
          <h3>Looking for a specific property in Dubai or Riyadh?</h3>
          <p>
            Our intelligent AI assistant can instantly search live listings, check budgets in AED or SAR, compare amenities, and schedule private viewings 24/7.
          </p>
        </div>

        <button
          className={styles.aiBannerBtn}
          onClick={() => openChatWithPrompt('Hi! I need help finding a home')}
        >
          <span>🤖 Open AI Chatbot</span>
        </button>
      </div>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <div className={styles.footerGrid}>
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '18px', fontWeight: 800, marginBottom: '12px' }}>
              AL-QASR REALTY
            </h4>
            <p style={{ fontSize: '13px', lineHeight: 1.6, maxWidth: '300px' }}>
              The Gulf region’s premier luxury real estate advisory, powered by next-generation AI automation for property buyers and investors across the UAE and Saudi Arabia.
            </p>
          </div>

          <div>
            <h4 className={styles.footerTitle}>UAE Offices</h4>
            <ul className={styles.footerList}>
              <li>Downtown Dubai, Boulevard Plaza</li>
              <li>Dubai Marina Promenade</li>
              <li>Al Reem Island, Abu Dhabi</li>
              <li>Tel: +971 4 800 QASR</li>
            </ul>
          </div>

          <div>
            <h4 className={styles.footerTitle}>KSA Offices</h4>
            <ul className={styles.footerList}>
              <li>King Fahd Road, Al Olaya, Riyadh</li>
              <li>Al Malqa Commercial Centre</li>
              <li>Corniche Way, Al Shati, Jeddah</li>
              <li>Tel: +966 11 800 QASR</li>
            </ul>
          </div>

          <div>
            <h4 className={styles.footerTitle}>AI Assistant</h4>
            <ul className={styles.footerList}>
              <li>24/7 Live Property Search</li>
              <li>Instant AED & SAR Conversion</li>
              <li>Direct WhatsApp Handoff</li>
              <li>Pre-Approval Guidance</li>
            </ul>
          </div>
        </div>

        <div className={styles.footerBottom}>
          © {new Date().getFullYear()} Al-Qasr Luxury Realty LLC. All Rights Reserved. UAE & Kingdom of Saudi Arabia.
        </div>
      </footer>

      {/* ── AI Chatbot by Gulf Real Estate ── */}
      <Script id="gulf-chatbot-config" strategy="afterInteractive">
        {`
          window.CHATBOT_CONFIG = {
            botId: "92e7fbed-ab71-4a6c-9067-f78119dcbad3",
            welcomeMessage: "Hi there! 👋 I'm UAE & SA's AI Real Estate Advisor. Looking to buy, rent, or invest in UAE or Saudi Arabia? How can I assist you today?"
          };
        `}
      </Script>
      <Script
        id="gulf-chatbot-script-tag"
        src="https://chatbot-uae-sa.vercel.app/chatbot-embed.js"
        strategy="afterInteractive"
      />
    </div>
  );
}
