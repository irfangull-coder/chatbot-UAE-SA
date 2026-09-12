const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  const idx = trimmed.indexOf('=');
  if (idx > 0) env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const SAMPLE_PROPERTIES = [
  // ─── UAE: DUBAI (BUY) ───
  {
    property_id: 'DXB-BUY-001',
    country: 'UAE',
    city: 'Dubai',
    area_district: 'Downtown Dubai',
    listing_type: 'buy',
    property_type: 'Apartment',
    price: 1850000,
    currency: 'AED',
    price_display: 'AED 1,850,000',
    bedrooms: 2,
    bathrooms: 2,
    area_sqft: 1250,
    area_sqm: 116,
    furnished: 'furnished',
    title: 'Luxury 2-Bedroom Apartment with Burj Khalifa View',
    description: 'Stunning high-floor 2-bed apartment in the heart of Downtown Dubai. Features floor-to-ceiling windows, modern open kitchen, balcony with panoramic Burj Khalifa views, and premium finishes.',
    main_image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
    source_url: 'https://www.propertyfinder.ae',
    portal_name: 'PropertyFinder',
    agent_name: 'Tariq Mansoor',
    agent_phone: '+971 50 123 4567',
    broker_name: 'Gulf Horizon Realty'
  },
  {
    property_id: 'DXB-BUY-002',
    country: 'UAE',
    city: 'Dubai',
    area_district: 'Palm Jumeirah',
    listing_type: 'buy',
    property_type: 'Villa',
    price: 8500000,
    currency: 'AED',
    price_display: 'AED 8,500,000',
    bedrooms: 4,
    bathrooms: 5,
    area_sqft: 5200,
    area_sqm: 483,
    furnished: 'semi-furnished',
    title: 'Signature Beachfront 4-Bedroom Villa on Palm Jumeirah',
    description: 'Exclusive beachfront living with direct private beach access, infinity pool, landscaped garden, and private elevator. Elegant contemporary architecture.',
    main_image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',
    source_url: 'https://www.bayut.com',
    portal_name: 'Bayut',
    agent_name: 'Amina Al-Falasi',
    agent_phone: '+971 55 987 6543',
    broker_name: 'Palm Luxury Estates'
  },
  {
    property_id: 'DXB-BUY-003',
    country: 'UAE',
    city: 'Dubai',
    area_district: 'Dubai Marina',
    listing_type: 'buy',
    property_type: 'Apartment',
    price: 1400000,
    currency: 'AED',
    price_display: 'AED 1,400,000',
    bedrooms: 1,
    bathrooms: 2,
    area_sqft: 900,
    area_sqm: 84,
    furnished: 'furnished',
    title: 'Modern Waterfront 1-Bedroom in Dubai Marina',
    description: 'Chic 1-bedroom flat offering full marina promenade views. Walking distance to JBR beach, Marina Mall, and metro. Fully equipped gym, pool, and 24/7 security.',
    main_image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
    source_url: 'https://www.propertyfinder.ae',
    portal_name: 'PropertyFinder',
    agent_name: 'Fahad Qasim',
    agent_phone: '+971 52 444 8899',
    broker_name: 'Marina Key Properties'
  },
  {
    property_id: 'DXB-BUY-004',
    country: 'UAE',
    city: 'Dubai',
    area_district: 'Damac Hills',
    listing_type: 'buy',
    property_type: 'Townhouse',
    price: 2600000,
    currency: 'AED',
    price_display: 'AED 2,600,000',
    bedrooms: 3,
    bathrooms: 4,
    area_sqft: 2800,
    area_sqm: 260,
    furnished: 'unfurnished',
    title: 'Contemporary 3-Bedroom Townhouse in Damac Hills',
    description: 'Spacious family townhouse overlooking the championship golf course. Private backyard garden, covered parking for 2 cars, and close proximity to international schools.',
    main_image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    source_url: 'https://www.bayut.com',
    portal_name: 'Bayut',
    agent_name: 'Zaid Al-Harbi',
    agent_phone: '+971 56 333 1122',
    broker_name: 'Green Oasis Realty'
  },

  // ─── UAE: DUBAI (RENT) ───
  {
    property_id: 'DXB-RENT-001',
    country: 'UAE',
    city: 'Dubai',
    area_district: 'Business Bay',
    listing_type: 'rent',
    property_type: 'Apartment',
    price: 95000,
    currency: 'AED',
    price_display: 'AED 95,000/yr',
    rental_period: 'yearly',
    bedrooms: 1,
    bathrooms: 2,
    area_sqft: 850,
    area_sqm: 79,
    furnished: 'furnished',
    title: 'Sleek Fully Furnished 1-Bed near Dubai Canal',
    description: 'High-end furnished apartment with Dubai Canal view. 5 mins drive to Downtown. Includes gym, temperature-controlled pool, sauna, and covered parking.',
    main_image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
    source_url: 'https://www.propertyfinder.ae',
    portal_name: 'PropertyFinder',
    agent_name: 'Samir Saeed',
    agent_phone: '+971 50 888 7766',
    broker_name: 'Canal City Real Estate'
  },
  {
    property_id: 'DXB-RENT-002',
    country: 'UAE',
    city: 'Dubai',
    area_district: 'Jumeirah Village Circle (JVC)',
    listing_type: 'rent',
    property_type: 'Apartment',
    price: 65000,
    currency: 'AED',
    price_display: 'AED 65,000/yr',
    rental_period: 'yearly',
    bedrooms: 1,
    bathrooms: 1,
    area_sqft: 720,
    area_sqm: 67,
    furnished: 'semi-furnished',
    title: 'Cozy 1-Bedroom in JVC with Balcony',
    description: 'Affordable modern living in popular JVC. Bright living area, built-in wardrobes, community park views. Great for singles or young couples.',
    main_image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
    source_url: 'https://www.bayut.com',
    portal_name: 'Bayut',
    agent_name: 'Bilal Khan',
    agent_phone: '+971 54 222 3344',
    broker_name: 'Urban Core Properties'
  },
  {
    property_id: 'DXB-RENT-003',
    country: 'UAE',
    city: 'Dubai',
    area_district: 'Arabian Ranches',
    listing_type: 'rent',
    property_type: 'Villa',
    price: 210000,
    currency: 'AED',
    price_display: 'AED 210,000/yr',
    rental_period: 'yearly',
    bedrooms: 3,
    bathrooms: 4,
    area_sqft: 3400,
    area_sqm: 315,
    furnished: 'unfurnished',
    title: 'Spacious 3-Bedroom Villa in Arabian Ranches',
    description: 'Premier gated community living with lush green parks, community center, pools, and tennis courts. Private lawn and maids room included.',
    main_image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    source_url: 'https://www.propertyfinder.ae',
    portal_name: 'PropertyFinder',
    agent_name: 'Omar Farooq',
    agent_phone: '+971 50 999 1100',
    broker_name: 'Desert Bloom Homes'
  },

  // ─── UAE: ABU DHABI ───
  {
    property_id: 'AUH-BUY-001',
    country: 'UAE',
    city: 'Abu Dhabi',
    area_district: 'Yas Island',
    listing_type: 'buy',
    property_type: 'Villa',
    price: 3400000,
    currency: 'AED',
    price_display: 'AED 3,400,000',
    bedrooms: 4,
    bathrooms: 4,
    area_sqft: 3600,
    area_sqm: 334,
    furnished: 'unfurnished',
    title: 'Brand New 4-Bedroom Villa on Yas Island',
    description: 'Live adjacent to world-class entertainment, Ferrari World, and Yas Mall. Sustainable modern community with premium amenities and cycling tracks.',
    main_image: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800&q=80',
    source_url: 'https://www.propertyfinder.ae',
    portal_name: 'PropertyFinder',
    agent_name: 'Rashid Al-Nuaimi',
    agent_phone: '+971 50 777 4455',
    broker_name: 'Capital Crest Realty'
  },
  {
    property_id: 'AUH-BUY-002',
    country: 'UAE',
    city: 'Abu Dhabi',
    area_district: 'Al Reem Island',
    listing_type: 'buy',
    property_type: 'Apartment',
    price: 1150000,
    currency: 'AED',
    price_display: 'AED 1,150,000',
    bedrooms: 2,
    bathrooms: 2,
    area_sqft: 1100,
    area_sqm: 102,
    furnished: 'furnished',
    title: 'Sea View 2-Bedroom Apartment in Al Reem Island',
    description: 'High-floor corner unit overlooking the turquoise Arabian Gulf. Modern kitchen, spacious bedrooms, and immediate handover available.',
    main_image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
    source_url: 'https://www.bayut.com',
    portal_name: 'Bayut',
    agent_name: 'Mariam Al-Zaabi',
    agent_phone: '+971 52 666 9911',
    broker_name: 'Island Pearl Properties'
  },

  // ─── SAUDI ARABIA: RIYADH (BUY) ───
  {
    property_id: 'RUH-BUY-001',
    country: 'Saudi Arabia',
    city: 'Riyadh',
    area_district: 'Al Malqa',
    listing_type: 'buy',
    property_type: 'Villa',
    price: 3200000,
    currency: 'SAR',
    price_display: 'SAR 3,200,000',
    bedrooms: 5,
    bathrooms: 6,
    area_sqft: 4500,
    area_sqm: 420,
    furnished: 'unfurnished',
    title: 'Modern Luxury Villa in North Riyadh (Al Malqa)',
    description: 'Brand new luxury villa with elevator, drivers room, maids quarters, private courtyard, and double living salon. Premium construction with smart home automation.',
    main_image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
    source_url: 'https://sa.aqar.fm',
    portal_name: 'Aqar',
    agent_name: 'Abdullah Al-Dosari',
    agent_phone: '+966 50 111 2233',
    broker_name: 'Najd Elite Real Estate'
  },
  {
    property_id: 'RUH-BUY-002',
    country: 'Saudi Arabia',
    city: 'Riyadh',
    area_district: 'Al Olaya',
    listing_type: 'buy',
    property_type: 'Apartment',
    price: 1250000,
    currency: 'SAR',
    price_display: 'SAR 1,250,000',
    bedrooms: 3,
    bathrooms: 3,
    area_sqft: 1800,
    area_sqm: 167,
    furnished: 'semi-furnished',
    title: 'Spacious 3-Bedroom Flat in Central Riyadh (Al Olaya)',
    description: 'Prime commercial and residential location near Kingdom Centre. Excellent rental yield for investors or comfortable living for families.',
    main_image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
    source_url: 'https://sa.propertyfinder.com',
    portal_name: 'PropertyFinder KSA',
    agent_name: 'Saud Al-Otaibi',
    agent_phone: '+966 55 444 7788',
    broker_name: 'Kingdom Gateway Properties'
  },
  {
    property_id: 'RUH-BUY-003',
    country: 'Saudi Arabia',
    city: 'Riyadh',
    area_district: 'Hittin',
    listing_type: 'buy',
    property_type: 'Villa',
    price: 4800000,
    currency: 'SAR',
    price_display: 'SAR 4,800,000',
    bedrooms: 6,
    bathrooms: 7,
    area_sqft: 5800,
    area_sqm: 540,
    furnished: 'unfurnished',
    title: 'Executive Designer Villa in Prestigious Hittin',
    description: 'Located in Riyadh’s most coveted neighborhood close to Boulevard City. Private swimming pool, rooftop terrace with skyline views, and garage for 3 cars.',
    main_image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80',
    source_url: 'https://sa.bayut.com',
    portal_name: 'Bayut KSA',
    agent_name: 'Khalid Al-Ghamdi',
    agent_phone: '+966 53 888 9900',
    broker_name: 'Riyadh Royal Homes'
  },

  // ─── SAUDI ARABIA: RIYADH (RENT) ───
  {
    property_id: 'RUH-RENT-001',
    country: 'Saudi Arabia',
    city: 'Riyadh',
    area_district: 'Al Nakheel',
    listing_type: 'rent',
    property_type: 'Apartment',
    price: 75000,
    currency: 'SAR',
    price_display: 'SAR 75,000/yr',
    rental_period: 'yearly',
    bedrooms: 2,
    bathrooms: 2,
    area_sqft: 1300,
    area_sqm: 120,
    furnished: 'furnished',
    title: 'Fully Furnished 2-Bedroom in Quiet Al Nakheel',
    description: 'Modern finishing in a clean boutique residential building. Central AC, Italian kitchen appliances, and 24/7 building management.',
    main_image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
    source_url: 'https://sa.aqar.fm',
    portal_name: 'Aqar',
    agent_name: 'Turki Al-Subaie',
    agent_phone: '+966 54 333 4455',
    broker_name: 'Al Nakheel Realty'
  },
  {
    property_id: 'RUH-RENT-002',
    country: 'Saudi Arabia',
    city: 'Riyadh',
    area_district: 'Al Yasmin',
    listing_type: 'rent',
    property_type: 'Villa',
    price: 150000,
    currency: 'SAR',
    price_display: 'SAR 150,000/yr',
    rental_period: 'yearly',
    bedrooms: 4,
    bathrooms: 5,
    area_sqft: 3800,
    area_sqm: 350,
    furnished: 'unfurnished',
    title: 'Spacious 4-Bedroom Family Villa for Rent in Al Yasmin',
    description: 'Independent family villa with front and back yards. Easy access to King Salman Road and Airport. Clean residential surroundings.',
    main_image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    source_url: 'https://sa.bayut.com',
    portal_name: 'Bayut KSA',
    agent_name: 'Sultan Al-Shehri',
    agent_phone: '+966 56 123 9988',
    broker_name: 'Horizon KSA Properties'
  },

  // ─── SAUDI ARABIA: JEDDAH ───
  {
    property_id: 'JED-BUY-001',
    country: 'Saudi Arabia',
    city: 'Jeddah',
    area_district: 'Al Shati',
    listing_type: 'buy',
    property_type: 'Apartment',
    price: 1650000,
    currency: 'SAR',
    price_display: 'SAR 1,650,000',
    bedrooms: 3,
    bathrooms: 3,
    area_sqft: 2100,
    area_sqm: 195,
    furnished: 'semi-furnished',
    title: 'Corniche View 3-Bedroom Apartment in Al Shati, Jeddah',
    description: 'Direct views of the Red Sea and Jeddah Waterfront. Luxury tower with concierge, underground parking, and panoramic windows.',
    main_image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
    source_url: 'https://sa.aqar.fm',
    portal_name: 'Aqar',
    agent_name: 'Hassan Al-Zahrani',
    agent_phone: '+966 50 666 7788',
    broker_name: 'Red Sea Coast Properties'
  },
  {
    property_id: 'JED-BUY-002',
    country: 'Saudi Arabia',
    city: 'Jeddah',
    area_district: 'Al Rawdah',
    listing_type: 'buy',
    property_type: 'Villa',
    price: 2900000,
    currency: 'SAR',
    price_display: 'SAR 2,900,000',
    bedrooms: 5,
    bathrooms: 5,
    area_sqft: 4200,
    area_sqm: 390,
    furnished: 'unfurnished',
    title: 'Classic 5-Bedroom Family Villa in Al Rawdah, Jeddah',
    description: 'Located in upscale Al Rawdah with lush garden, shaded parking, private driver room, and spacious majlis for guest reception.',
    main_image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    source_url: 'https://sa.propertyfinder.com',
    portal_name: 'PropertyFinder KSA',
    agent_name: 'Faisal Al-Amri',
    agent_phone: '+966 55 777 1234',
    broker_name: 'Hejaz Capital Homes'
  },
  {
    property_id: 'JED-BUY-003',
    country: 'Saudi Arabia',
    city: 'Jeddah',
    area_district: 'Obhur Al Shamaliyah',
    listing_type: 'buy',
    property_type: 'Townhouse',
    price: 950000,
    currency: 'SAR',
    price_display: 'SAR 950,000',
    bedrooms: 3,
    bathrooms: 2,
    area_sqft: 2200,
    area_sqm: 204,
    furnished: 'unfurnished',
    title: 'Modern 3-Bedroom Townhouse with Private Garden in Obhur',
    description: 'Contemporary family townhouse in North Jeddah near Obhur Creek. Features 3 spacious bedrooms, 2 bathrooms, private landscaped garden, covered parking, and close to international schools.',
    main_image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    source_url: 'https://sa.aqar.fm',
    portal_name: 'Aqar',
    agent_name: 'Youssef Al-Harbi',
    agent_phone: '+966 54 888 3322',
    broker_name: 'Jeddah Coastal Realty'
  },
  {
    property_id: 'JED-BUY-004',
    country: 'Saudi Arabia',
    city: 'Jeddah',
    area_district: 'Al Basateen',
    listing_type: 'buy',
    property_type: 'Townhouse',
    price: 980000,
    currency: 'SAR',
    price_display: 'SAR 980,000',
    bedrooms: 3,
    bathrooms: 3,
    area_sqft: 2400,
    area_sqm: 223,
    furnished: 'semi-furnished',
    title: 'Elegant 3-Bed Corner Townhouse in Al Basateen, Jeddah',
    description: 'Prime quiet neighborhood with easy access to King Abdulaziz Road. Open modern layout, private back patio and garden, maid room, and premium ceramic flooring.',
    main_image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
    source_url: 'https://sa.propertyfinder.com',
    portal_name: 'PropertyFinder KSA',
    agent_name: 'Sara Al-Ghamdi',
    agent_phone: '+966 50 999 4411',
    broker_name: 'Red Sea Coast Properties'
  }
];

async function seed() {
  console.log(`Starting Gulf real estate seed for ${SAMPLE_PROPERTIES.length} properties...`);

  // 1. Insert into gulf_properties
  let inserted = 0;
  for (const prop of SAMPLE_PROPERTIES) {
    const { error } = await supabase
      .from('gulf_properties')
      .upsert(prop, { onConflict: 'property_id' });

    if (error) {
      console.error(`Error inserting ${prop.property_id}:`, error.message);
    } else {
      inserted++;
    }
  }
  console.log(`✅ Successfully saved ${inserted} properties into gulf_properties table!`);

  // 2. Populate gulf_city_cache for instant bot retrieval
  const cityGroups = {};
  SAMPLE_PROPERTIES.forEach(p => {
    const key = `${p.city.toLowerCase()}_${p.listing_type}`;
    if (!cityGroups[key]) {
      cityGroups[key] = {
        city_key: key,
        country: p.country,
        city: p.city,
        properties: [],
        total_count: 0
      };
    }
    cityGroups[key].properties.push({
      id: p.property_id,
      property_id: p.property_id,
      title: p.title,
      description: p.description,
      price: p.price,
      price_display: p.price_display,
      currency: p.currency,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      area_sqft: p.area_sqft,
      area_sqm: p.area_sqm,
      property_type: p.property_type,
      home_type: p.property_type,
      listing_type: p.listing_type,
      city: p.city,
      country: p.country,
      area_district: p.area_district,
      address: `${p.area_district}, ${p.city}, ${p.country}`,
      image_url: p.main_image,
      main_image: p.main_image,
      images: [p.main_image],
      url: p.source_url,
      source_url: p.source_url,
      portal_name: p.portal_name,
      agent_name: p.agent_name,
      agent_phone: p.agent_phone,
      broker_name: p.broker_name
    });
    cityGroups[key].total_count = cityGroups[key].properties.length;
  });

  for (const cacheItem of Object.values(cityGroups)) {
    const { error } = await supabase
      .from('gulf_city_cache')
      .upsert(cacheItem, { onConflict: 'city_key' });

    if (error) {
      console.error(`Error saving city cache for ${cacheItem.city_key}:`, error.message);
    } else {
      console.log(`✅ Cached ${cacheItem.total_count} properties for "${cacheItem.city_key}"`);
    }
  }

  console.log('🎉 Gulf seed process completed successfully!');
}

seed().catch(console.error);
