import bcrypt from 'bcryptjs';
import { sql } from './db';

const DEFAULT_PASSWORD_HASH = bcrypt.hashSync('password123', 10);

const LGAS = ['Jos South', 'Barkin Ladi', 'Riyom', 'Jos North', 'Bassa', 'Mangu', 'Bokkos'];

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // 1. Clean existing records (managed by schema cascading, but let's be explicit)
    await sql`TRUNCATE TABLE users CASCADE`;
    console.log('🧹 Cleared existing tables.');

    // 2. Create Admin User
    const [adminUser] = await sql`
      INSERT INTO users (email, password_hash, name, phone, role, preferred_language)
      VALUES ('admin@linkagro.com', ${DEFAULT_PASSWORD_HASH}, 'AgroLink Admin', '08012345678', 'admin', 'en')
      RETURNING id
    `;
    console.log('👑 Admin user created.');

    // 3. Create Farmers (20 Users & Profiles)
    const farmerData = [
      { name: 'Musa Ibrahim', email: 'musa.ibrahim@example.com', farmName: 'Musa Farms', lga: 'Jos South', size: 4.5, exp: 12, crop: 'Irish Potato' },
      { name: 'Pam Gyang', email: 'pam.gyang@example.com', farmName: 'Plateau Agro Collective', lga: 'Barkin Ladi', size: 12.0, exp: 20, crop: 'Maize' },
      { name: 'Sarah Dachung', email: 'sarah.dachung@example.com', farmName: 'Highland Harvest', lga: 'Riyom', size: 2.2, exp: 6, crop: 'Tomato' },
      { name: 'Bitrus Adamu', email: 'bitrus.adamu@example.com', farmName: 'Jos Fresh Produce', lga: 'Jos North', size: 3.0, exp: 8, crop: 'Vegetables' },
      { name: 'Yohanna Lar', email: 'yohanna.lar@example.com', farmName: 'Bassa Organic Farms', lga: 'Bassa', size: 8.5, exp: 15, crop: 'Soybean' },
      { name: 'Grace Lekwot', email: 'grace.lekwot@example.com', farmName: 'Mangu Potato Hub', lga: 'Mangu', size: 15.0, exp: 10, crop: 'Irish Potato' },
      { name: 'Joseph Mangut', email: 'joseph.mangut@example.com', farmName: 'Bokkos Seed Farm', lga: 'Bokkos', size: 6.8, exp: 18, crop: 'Irish Potato' },
      { name: 'Rahila Dung', email: 'rahila.dung@example.com', farmName: 'Vwang Dairy & Farms', lga: 'Jos South', size: 5.0, exp: 9, crop: 'Fruits' },
      { name: 'Usman Jauro', email: 'usman.jauro@example.com', farmName: 'Miango Grain Fields', lga: 'Bassa', size: 22.0, exp: 25, crop: 'Maize' },
      { name: 'Esther Dalyop', email: 'esther.dalyop@example.com', farmName: 'Ropp Valley Orchards', lga: 'Barkin Ladi', size: 3.5, exp: 7, crop: 'Onion' },
      { name: 'Shehu Bello', email: 'shehu.bello@example.com', farmName: 'Bello & Sons Agricultural', lga: 'Jos North', size: 10.0, exp: 14, crop: 'Pepper' },
      { name: 'Mary Gofwen', email: 'mary.gofwen@example.com', farmName: 'Panyam Fish & Crop Farm', lga: 'Mangu', size: 7.2, exp: 11, crop: 'Rice' },
      { name: 'Daniel Mahanan', email: 'daniel.mahanan@example.com', farmName: 'Daffo Potato Growers', lga: 'Bokkos', size: 14.5, exp: 22, crop: 'Irish Potato' },
      { name: 'Keziah Wash', email: 'keziah.wash@example.com', farmName: 'Riyom Tomato Gardens', lga: 'Riyom', size: 1.8, exp: 5, crop: 'Tomato' },
      { name: 'Ibrahim Bala', email: 'ibrahim.bala@example.com', farmName: 'Bala Farm Ventures', lga: 'Jos South', size: 9.0, exp: 16, crop: 'Onion' },
      { name: 'Hannatu Joshua', email: 'hannatu.joshua@example.com', farmName: 'Joshua Crops', lga: 'Bassa', size: 2.8, exp: 4, crop: 'Pepper' },
      { name: 'Gyang Pam', email: 'gyang.pam@example.com', farmName: 'Gyang & Brothers Farm', lga: 'Barkin Ladi', size: 5.5, exp: 12, crop: 'Maize' },
      { name: 'Suleiman Aliyu', email: 'suleiman.aliyu@example.com', farmName: 'Aliyu Rice Farm', lga: 'Mangu', size: 18.0, exp: 13, crop: 'Rice' },
      { name: 'Comfort Audu', email: 'comfort.audu@example.com', farmName: 'Audu Veggies', lga: 'Jos North', size: 1.5, exp: 3, crop: 'Vegetables' },
      { name: 'Samuel Mwansat', email: 'samuel.mwansat@example.com', farmName: 'Mwansat Potato Fields', lga: 'Bokkos', size: 11.0, exp: 17, crop: 'Irish Potato' }
    ];

    const farmers: any[] = [];

    for (const f of farmerData) {
      // Insert User
      const [u] = await sql`
        INSERT INTO users (email, password_hash, name, phone, role, preferred_language)
        VALUES (${f.email}, ${DEFAULT_PASSWORD_HASH}, ${f.name}, '080' || floor(random() * 90000000 + 10000000)::text, 'farmer', 'en')
        RETURNING id, name, email
      `;

      // Insert Profile
      // Mark about 15 as verified, 3 as pending, 2 as under_review
      const rand = Math.random();
      const status = rand < 0.75 ? 'verified' : rand < 0.9 ? 'pending' : 'under_review';
      
      const [p] = await sql`
        INSERT INTO farmer_profiles (id, farm_name, farm_size, experience_years, verification_status)
        VALUES (${u.id}, ${f.farmName}, ${f.size}, ${f.exp}, ${status})
        RETURNING id, farm_name, verification_status
      `;

      // Insert Location
      await sql`
        INSERT INTO farm_locations (user_id, address, state, lga, community)
        VALUES (${u.id}, ${`${f.farmName} Compound`}, 'Plateau', ${f.lga}, ${`${f.lga} Area`})
      `;

      farmers.push({ id: u.id, name: u.name, farmName: p.farm_name, lga: f.lga, verificationStatus: p.verification_status, mainCrop: f.crop });
    }
    console.log(`👨🌾 Seeded ${farmers.length} Farmers and profiles.`);

    // 4. Create Buyers (10 Users & Profiles)
    const buyerData = [
      { name: 'Alhaji Kabiru', email: 'kabiru.wholesalers@example.com', comp: 'Kabiru Agro Wholesalers', type: 'wholesaler', lga: 'Jos North' },
      { name: 'Nkechi Okafor', email: 'nkechi.foods@example.com', comp: 'Okafor Food Processing Ltd', type: 'processor', lga: 'Jos South' },
      { name: 'Dr. John Yusuf', email: 'john.yusuf@example.com', comp: 'Grand Cereals Processor', type: 'processor', lga: 'Jos South' },
      { name: 'Halima Sani', email: 'halima.retail@example.com', comp: 'Halima Fresh Markets', type: 'retailer', lga: 'Jos North' },
      { name: 'Bature Hotel Group', email: 'procurement@baturehotel.com', comp: 'Bature Luxury Hotels & Suites', type: 'hotel', lga: 'Jos North' },
      { name: 'Plateau School Board', email: 'board.procurement@example.com', comp: 'Plateau Institutional Catering', type: 'institution', lga: 'Jos South' },
      { name: 'West Africa Exports', email: 'export@waexports.com', comp: 'West Africa Sourcing Co.', type: 'exporter', lga: 'Bassa' },
      { name: 'Jos Fast Foods', email: 'purchase@josfastfoods.com', comp: 'Jos Fast Food Restaurants', type: 'restaurant', lga: 'Jos North' },
      { name: 'Yusuf Grains', email: 'yusuf.grains@example.com', comp: 'Yusuf Feed Mill & Grains', type: 'food_company', lga: 'Mangu' },
      { name: 'Global Agrifoods', email: 'procure@globalagri.com', comp: 'Global Agrifoods Trading', type: 'wholesaler', lga: 'Jos South' }
    ];

    const buyers: any[] = [];

    for (const b of buyerData) {
      const [u] = await sql`
        INSERT INTO users (email, password_hash, name, phone, role, preferred_language)
        VALUES (${b.email}, ${DEFAULT_PASSWORD_HASH}, ${b.name}, '090' || floor(random() * 90000000 + 10000000)::text, 'buyer', 'en')
        RETURNING id, name, email
      `;

      // 8 verified, 2 pending
      const status = Math.random() < 0.8 ? 'verified' : 'pending';

      const [p] = await sql`
        INSERT INTO buyer_profiles (id, company_name, business_type, verification_status)
        VALUES (${u.id}, ${b.comp}, ${b.type}, ${status})
        RETURNING id, company_name, verification_status
      `;

      // Insert Location
      await sql`
        INSERT INTO farm_locations (user_id, address, state, lga, community)
        VALUES (${u.id}, ${`${b.comp} Office`}, 'Plateau', ${b.lga}, ${`${b.lga} Hub Town`})
      `;

      buyers.push({ id: u.id, name: u.name, companyName: p.company_name, lga: b.lga, verificationStatus: p.verification_status });
    }
    console.log(`🏢 Seeded ${buyers.length} Buyers and profiles.`);

    // 5. Create Produce Listings (30 listings)
    // Categories: 'Irish Potato', 'Tomato', 'Onion', 'Maize', 'Rice', 'Soybean', 'Pepper', 'Vegetables', 'Fruits', 'Other'
    const crops = [
      { category: 'Irish Potato', variety: 'Nicola', unit: 'tonnes', price: 450000 },
      { category: 'Irish Potato', variety: 'Russet', unit: 'tonnes', price: 480000 },
      { category: 'Tomato', variety: 'Roma', unit: 'bags', price: 25000 },
      { category: 'Tomato', variety: 'UC82B', unit: 'bags', price: 27000 },
      { category: 'Onion', variety: 'Red Creoles', unit: 'bags', price: 35000 },
      { category: 'Onion', variety: 'White Lisbon', unit: 'bags', price: 38000 },
      { category: 'Maize', variety: 'Yellow Dent', unit: 'tonnes', price: 320000 },
      { category: 'Maize', variety: 'White Flint', unit: 'tonnes', price: 340000 },
      { category: 'Rice', variety: 'FARO 44', unit: 'tonnes', price: 550000 },
      { category: 'Soybean', variety: 'TGX-1448', unit: 'tonnes', price: 410000 },
      { category: 'Pepper', variety: 'Habenero (Atarodo)', unit: 'bags', price: 30000 },
      { category: 'Pepper', variety: 'Cayenne (Sombo)', unit: 'bags', price: 28000 },
      { category: 'Vegetables', variety: 'Cabbage', unit: 'bags', price: 15000 },
      { category: 'Vegetables', variety: 'Carrot', unit: 'bags', price: 18000 },
      { category: 'Fruits', variety: 'Orange', unit: 'bags', price: 12000 }
    ];

    const listings: any[] = [];

    // Let's loop and assign listings to farmers based on their mainCrop
    for (let i = 0; i < 30; i++) {
      const farmer = farmers[i % farmers.length];
      const cropRef = crops.find(c => c.category === farmer.mainCrop) || crops[i % crops.length];
      const quantity = Math.floor(Math.random() * 45 + 5); // 5 to 50 tonnes/bags
      const grade = Math.random() < 0.6 ? 'Grade A' : Math.random() < 0.9 ? 'Grade B' : 'Grade C';
      
      const harvestOffset = Math.floor(Math.random() * 30 - 15); // harvest date -15 to +15 days from now
      const harvestDate = new Date();
      harvestDate.setDate(harvestDate.getDate() + harvestOffset);
      
      const availableDate = new Date(harvestDate);
      availableDate.setDate(availableDate.getDate() + 2); // available 2 days after harvest

      const [list] = await sql`
        INSERT INTO produce_listings (
          farmer_id, category, variety, quantity, unit, price_per_unit, price_type, quality_grade, harvest_date, available_date, is_active, description
        )
        VALUES (
          ${farmer.id}, ${cropRef.category}, ${cropRef.variety}, ${quantity}, ${cropRef.unit}, ${cropRef.price}, 'negotiable', ${grade}, ${harvestDate}, ${availableDate}, true, 
          ${`High-quality ${cropRef.category} (${cropRef.variety}) freshly harvested in ${farmer.lga}, Plateau State. Available for commercial buyers.`}
        )
        RETURNING id, farmer_id, category, quantity, unit, quality_grade, price_per_unit, harvest_date
      `;
      listings.push(list);
    }
    console.log(`🌾 Seeded ${listings.length} Produce Listings.`);

    // 6. Create Demand Requests (10 requests)
    const demandInputs = [
      { product: 'Irish Potato', quantity: 50.0, unit: 'tonnes', grade: 'Grade A', lga: 'Abuja', state: 'FCT', dateOffset: 45, priceMin: 400000, priceMax: 500000 },
      { product: 'Tomato', quantity: 200.0, unit: 'bags', grade: 'Grade A', lga: 'Jos South', state: 'Plateau', dateOffset: 15, priceMin: 22000, priceMax: 28000 },
      { product: 'Maize', quantity: 100.0, unit: 'tonnes', grade: 'Grade B', lga: 'Lagos', state: 'Lagos', dateOffset: 30, priceMin: 300000, priceMax: 350000 },
      { product: 'Rice', quantity: 80.0, unit: 'tonnes', grade: 'Grade A', lga: 'Port Harcourt', state: 'Rivers', dateOffset: 60, priceMin: 500000, priceMax: 600000 },
      { product: 'Onion', quantity: 150.0, unit: 'bags', grade: 'Grade A', lga: 'Kano', state: 'Kano', dateOffset: 20, priceMin: 32000, priceMax: 38000 },
      { product: 'Irish Potato', quantity: 20.0, unit: 'tonnes', grade: 'Grade B', lga: 'Jos North', state: 'Plateau', dateOffset: 10, priceMin: 420000, priceMax: 480000 },
      { product: 'Soybean', quantity: 60.0, unit: 'tonnes', grade: 'Grade A', lga: 'Ibadan', state: 'Oyo', dateOffset: 50, priceMin: 380000, priceMax: 430000 },
      { product: 'Pepper', quantity: 80.0, unit: 'bags', grade: 'Grade A', lga: 'Jos South', state: 'Plateau', dateOffset: 5, priceMin: 26000, priceMax: 32000 },
      { product: 'Vegetables', quantity: 120.0, unit: 'bags', grade: 'Grade B', lga: 'Abuja', state: 'FCT', dateOffset: 12, priceMin: 14000, priceMax: 18000 },
      { product: 'Irish Potato', quantity: 50.0, unit: 'tonnes', grade: 'Grade A', lga: 'Abuja', state: 'FCT', dateOffset: 44, priceMin: 430000, priceMax: 490000 } // The target demo request (required date approx 15 Sept 2026)
    ];

    const demands: any[] = [];
    for (let i = 0; i < demandInputs.length; i++) {
      const buyer = buyers[i % buyers.length];
      const input = demandInputs[i];
      
      const reqDate = new Date();
      // For the 10th request, set specifically to 2026-09-15 as per instructions
      if (i === 9) {
        reqDate.setFullYear(2026, 8, 15); // September is month index 8 (0-indexed)
      } else {
        reqDate.setDate(reqDate.getDate() + input.dateOffset);
      }

      const [dem] = await sql`
        INSERT INTO demand_requests (
          buyer_id, product, quantity, unit, quality_grade, delivery_location_lga, delivery_location_state, required_date, price_min, price_max, status
        )
        VALUES (
          ${buyer.id}, ${input.product}, ${input.quantity}, ${input.unit}, ${input.grade}, ${input.lga}, ${input.state}, ${reqDate}, ${input.priceMin}, ${input.priceMax}, 'active'
        )
        RETURNING id, buyer_id, product, quantity, unit, quality_grade, delivery_location_lga, required_date
      `;
      demands.push(dem);
    }
    console.log(`📋 Seeded ${demands.length} Demand Requests.`);

    // 7. Create Historical Transactions (20 transactions)
    // Statuses: 'inquiry', 'negotiation', 'agreement', 'confirmed', 'in_progress', 'completed', 'cancelled', 'disputed'
    const txStatuses = ['completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'cancelled', 'cancelled', 'disputed', 'in_progress'];
    const transactions: any[] = [];

    for (let i = 0; i < 20; i++) {
      const buyer = buyers[i % buyers.length];
      const farmer = farmers[(i + 3) % farmers.length];
      const listing = listings[i % listings.length];
      const status = txStatuses[i];
      const quantity = Math.floor(Math.random() * 15 + 2); // smaller transaction sizes
      const price = Number(listing.price_per_unit);
      const totalVal = quantity * price;

      const date = new Date();
      date.setDate(date.getDate() - (25 - i));

      const [tx] = await sql`
        INSERT INTO transactions (
          buyer_id, supplier_id, listing_id, product, quantity, unit, price_per_unit, total_value, delivery_location, expected_delivery_date, status, payment_status, created_at
        )
        VALUES (
          ${buyer.id}, ${farmer.id}, ${listing.id}, ${listing.category}, ${quantity}, ${listing.unit}, ${price}, ${totalVal}, ${`${buyer.companyName} Depot, ${buyer.lga}`}, ${date}, ${status},
          ${status === 'completed' ? 'paid' : status === 'disputed' ? 'escrow' : 'unpaid'}, ${date}
        )
        RETURNING id, buyer_id, supplier_id, status, total_value
      `;
      transactions.push(tx);
    }
    console.log(`🤝 Seeded ${transactions.length} Transactions.`);

    // 8. Create Ratings & Reviews (For completed transactions, authors rate each other)
    let ratingsCount = 0;
    for (const tx of transactions) {
      if (tx.status === 'completed') {
        // Buyer rates Farmer
        const buyerRating = Math.floor(Math.random() * 2 + 4); // 4 or 5 stars
        await sql`
          INSERT INTO ratings (
            transaction_id, author_id, recipient_id, rating, feedback, quality_rating, fulfilment_rating, accuracy_rating, communication_rating
          )
          VALUES (
            ${tx.id}, ${tx.buyer_id}, ${tx.supplier_id}, ${buyerRating}, ${`Great transaction. Delivery was prompt and produce is of good quality.`}, ${buyerRating}, ${buyerRating}, ${buyerRating}, ${buyerRating}
          )
        `;

        // Farmer rates Buyer
        const farmerRating = Math.floor(Math.random() * 2 + 4); // 4 or 5 stars
        await sql`
          INSERT INTO ratings (
            transaction_id, author_id, recipient_id, rating, feedback, payment_rating, professionalism_rating, communication_rating
          )
          VALUES (
            ${tx.id}, ${tx.supplier_id}, ${tx.buyer_id}, ${farmerRating}, ${`Buyer was very professional, prompt with payments, and easy to communicate with.`}, ${farmerRating}, ${farmerRating}, ${farmerRating}
          )
        `;

        ratingsCount += 2;
      }
    }
    console.log(`⭐ Seeded ${ratingsCount} Ratings/Reviews.`);

    // 9. Create Messages (For inquiry/negotiation phase transactions or matches)
    let messagesCount = 0;
    for (let i = 0; i < 5; i++) {
      const tx = transactions[transactions.length - 1 - i]; // get last few transactions
      // Insert thread of 3 messages
      await sql`
        INSERT INTO messages (sender_id, recipient_id, transaction_id, content, is_read)
        VALUES (${tx.buyer_id}, ${tx.supplier_id}, ${tx.id}, 'Hello, I am interested in your produce listing. Is it available for delivery next week?', true)
      `;
      await sql`
        INSERT INTO messages (sender_id, recipient_id, transaction_id, content, is_read)
        VALUES (${tx.supplier_id}, ${tx.buyer_id}, ${tx.id}, 'Yes, we are currently harvesting. We can fulfill this order. Let us discuss the final price.', true)
      `;
      await sql`
        INSERT INTO messages (sender_id, recipient_id, transaction_id, content, is_read)
        VALUES (${tx.buyer_id}, ${tx.supplier_id}, ${tx.id}, 'Excellent, I will draft the agreement with the agreed terms.', false)
      `;
      messagesCount += 3;
    }
    console.log(`💬 Seeded ${messagesCount} Messages.`);

    // 10. Seed Notifications
    for (let i = 0; i < farmers.length; i++) {
      const farmer = farmers[i];
      await sql`
        INSERT INTO notifications (user_id, type, title, content, is_read)
        VALUES (
          ${farmer.id}, 'verification', 'Profile Under Review', 
          'Your farmer profile is currently being reviewed by an admin. You will be notified once verified.', false
        )
      `;
    }
    console.log('🔔 Seeded Notifications.');
    console.log('🎉 Database seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();
