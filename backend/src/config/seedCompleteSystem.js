import bcrypt from 'bcryptjs';
import { query } from './database.js';

async function seedCompleteSystem() {
  console.log('--- Starting Complete GURI DHIS System Image & Data Population ---');

  const defaultPasswordHash = await bcrypt.hash('Worker@123', 10);
  const engineerPasswordHash = await bcrypt.hash('Engineer@123', 10);

  // 1. UPDATE EXISTING USERS AVATARS
  console.log('1. Updating existing users with professional avatars...');
  await query(`
    UPDATE users 
    SET avatar_url = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'
    WHERE role = 'admin';
  `);

  await query(`
    UPDATE users 
    SET avatar_url = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
    WHERE role = 'engineer' AND (email = 'primezaki@gmail.com' OR full_name ILIKE '%Mahdi%');
  `);

  await query(`
    UPDATE users 
    SET avatar_url = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80'
    WHERE role = 'client';
  `);

  // Update Eng Mahdi profile details if existing
  const engMahdiUser = await query("SELECT id FROM users WHERE email = 'primezaki@gmail.com' OR full_name ILIKE '%Mahdi%'");
  let engMahdiId = null;
  if (engMahdiUser.rows.length > 0) {
    engMahdiId = engMahdiUser.rows[0].id;
    await query(`
      INSERT INTO engineer_profiles (user_id, license_number, specialization, experience_years, bio, company_name, rating, total_reviews)
      VALUES ($1, 'SOM-ENG-2021-089', 'Structural & High-Rise Concrete Design', 8, 'Injineer dhismeed khibrad sare u leh dhismaha filooyinka casriga ah iyo daariha dhaadheer ee shubka xooggan.', 'Mahdi Structural Engineering & Consultancy', 4.90, 16)
      ON CONFLICT (user_id) DO UPDATE SET
        license_number = EXCLUDED.license_number,
        specialization = EXCLUDED.specialization,
        experience_years = EXCLUDED.experience_years,
        bio = EXCLUDED.bio,
        company_name = EXCLUDED.company_name,
        rating = EXCLUDED.rating,
        total_reviews = EXCLUDED.total_reviews;
    `, [engMahdiId]);
  }

  // 2. SEED ADDITIONAL CERTIFIED ENGINEERS
  console.log('2. Seeding additional licensed engineers...');
  const engineersData = [
    {
      email: 'fadumo.eng@guridhis.com',
      full_name: 'Eng. Fadumo Ali Shire',
      phone: '0615112233',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      license: 'SOM-ARC-2020-118',
      spec: 'Architectural Planning & Project Management',
      exp: 10,
      bio: 'Naqshadeeye dhismeed iyo maamulaha mashaariicda oo ku takhasustay filooyinka deegaanka iyo daariha casriga ah.',
      company: 'Somali Modern Architecture Ltd',
      rating: 4.95,
      reviews: 24
    },
    {
      email: 'mohamed.eng@guridhis.com',
      full_name: 'Eng. Mohamed Abdi Warsame',
      phone: '0615998877',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      license: 'SOM-CIV-2019-075',
      spec: 'Civil Infrastructure & Foundation Engineering',
      exp: 12,
      bio: 'Injineer madani ah oo ku takhasusay adkeynta aasaaska, biraha dhismaha, iyo shubka adag ee dhismaha.',
      company: 'Warsame Civil Contractors',
      rating: 4.85,
      reviews: 19
    }
  ];

  for (const eng of engineersData) {
    const existing = await query('SELECT id FROM users WHERE email = $1', [eng.email]);
    let uid = existing.rows[0]?.id;
    if (!uid) {
      const res = await query(
        `INSERT INTO users (email, password_hash, full_name, phone, role, avatar_url, is_active)
         VALUES ($1, $2, $3, $4, 'engineer', $5, true) RETURNING id`,
        [eng.email, engineerPasswordHash, eng.full_name, eng.phone, eng.avatar]
      );
      uid = res.rows[0].id;
    } else {
      await query('UPDATE users SET avatar_url = $1, full_name = $2 WHERE id = $3', [eng.avatar, eng.full_name, uid]);
    }

    await query(`
      INSERT INTO engineer_profiles (user_id, license_number, specialization, experience_years, bio, company_name, rating, total_reviews)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (user_id) DO UPDATE SET
        license_number = EXCLUDED.license_number,
        specialization = EXCLUDED.specialization,
        experience_years = EXCLUDED.experience_years,
        bio = EXCLUDED.bio,
        company_name = EXCLUDED.company_name,
        rating = EXCLUDED.rating,
        total_reviews = EXCLUDED.total_reviews;
    `, [uid, eng.license, eng.spec, eng.exp, eng.bio, eng.company, eng.rating, eng.reviews]);

    if (!engMahdiId) engMahdiId = uid;
  }

  // 3. SEED EXPERIENCED WORKERS
  console.log('3. Seeding certified construction workers...');
  const workersData = [
    {
      email: 'ali.worker@guridhis.com',
      full_name: 'Ali Omar Barre',
      phone: '0615443322',
      avatar: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80',
      skill: 'Master Masonry & Stone Work (Birjar & Dhagax)',
      exp: 9,
      rate: 35.00
    },
    {
      email: 'guled.worker@guridhis.com',
      full_name: 'Guled Hussein Jama',
      phone: '0615887766',
      avatar: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=400&q=80',
      skill: 'Electrical Installation & Solar Grid (Farsamoyahan Koronto)',
      exp: 7,
      rate: 40.00
    },
    {
      email: 'abdirahman.worker@guridhis.com',
      full_name: 'Abdirahman Yusuf Nur',
      phone: '0615332211',
      avatar: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80',
      skill: 'Plumbing & Drainage Engineering (Tuubiste Xirfadle)',
      exp: 6,
      rate: 30.00
    },
    {
      email: 'hassan.worker@guridhis.com',
      full_name: 'Hassan Farhan Duale',
      phone: '0615776655',
      avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=400&q=80',
      skill: 'Roof Truss, Roofing & Finish Carpentry (Najaar Sare)',
      exp: 8,
      rate: 35.00
    },
    {
      email: 'liban.worker@guridhis.com',
      full_name: 'Liban Farah Egal',
      phone: '0615223344',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      skill: 'Interior & Exterior Texture Painting (Rinjile Sare)',
      exp: 5,
      rate: 25.00
    }
  ];

  const createdWorkerIds = [];
  for (const w of workersData) {
    const existing = await query('SELECT id FROM users WHERE email = $1', [w.email]);
    let uid = existing.rows[0]?.id;
    if (!uid) {
      const res = await query(
        `INSERT INTO users (email, password_hash, full_name, phone, role, avatar_url, is_active)
         VALUES ($1, $2, $3, $4, 'worker', $5, true) RETURNING id`,
        [w.email, defaultPasswordHash, w.full_name, w.phone, w.avatar]
      );
      uid = res.rows[0].id;
    } else {
      await query('UPDATE users SET avatar_url = $1, full_name = $2 WHERE id = $3', [w.avatar, w.full_name, uid]);
    }

    await query(`
      INSERT INTO worker_profiles (user_id, engineer_id, skill, experience_years, daily_rate, availability_status)
      VALUES ($1, $2, $3, $4, $5, 'available')
      ON CONFLICT (user_id) DO UPDATE SET
        engineer_id = EXCLUDED.engineer_id,
        skill = EXCLUDED.skill,
        experience_years = EXCLUDED.experience_years,
        daily_rate = EXCLUDED.daily_rate;
    `, [uid, engMahdiId, w.skill, w.exp, w.rate]);

    createdWorkerIds.push(uid);
  }

  // 4. SEED COMPREHENSIVE HOUSE CATALOG (8 Real Models with Photos)
  console.log('4. Seeding full house catalog with verified photos...');
  const catalogHouses = [
    {
      title: 'Villa Hilaac Deluxe',
      description: 'Villa casri ah oo leh qolal ballaaran, jardiino gaar ah, baarkin baabuur, iyo dhisid xooggan oo shubka xooggan leh.',
      location: 'Mogadishu',
      bedrooms: 4,
      bathrooms: 3,
      area_sqm: 220,
      price: 65000,
      image_url: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
      featured: true
    },
    {
      title: 'Casri Modern Residency',
      description: 'Guri loogu talagalay qoysaska casriga ah oo leh naqshad furan, daaqado waawayn oo iftiin badan keenaya, iyo jiko casri ah.',
      location: 'Hargeisa',
      bedrooms: 3,
      bathrooms: 2,
      area_sqm: 160,
      price: 48000,
      image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      featured: true
    },
    {
      title: 'Bakaal Luxury Multi-Story',
      description: 'Villa laba dabaq ah oo leh qolal marti oo gooni ah, musqulo casri ah, qolka shaqaalaha, iyo balakoon weyn.',
      location: 'Garowe',
      bedrooms: 5,
      bathrooms: 4,
      area_sqm: 300,
      price: 85000,
      image_url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      featured: true
    },
    {
      title: 'Jubba Coastal Bungalow',
      description: 'Guri bungalow ah oo loogu talagalay cimilada xeebta, leh dabayl dabiici ah, jardiin ballaaran, iyo qalab tayo sare leh.',
      location: 'Kismayo',
      bedrooms: 3,
      bathrooms: 2,
      area_sqm: 175,
      price: 55000,
      image_url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
      featured: true
    },
    {
      title: 'Xamar Weyne Urban Duplex',
      description: 'Duplex laba qaybood ah oo ku habboon magaalooyinka waawayn, leh naqshad bilicsan, qolal jiif oo raaxo leh, iyo amni adag.',
      location: 'Mogadishu',
      bedrooms: 4,
      bathrooms: 3,
      area_sqm: 240,
      price: 72000,
      image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      featured: false
    },
    {
      title: 'Beder Modern Townhouse',
      description: 'Guri townhouse casri ah oo ku fiican qoysaska kobcaya, leh naqshad meel walba ka faaiidaysanaysa iyo agab adag.',
      location: 'Borama',
      bedrooms: 3,
      bathrooms: 2,
      area_sqm: 145,
      price: 42000,
      image_url: 'https://images.unsplash.com/photo-1598228723793-52759bba239c?auto=format&fit=crop&w=1200&q=80',
      featured: false
    },
    {
      title: 'Galkacyo Sunrise Estate',
      description: 'Guri ballaaran oo leh xeyndaab weyn, qolal marti oo sharfan, barkad biyood iyo nidaam koronto qoraxeed (solar system).',
      location: 'Galkacyo',
      bedrooms: 4,
      bathrooms: 3,
      area_sqm: 210,
      price: 68000,
      image_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
      featured: false
    },
    {
      title: 'Danwadaag Affordable Home',
      description: 'Guri qiimo jaban oo tayadiisu sarreyso, loogu talagalay dadka dhismaha cusub bilaabaya, leh shub adag iyo qolal ku filan.',
      location: 'Mogadishu',
      bedrooms: 2,
      bathrooms: 2,
      area_sqm: 110,
      price: 36000,
      image_url: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=80',
      featured: false
    }
  ];

  const createdHouseIds = [];
  for (const h of catalogHouses) {
    const existing = await query('SELECT id FROM houses WHERE title = $1', [h.title]);
    if (existing.rows.length > 0) {
      await query(`
        UPDATE houses 
        SET description = $1, location = $2, bedrooms = $3, bathrooms = $4, area_sqm = $5, price = $6, image_url = $7, featured = $8
        WHERE id = $9
      `, [h.description, h.location, h.bedrooms, h.bathrooms, h.area_sqm, h.price, h.image_url, h.featured, existing.rows[0].id]);
      createdHouseIds.push(existing.rows[0].id);
    } else {
      const res = await query(`
        INSERT INTO houses (title, description, location, bedrooms, bathrooms, area_sqm, price, image_url, status, featured, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'available', $9, 1)
        RETURNING id
      `, [h.title, h.description, h.location, h.bedrooms, h.bathrooms, h.area_sqm, h.price, h.image_url, h.featured]);
      createdHouseIds.push(res.rows[0].id);
    }
  }

  // 5. SEED HOUSE BLUEPRINTS & DESIGNS (6 Designs with Clear Visuals)
  console.log('5. Seeding architectural designs and blueprints...');
  const firstHouseId = createdHouseIds[0] || 1;
  const secondHouseId = createdHouseIds[1] || 2;

  const designsData = [
    {
      house_id: firstHouseId,
      title: 'Structural Foundation & Footing Plan',
      description: 'Qorshaha farsamada ee aasaaska dhulka, qotada godadka, iyo xisaabinta biraha 16mm & 12mm ee shubka adag.',
      design_type: 'structural',
      image_url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80',
      cost: 32000
    },
    {
      house_id: firstHouseId,
      title: '3D Exterior Elevation Render',
      description: 'Naqshadda saddex-geesoodka (3D) ee bilicda dibadda, muraayadaha waaweyn, iyo midabada casriga ah.',
      design_type: 'architectural',
      image_url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
      cost: 35000
    },
    {
      house_id: secondHouseId,
      title: 'Ground Floor Space & Layout Blueprint',
      description: 'Kala qaybinta qolalka fadhiga, jikada casriga ah, qolalka jiifka, iyo marinka daaqadaha dabiiciga ah.',
      design_type: 'architectural',
      image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
      cost: 26000
    },
    {
      house_id: firstHouseId,
      title: 'Reinforced Concrete Column Details',
      description: 'Faahfaahinta tiirarka shubka (columns), suumanka (tie-beams), iyo qaab-dhismeedka adag ee u adkeysanaya culeyska.',
      design_type: 'structural',
      image_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=1200&q=80',
      cost: 29000
    },
    {
      house_id: secondHouseId,
      title: 'Modern Interior Living & Dining 3D Layout',
      description: 'Naqshad gudaha ah oo faahfaahinaysa iftiinka LED-ka, saqafka gypsum-ka, iyo qalabka fadhiga qoyska.',
      design_type: 'interior',
      image_url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
      cost: 18000
    },
    {
      house_id: firstHouseId,
      title: 'Roof Truss & Drainage Engineering Layout',
      description: 'Naqshadda saqafka sare, biya-mareenada dhismaha, iyo xakamaynta biyaha roobka.',
      design_type: 'mep',
      image_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
      cost: 14000
    }
  ];

  for (const d of designsData) {
    const existing = await query('SELECT id FROM house_designs WHERE title = $1', [d.title]);
    if (existing.rows.length > 0) {
      await query(`
        UPDATE house_designs 
        SET image_url = $1, description = $2, estimated_cost = $3
        WHERE id = $4
      `, [d.image_url, d.description, d.cost, existing.rows[0].id]);
    } else {
      await query(`
        INSERT INTO house_designs (house_id, title, description, design_type, image_url, estimated_cost, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, 1)
      `, [d.house_id, d.title, d.description, d.design_type, d.image_url, d.cost]);
    }
  }

  // 6. SEED ACTIVE PROJECTS & PROGRESS MILESTONES (With Real On-Site Construction Photos!)
  console.log('6. Seeding active construction projects & real progress milestones...');
  const clientUser = await query("SELECT id FROM users WHERE role = 'client' LIMIT 1");
  const clientId = clientUser.rows[0]?.id || 34;

  const projectRes = await query(`
    INSERT INTO projects (engineer_id, client_id, title, description, location, budget, start_date, estimated_end_date, status, progress_percentage)
    VALUES 
    ($1, $2, 'Villa Hilaac Residential Construction', 'Dhismaha villa casri ah oo 4 qol ah, laba dabaq oo ku yaal degmada Hodan.', 'Mogadishu, Hodan', 65000, CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE + INTERVAL '90 days', 'in_progress', 65)
    ON CONFLICT DO NOTHING
    RETURNING id;
  `, [engMahdiId, clientId]);

  let projectId = projectRes.rows[0]?.id;
  if (!projectId) {
    const pExisting = await query("SELECT id FROM projects WHERE title ILIKE '%Villa Hilaac Residential%' LIMIT 1");
    projectId = pExisting.rows[0]?.id;
  }

  if (projectId) {
    // Assign workers to this project
    for (const wid of createdWorkerIds) {
      await query(`
        INSERT INTO project_workers (project_id, worker_id, role, status)
        VALUES ($1, $2, 'Site Specialist', 'active')
        ON CONFLICT (project_id, worker_id) DO NOTHING;
      `, [projectId, wid]);
    }

    // Insert 6 Step-by-Step Construction Progress Milestones with Real Photos
    const milestones = [
      {
        title: 'Heerka 1: Nadiifinta Goobta iyo Qodista Aasaaska (Excavation)',
        desc: 'Goobta dhismaha oo dhan waa la safeeyay, waxaana la qoday godadka aasaaska si waafaqsan cabbirkii injineerka.',
        pct: 15,
        img: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1000&q=80'
      },
      {
        title: 'Heerka 2: Shubka Aasaaska iyo Biraha 16mm (Foundation Pouring)',
        desc: 'Dhagaxa iyo shubka aasaaska (footing concrete) waa la shubay, waxaana la dhisay biraha tiirarka hoose.',
        pct: 30,
        img: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=1000&q=80'
      },
      {
        title: 'Heerka 3: Qotodhigga Tiirarka Shubka ah (Concrete Columns)',
        desc: 'Tiirarka shubka ah ee dabaqa koowaad ayaa la qotomiyay laguna xiray suunka dhulka (ground tie beams).',
        pct: 45,
        img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1000&q=80'
      },
      {
        title: 'Heerka 4: Dhisidda Darbiyada Dhagaxa/Bulkeetiga (Block Masonry)',
        desc: 'Darbiyada dibadda iyo qolalka hoose ayaa lagu dhisay bulkeeti adag, waxaana la saaray meelihii daaqadaha iyo albaabada.',
        pct: 65,
        img: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=1000&q=80'
      },
      {
        title: 'Heerka 5: Saqafka Sare iyo Xakamaynta Biyaha (Roof Slab & Waterproofing)',
        desc: 'Saqafka shubka sare waa la dhisay, waxaana lagu farsameeyay daaha biyaha celiya (waterproofing membrane).',
        pct: 80,
        img: 'https://images.unsplash.com/photo-1632759145351-1d592919f522?auto=format&fit=crop&w=1000&q=80'
      },
      {
        title: 'Heerka 6: Korantada, Dhuumaha iyo Malaasta (MEP & Plastering)',
        desc: 'Dhuumihii biyaha iyo tubada ayaa la galiyay derbiyada dhexdooda, waxaana hadda socota malaasta (plastering) iyo dhoobeynta.',
        pct: 90,
        img: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1000&q=80'
      }
    ];

    // Clear old progress for this project and re-seed
    await query('DELETE FROM project_progress WHERE project_id = $1', [projectId]);
    for (const m of milestones) {
      await query(`
        INSERT INTO project_progress (project_id, updated_by, title, description, progress_percentage, image_url)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [projectId, engMahdiId, m.title, m.desc, m.pct, m.img]);
    }

    // 7. SEED PROJECT DOCUMENTS WITH IMAGES
    console.log('7. Seeding official construction project documents...');
    const projectDocs = [
      {
        title: 'Municipal Building Construction Permit',
        type: 'permit',
        desc: 'Ruqsadda rasmiga ah ee dhismaha ee ka soo baxday dowladda hoose ee Muqdisho.',
        url: 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=800&q=80'
      },
      {
        title: 'Certified Structural Integrity Calculation Report',
        type: 'structural_report',
        desc: 'Xisaabaadka injineernimada ee culeyska shubka iyo adkeysiga dhulgariirka.',
        url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80'
      },
      {
        title: 'Architectural Working Drawings Set (DWG/PDF)',
        type: 'architectural_drawing',
        desc: 'Naqshadda dhameystiran ee dhismaha oo ay ku jiraan dhammaan cabbiraadaha qolalka.',
        url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80'
      },
      {
        title: 'Geotechnical Soil Bearing Capacity Report',
        type: 'soil_report',
        desc: 'Baaritaanka nooca carrada iyo awoodda ay u leedahay inay xamisho culeyska villa-da.',
        url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80'
      }
    ];

    await query('DELETE FROM project_documents WHERE project_id = $1', [projectId]);
    for (const doc of projectDocs) {
      await query(`
        INSERT INTO project_documents (project_id, uploaded_by, title, document_type, file_url, description, is_public)
        VALUES ($1, $2, $3, $4, $5, $6, true)
      `, [projectId, engMahdiId, doc.title, doc.type, doc.url, doc.desc]);
    }
  }

  // 8. SEED REVIEWS
  console.log('8. Seeding client reviews and ratings...');
  if (projectId && engMahdiId && clientId) {
    await query(`
      INSERT INTO reviews (project_id, reviewer_id, reviewee_id, rating, comment)
      VALUES 
      ($1, $2, $3, 5, 'Eng Mahdi waa injineer aad u karti badan oo shaqadiisa daacad u ah. Dhismaha wuxuu ku socdaa waqtigii loogu talagalay.')
      ON CONFLICT (project_id, reviewer_id) DO NOTHING;
    `, [projectId, clientId, engMahdiId]);
  }

  console.log('--- ALL SYSTEM IMAGES AND PROFESSIONAL DATA SEEDED SUCCESSFULLY! ---');
  process.exit(0);
}

seedCompleteSystem().catch(err => {
  console.error('Seed Error:', err);
  process.exit(1);
});
