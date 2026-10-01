import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {}
import User from '../models/User';
import Category from '../models/Category';
import Product from '../models/Product';
import Order from '../models/Order';
import Video from '../models/Video';
import Settings from '../models/Settings';

const INITIAL_CATEGORIES = [
  {
    name: 'Wild Forest Honey',
    slug: 'wild-forest-honey',
    description: 'Dark, enzyme-rich raw nectar collected from deep forest flora & untouched wild hives.',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80',
    productCount: 1,
  },
  {
    name: 'Single Flora Honey',
    slug: 'single-flora',
    description: 'Monofloral honey harvested during specific seasonal flower blooms across regional valleys.',
    image: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=800&q=80',
    productCount: 2,
  },
  {
    name: 'Ayurvedic & Herbal Infusions',
    slug: 'ayurvedic-infused',
    description: 'Raw honey slow-infused with potent Vedic herbs like Tulsi, Ginger, Cinnamon & Ashwagandha.',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
    productCount: 1,
  },
  {
    name: 'Honeycomb & Gourmet',
    slug: 'honeycomb-gourmet',
    description: 'Pure chewable raw comb frames and naturally churned crystal cream honey spreads.',
    image: 'https://images.unsplash.com/photo-1471943311424-646960669fbc?auto=format&fit=crop&w=800&q=80',
    productCount: 2,
  },
];

const INITIAL_PRODUCTS_DATA = [
  {
    name: 'Madhuvan Sundarbans Wild Forest Honey',
    slug: 'sundarbans-wild-forest-honey',
    tagline: 'Dark, multi-floral raw honey harvested by traditional Mowals from deep mangrove forests',
    description:
      'Our Sundarbans Wild Forest Honey is 100% raw, unheated, and unpasteurized. Collected by traditional indigenous honey collectors (Mowals) from giant wild Apis dorsata honeybees deep in the UNESCO biosphere. It features a bold woody undertone, high bee-pollen content, and rich antioxidant properties.',
    story:
      'Every spring, brave tribal collectors journey deep into the pristine mangrove sanctuaries. We partner directly with forest communities ensuring ethical harvesting where colonies remain unharmed.',
    categorySlug: 'wild-forest-honey',
    price: 649,
    originalPrice: 850,
    discountPercent: 24,
    rating: 4.9,
    reviewsCount: 148,
    stock: 45,
    images: [
      'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1471943311424-646960669fbc?auto=format&fit=crop&w=1000&q=80',
    ],
    sizes: [
      { size: '250g', price: 349, originalPrice: 450, stock: 30, sku: 'MV-SND-250' },
      { size: '500g', price: 649, originalPrice: 850, stock: 45, sku: 'MV-SND-500' },
      { size: '1kg', price: 1199, originalPrice: 1599, stock: 20, sku: 'MV-SND-1000' },
    ],
    selectedSize: '500g',
    origin: 'Sundarbans Biosphere Reserve, West Bengal',
    nectarSource: 'Wild Mangrove Blossom, Khalsi, Goran & Gewa',
    harvestSeason: 'March - May (Spring Bloom)',
    purityScore: 99.8,
    benefits: [
      'High in naturally occurring polyphenols and flavonoids',
      'Zero added sucrose, syrup, or artificial coloring',
      'Retains live beneficial enzymes (Diastase & Invertase)',
      'Natural remedy for cough, throat irritation & immunity',
    ],
    nutritionFacts: {
      energy: '304 kcal per 100g',
      carbohydrates: '82.4g',
      naturalSugars: '80.1g (Fructose 40%, Glucose 35%)',
      proteins: '0.3g',
      antioxidants: 'Rich in Pinocembrin & Chrysin',
    },
    isFeatured: true,
    isBestSeller: true,
    isOrganicCertified: true,
    reviews: [
      {
        userName: 'Ananya Sharma',
        rating: 5,
        comment: 'You can smell the raw forest flora the moment you open the lid. Very authentic and thick.',
        date: '2026-03-10',
        verified: true,
      },
      {
        userName: 'Vikramaditya Verma',
        rating: 5,
        comment: 'Tested it with water and flame - passed with flying colors. Madhuvan is genuine raw honey.',
        date: '2026-03-02',
        verified: true,
      },
    ],
  },
  {
    name: 'Madhuvan Kashmir Valley Acacia Honey',
    slug: 'kashmir-valley-acacia-honey',
    tagline: 'Water-clear delicate nectar from high altitude Kashmir Himalayan Robinia blooms',
    description:
      'Renowned as the queen of honeys, our Kashmir Acacia honey is harvested at 6,000+ feet in the valleys of Jammu & Kashmir. It has a light golden hue, mild floral aroma, low glycemic index, and rarely crystallizes over time due to naturally high fructose content.',
    story:
      'Sourced from nomadic beekeepers who follow seasonal blooming patterns across the Pir Panjal ranges during early summer.',
    categorySlug: 'single-flora',
    price: 799,
    originalPrice: 999,
    discountPercent: 20,
    rating: 4.8,
    reviewsCount: 112,
    stock: 38,
    images: [
      'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1000&q=80',
    ],
    sizes: [
      { size: '250g', price: 420, originalPrice: 520, stock: 25, sku: 'MV-ACA-250' },
      { size: '500g', price: 799, originalPrice: 999, stock: 38, sku: 'MV-ACA-500' },
      { size: '1kg', price: 1499, originalPrice: 1899, stock: 15, sku: 'MV-ACA-1000' },
    ],
    selectedSize: '500g',
    origin: 'Kashmir Valley & Anantnag, J&K',
    nectarSource: 'Robinia Pseudoacacia (Black Locust)',
    harvestSeason: 'May - June',
    purityScore: 99.9,
    benefits: [
      'Low Glycemic Index compared to standard honeys',
      'Exceptionally mild taste, ideal for green tea and children',
      'Promotes digestive wellness and gut microbiome',
      '100% cold-extracted without fine ultra-filtration',
    ],
    nutritionFacts: {
      energy: '302 kcal per 100g',
      carbohydrates: '81.8g',
      naturalSugars: '79.5g (High Fructose)',
      proteins: '0.2g',
      antioxidants: 'Bioflavonoids & Ascorbic Acid',
    },
    isFeatured: true,
    isBestSeller: true,
    isOrganicCertified: true,
    reviews: [
      {
        userName: 'Dr. Rohan Iyer',
        rating: 5,
        comment: 'Crystal clear and does not overpower my morning green tea. Exceptional quality.',
        date: '2026-02-28',
        verified: true,
      },
    ],
  },
  {
    name: 'Madhuvan Organic Jamun Blossom Honey',
    slug: 'organic-jamun-blossom-honey',
    tagline: 'Bittersweet dark amber honey from native Indian Blackberry orchards',
    description:
      'Unique bittersweet flavor profile with an enticing dark mahogany color. Collected when Indian blackberry (Jamun) trees are in full bloom. Known traditionally in Ayurveda for aiding blood sugar balance, metabolism, and digestive soothing.',
    story:
      'Harvested from certified organic orchards in Madhya Pradesh where wild bees feast solely on Jamun blossoms for two concentrated weeks.',
    categorySlug: 'single-flora',
    price: 599,
    originalPrice: 750,
    discountPercent: 20,
    rating: 4.7,
    reviewsCount: 89,
    stock: 28,
    images: [
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1000&q=80',
    ],
    sizes: [
      { size: '250g', price: 320, originalPrice: 399, stock: 20, sku: 'MV-JAM-250' },
      { size: '500g', price: 599, originalPrice: 750, stock: 28, sku: 'MV-JAM-500' },
      { size: '1kg', price: 1099, originalPrice: 1399, stock: 12, sku: 'MV-JAM-1000' },
    ],
    selectedSize: '500g',
    origin: 'Kanha Forest Border, Madhya Pradesh',
    nectarSource: 'Syzygium Cumini (Jamun Tree)',
    harvestSeason: 'April - May',
    purityScore: 99.6,
    benefits: [
      'Traditional Ayurvedic support for glucose metabolism',
      'High natural zinc, iron, and potassium content',
      'Distinctive woody, bittersweet aftertaste',
      'Calms stomach acid and improves gut health',
    ],
    nutritionFacts: {
      energy: '298 kcal per 100g',
      carbohydrates: '79.2g',
      naturalSugars: '77.0g',
      proteins: '0.4g',
      antioxidants: 'Rich in Anthocyanins and Gallic acid',
    },
    isFeatured: true,
    isBestSeller: false,
    isOrganicCertified: true,
    reviews: [
      {
        userName: 'Meera Deshmukh',
        rating: 5,
        comment: 'Has that authentic Jamun flavor. Not overly sugary, wonderful earthy note.',
        date: '2026-03-05',
        verified: true,
      },
    ],
  },
  {
    name: 'Madhuvan Vedic Holy Tulsi Infused Raw Honey',
    slug: 'vedic-holy-tulsi-infused-raw-honey',
    tagline: 'Raw forest honey slow-infused with Krishna & Rama Tulsi holy basil',
    description:
      'An Ayurvedic powerhouse combining wild raw multi-floral honey with sun-dried Holy Basil (Tulsi) leaves. Known as the Elixir of Life, this infusion offers a refreshing herbal fragrance and strong adaptogenic immunity support.',
    story:
      'Prepared using classical Ayurvedic methods of cold sun-infusion over 21 days so the botanical essential oils enrich the raw honey without heating.',
    categorySlug: 'ayurvedic-infused',
    price: 699,
    originalPrice: 899,
    discountPercent: 22,
    rating: 4.9,
    reviewsCount: 164,
    stock: 50,
    images: [
      'https://images.unsplash.com/photo-1546554137-f86b9593a222?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1000&q=80',
    ],
    sizes: [
      { size: '250g', price: 380, originalPrice: 480, stock: 25, sku: 'MV-TLS-250' },
      { size: '500g', price: 699, originalPrice: 899, stock: 50, sku: 'MV-TLS-500' },
      { size: '1kg', price: 1299, originalPrice: 1699, stock: 18, sku: 'MV-TLS-1000' },
    ],
    selectedSize: '500g',
    origin: 'Vrindavan & Haridwar foothills, Uttarakhand',
    nectarSource: 'Ocimum Sanctum & Wild Himalayan flora',
    harvestSeason: 'Year-Round Slow Solar Infusion',
    purityScore: 99.9,
    benefits: [
      'Adaptogenic support to ease seasonal allergies and stress',
      'Soothes chest congestion, seasonal flu & sore throat',
      'Rich in Eugenol and natural antioxidants',
      'Can be taken directly or with warm herbal decoctions',
    ],
    nutritionFacts: {
      energy: '308 kcal per 100g',
      carbohydrates: '82.0g',
      naturalSugars: '79.0g',
      proteins: '0.4g',
      antioxidants: 'Eugenol, Apigenin, Rosmarinic Acid',
    },
    isFeatured: true,
    isBestSeller: true,
    isOrganicCertified: true,
    reviews: [
      {
        userName: 'Suresh Menon',
        rating: 5,
        comment: 'Cured my persistent dry cough within two days. The basil aroma is intoxicating.',
        date: '2026-03-12',
        verified: true,
      },
    ],
  },
  {
    name: 'Madhuvan 100% Virgin Raw Honeycomb Frame',
    slug: 'virgin-raw-honeycomb-frame',
    tagline: 'Untouched edible wax honeycomb submerged in pure liquid mountain nectar',
    description:
      'The purest form of honey on Earth. Straight from the bee hive into food-grade wooden gift boxes without any human touch or machine processing. Chew the nutritious natural beeswax, loaded with propolis, bee pollen, and golden nectar.',
    story:
      'Each honeycomb is cut by hand with heated stainless steel knives from select hives located in organic mountain sanctuaries.',
    categorySlug: 'honeycomb-gourmet',
    price: 899,
    originalPrice: 1199,
    discountPercent: 25,
    rating: 5.0,
    reviewsCount: 76,
    stock: 22,
    images: [
      'https://images.unsplash.com/photo-1471943311424-646960669fbc?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=1000&q=80',
    ],
    sizes: [
      { size: '350g Comb', price: 899, originalPrice: 1199, stock: 22, sku: 'MV-CMB-350' },
      { size: '700g Comb', price: 1699, originalPrice: 2199, stock: 10, sku: 'MV-CMB-700' },
    ],
    selectedSize: '350g Comb',
    origin: 'Kullu Valley, Himachal Pradesh',
    nectarSource: 'Mountain Meadow Wildflowers & Apple Blossoms',
    harvestSeason: 'Autumn Harvest (October)',
    purityScore: 100.0,
    benefits: [
      '100% unadulterated directly from the hive cells',
      'Natural chewable beeswax full of beneficial bee propolis',
      'Gourmet culinary presentation for cheese boards and fruits',
      'Zero heat, zero filtering, 100% bee-sealed freshness',
    ],
    nutritionFacts: {
      energy: '315 kcal per 100g',
      carbohydrates: '81.5g',
      naturalSugars: '80.0g',
      proteins: '0.6g (including Bee Pollen & Propolis)',
      antioxidants: 'Maximum crude enzyme retention',
    },
    isFeatured: true,
    isBestSeller: false,
    isOrganicCertified: true,
    reviews: [
      {
        userName: 'Chef Karan Malhotra',
        rating: 5,
        comment: 'Chewing raw honeycomb with artisanal aged cheddar is heaven. Packaging is stunning!',
        date: '2026-03-14',
        verified: true,
      },
    ],
  },
  {
    name: 'Madhuvan Creamed Mustard Blossom Honey',
    slug: 'creamed-mustard-blossom-honey',
    tagline: 'Velvety smooth, naturally crystallised golden cream honey for toast and smoothies',
    description:
      'Golden yellow, rich, and velvety smooth. Mustard blossom honey naturally crystallizes rapidly due to high dextrose. We carefully churn it at cold temperatures into a luscious, butter-like spread without any chemicals or dairy.',
    story: 'Harvested during the breathtaking yellow winter mustard blooms of rural Punjab and Rajasthan.',
    categorySlug: 'honeycomb-gourmet',
    price: 499,
    originalPrice: 650,
    discountPercent: 23,
    rating: 4.7,
    reviewsCount: 63,
    stock: 35,
    images: [
      'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1546554137-f86b9593a222?auto=format&fit=crop&w=1000&q=80',
    ],
    sizes: [
      { size: '250g', price: 280, originalPrice: 350, stock: 25, sku: 'MV-MST-250' },
      { size: '500g', price: 499, originalPrice: 650, stock: 35, sku: 'MV-MST-500' },
      { size: '1kg', price: 899, originalPrice: 1199, stock: 15, sku: 'MV-MST-1000' },
    ],
    selectedSize: '500g',
    origin: 'Bharatpur, Rajasthan & Punjab Plains',
    nectarSource: 'Brassica Juncea (Yellow Mustard Flowers)',
    harvestSeason: 'December - January (Winter Bloom)',
    purityScore: 99.7,
    benefits: [
      'Natural spreadable texture that does not drip',
      'Warm digestive qualities as per traditional medicine',
      'Rich in warming minerals and plant sterols',
      'Ideal dairy-free natural replacement for jams and butter',
    ],
    nutritionFacts: {
      energy: '304 kcal per 100g',
      carbohydrates: '82.3g',
      naturalSugars: '81.0g (High natural dextrose)',
      proteins: '0.3g',
      antioxidants: 'Glucosinolates and polyphenols',
    },
    isFeatured: false,
    isBestSeller: false,
    isOrganicCertified: true,
    reviews: [
      {
        userName: 'Pooja Bhatt',
        rating: 5,
        comment: 'Kids love spreading it on toast! Tastes like sweet whipped butter.',
        date: '2026-03-01',
        verified: true,
      },
    ],
  },
];

const INITIAL_VIDEOS = [
  {
    title: 'Extracting Golden Amber Nectar from Sundarbans Wild Comb',
    description:
      'Watch how tribal Mowals ethically harvest giant wild Apis dorsata honeycombs deep in the Sundarbans mangrove reserves without harming the bee colony.',
    videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/61/Slow_Motion_Bee_Flight_-_Close-up_video_of_honey_bees.webm',
    thumbnailUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80',
    category: 'harvest',
    duration: '1:15',
    taggedProductName: 'Madhuvan Sundarbans Wild Forest Honey',
    taggedProductSlug: 'sundarbans-wild-forest-honey',
    views: 14200,
    featuredOnHome: true,
  },
  {
    title: 'Nomadic Kashmiri Beekeeping in Robinia Acacia Valleys',
    description:
      'Journey to 6,500 ft altitude in Jammu & Kashmir as our beekeepers follow the pristine white acacia blossom migration across the Pir Panjal ranges.',
    videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e2/Bee_in_ultra_slow_motion.webm',
    thumbnailUrl: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=800&q=80',
    category: 'story',
    duration: '1:45',
    taggedProductName: 'Madhuvan Kashmir Valley Acacia Honey',
    taggedProductSlug: 'kashmir-valley-acacia-honey',
    views: 28900,
    featuredOnHome: true,
  },
  {
    title: 'How to Do the Cold Water Purity Test at Home',
    description:
      'See the exact difference between 100% pure raw unheated honey and adulterated commercial corn syrup in a single glass of water.',
    videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/17/Honey_bee_gathering_pollen.webm',
    thumbnailUrl: 'https://images.unsplash.com/photo-1471943311424-646960669fbc?auto=format&fit=crop&w=800&q=80',
    category: 'purity',
    duration: '0:50',
    taggedProductName: 'Madhuvan Sundarbans Wild Forest Honey',
    taggedProductSlug: 'sundarbans-wild-forest-honey',
    views: 34100,
    featuredOnHome: true,
  },
  {
    title: 'Centrifugal Cold Extraction in Artisanal Wooden Apiaries',
    description:
      'Experience hygienic extraction at 28°C cold filtration, retaining 100% of live natural enzymes, bee pollen, and propolis in every bottle.',
    videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/63/20240728_honey_bee_hive_wood_parcel_wm.webm',
    thumbnailUrl: 'https://images.unsplash.com/photo-1546554137-f86b9593a222?auto=format&fit=crop&w=800&q=80',
    category: 'harvest',
    duration: '1:30',
    taggedProductName: 'Madhuvan Sundarbans Wild Forest Honey',
    taggedProductSlug: 'sundarbans-wild-forest-honey',
    views: 19800,
    featuredOnHome: true,
  },
  {
    title: 'Ayurvedic Holy Tulsi Honey Decoction for Seasonal Immunity',
    description:
      'Master beekeeper and herbalist Vaidya Joshi demonstrates brewing lukewarm Tulsi raw honey tea to soothe chest congestion and boost immunity.',
    videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Western_honey_bee_%28Apis_mellifera%29.webm',
    thumbnailUrl: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=800&q=80',
    category: 'recipe',
    duration: '2:10',
    taggedProductName: 'Madhuvan Vedic Holy Tulsi Infused Raw Honey',
    taggedProductSlug: 'vedic-holy-tulsi-infused-raw-honey',
    views: 22400,
    featuredOnHome: true,
  },
];

async function seedDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/madhuvan_honey';
    console.log(`[Seed] Connecting to MongoDB: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    console.log('[Seed] Cleaning existing collections...');
    await Promise.all([
      Category.deleteMany({}),
      Product.deleteMany({}),
      Video.deleteMany({}),
      Settings.deleteMany({}),
      User.deleteMany({ email: { $ne: 'preserve_custom@madhuvanhoney.com' } }),
      Order.deleteMany({}),
    ]);

    // 1. Seed Store Settings
    console.log('[Seed] Seeding store settings...');
    await Settings.create({
      storeName: 'Madhuvan Honey',
      brandTagline: '100% Pure, Raw & Forest Harvested Honey',
      phone: '+91 98765 43210',
      whatsapp: '+91 98765 43210',
      email: 'support@madhuvanhoney.com',
      salesEmail: 'orders@madhuvanhoney.com',
      address: 'Madhuvan Apiaries, Foothills of Jim Corbett & Sunderbans, Uttarakhand 244715, India',
      hours: 'Mon - Sat: 9:00 AM - 7:00 PM IST',
      freeShippingThreshold: 999,
      shippingFee: 79,
      gstPercentage: 5,
      socialLinks: {
        instagram: 'https://instagram.com/madhuvanhoney',
        facebook: 'https://facebook.com/madhuvanhoney',
        youtube: 'https://youtube.com/@madhuvanhoney',
        twitter: 'https://twitter.com/madhuvanhoney',
      },
    });

    // 2. Seed Admin & Customers
    console.log('[Seed] Seeding Admin and Patron users...');
    const admin = await User.create({
      name: 'Master Beekeeper',
      email: 'admin@madhuvanhoney.com',
      password: 'adminhoney123',
      phone: '+91 98765 43210',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      address: {
        street: 'Madhuvan Apiary Station 1',
        city: 'Nainital',
        state: 'Uttarakhand',
        pincode: '263001',
        country: 'India',
      },
    });

    const cust1 = await User.create({
      name: 'Aarav Patel',
      email: 'aarav.patel@example.com',
      password: 'customer123',
      phone: '+91 98201 44521',
      role: 'customer',
      address: {
        street: 'Flat 402, Honeycomb Heights, Koramangala 4th Block',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560034',
        country: 'India',
      },
    });

    const cust2 = await User.create({
      name: 'Pooja Iyer',
      email: 'pooja.iyer@example.com',
      password: 'customer123',
      phone: '+91 97112 33412',
      role: 'customer',
      address: {
        street: 'C-14, Green Park Extension',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110016',
        country: 'India',
      },
    });

    const cust3 = await User.create({
      name: 'Vikramaditya Verma',
      email: 'vikram.verma@example.com',
      password: 'customer123',
      phone: '+91 98722 11983',
      role: 'customer',
      address: {
        street: 'House 82, Sector 9-D',
        city: 'Chandigarh',
        state: 'Punjab',
        pincode: '160009',
        country: 'India',
      },
    });

    // 3. Seed Categories
    console.log('[Seed] Seeding Categories...');
    const catMap = new Map<string, mongoose.Types.ObjectId>();
    for (const catData of INITIAL_CATEGORIES) {
      const cat = await Category.create(catData);
      catMap.set(cat.slug, cat._id);
    }

    // 4. Seed Products
    console.log('[Seed] Seeding Honey Harvest Products...');
    const createdProducts = [];
    for (const prodData of INITIAL_PRODUCTS_DATA) {
      const catId = catMap.get(prodData.categorySlug);
      const product = await Product.create({
        ...prodData,
        category: catId,
      });
      createdProducts.push(product);
    }

    // 5. Seed Videos
    console.log('[Seed] Seeding Video Reels...');
    for (const vid of INITIAL_VIDEOS) {
      const taggedProd = createdProducts.find((p) => p.slug === vid.taggedProductSlug);
      await Video.create({
        ...vid,
        category: vid.category as any,
        taggedProductId: taggedProd?._id.toString() || '',
      });
    }

    // 6. Seed Realistic Orders
    console.log('[Seed] Seeding Initial Consignment Orders...');
    const prodSundarbans = createdProducts[0];
    const prodTulsi = createdProducts[3];
    const prodAcacia = createdProducts[1];

    await Order.create({
      orderNumber: 'MDH-8821',
      user: cust1._id,
      customerName: cust1.name,
      customerEmail: cust1.email,
      customerPhone: cust1.phone,
      shippingAddress: {
        fullName: cust1.name,
        email: cust1.email,
        phone: cust1.phone,
        addressLine1: cust1.address?.street || 'Honeycomb Heights',
        city: cust1.address?.city || 'Bengaluru',
        state: cust1.address?.state || 'Karnataka',
        pincode: cust1.address?.pincode || '560034',
        country: 'India',
      },
      items: [
        {
          productId: prodSundarbans._id,
          product: prodSundarbans._id,
          productName: prodSundarbans.name,
          name: prodSundarbans.name,
          size: '500g',
          image: prodSundarbans.images[0],
          price: 649,
          quantity: 2,
        },
        {
          productId: prodTulsi._id,
          product: prodTulsi._id,
          productName: prodTulsi.name,
          name: prodTulsi.name,
          size: '500g',
          image: prodTulsi.images[0],
          price: 699,
          quantity: 1,
        },
      ],
      subtotal: 1997,
      discount: 100,
      shippingFee: 0,
      taxPrice: 99.85,
      total: 1897,
      paymentMethod: 'upi',
      paymentStatus: 'paid',
      orderStatus: 'shipped',
      trackingNumber: 'DELHIVERY-77492019',
      trackingCourier: 'Delhivery Express',
      createdAt: new Date('2026-03-27T11:42:00Z'),
    });

    await Order.create({
      orderNumber: 'MDH-8822',
      user: cust2._id,
      customerName: cust2.name,
      customerEmail: cust2.email,
      customerPhone: cust2.phone,
      shippingAddress: {
        fullName: cust2.name,
        email: cust2.email,
        phone: cust2.phone,
        addressLine1: cust2.address?.street || 'C-14, Green Park',
        city: cust2.address?.city || 'New Delhi',
        state: cust2.address?.state || 'Delhi',
        pincode: cust2.address?.pincode || '110016',
        country: 'India',
      },
      items: [
        {
          productId: prodAcacia._id,
          product: prodAcacia._id,
          productName: prodAcacia.name,
          name: prodAcacia.name,
          size: '500g',
          image: prodAcacia.images[0],
          price: 799,
          quantity: 1,
        },
      ],
      subtotal: 799,
      discount: 0,
      shippingFee: 79,
      taxPrice: 39.95,
      total: 878,
      paymentMethod: 'card',
      paymentStatus: 'paid',
      orderStatus: 'processing',
      trackingNumber: 'MDH-TRK-392812',
      trackingCourier: 'BlueDart Express',
      createdAt: new Date('2026-03-28T09:15:00Z'),
    });

    console.log('==================================================');
    console.log('🍯 Madhuvan Honey Database Seeded Successfully!');
    console.log(`👤 Admin Account: admin@madhuvanhoney.com / adminhoney123`);
    console.log(`👤 Patron Account: aarav.patel@example.com / customer123`);
    console.log(`📦 Categories Seeded: ${INITIAL_CATEGORIES.length}`);
    console.log(`🍯 Products Seeded: ${createdProducts.length}`);
    console.log(`🎥 Video Reels Seeded: ${INITIAL_VIDEOS.length}`);
    console.log('==================================================');

    process.exit(0);
  } catch (error) {
    console.error('Error during database seed:', error);
    process.exit(1);
  }
}

seedDatabase();
