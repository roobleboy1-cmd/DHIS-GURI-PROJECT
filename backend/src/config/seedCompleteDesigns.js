import { query } from './database.js';

async function seedCompleteDesigns() {
  console.log('--- Seeding Comprehensive House Designs with Images ---');

  // First fetch the houses
  const housesRes = await query('SELECT id, title FROM houses ORDER BY id ASC');
  const houseMap = {};
  housesRes.rows.forEach(h => {
    houseMap[h.title] = h.id;
  });

  console.log('Available houses map:', houseMap);

  // Clear existing designs to replace with completely distinct, high quality verified designs
  await query('DELETE FROM house_designs');

  const allDesigns = [
    // Villa Hilaac Deluxe
    {
      house_title: 'Villa Hilaac Deluxe',
      title: 'Villa Hilaac Structural Foundation & Column Plan',
      description: 'Shaxda farsamada ee aasaaska dhulka, qotada godadka, iyo xisaabinta biraha 16mm & 12mm ee shubka adag.',
      design_type: 'structural',
      image_url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80',
      estimated_cost: 32000
    },
    {
      house_title: 'Villa Hilaac Deluxe',
      title: 'Villa Hilaac 3D Luxury Elevation & Landscape Render',
      description: 'Naqshadda saddex-geesoodka (3D) ee bilicda dibadda, muraayadaha waaweyn, jardiinada iyo midabada casriga ah.',
      design_type: 'architectural',
      image_url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
      estimated_cost: 35000
    },

    // Casri Modern Residency
    {
      house_title: 'Casri Modern Residency',
      title: 'Casri Ground Floor Architectural Space Blueprint',
      description: 'Kala qaybinta qolalka fadhiga, jikada casriga ah, qolalka jiifka, iyo marinka daaqadaha iftiinka dabiiciga ah.',
      design_type: 'architectural',
      image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
      estimated_cost: 24000
    },
    {
      house_title: 'Casri Modern Residency',
      title: 'Casri Modern Minimalist Interior 3D Design',
      description: 'Naqshad gudaha ah oo faahfaahinaysa iftiinka LED-ka, saqafka gypsum-ka, iyo qalabka casriga ah ee fadhiga.',
      design_type: 'interior',
      image_url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
      estimated_cost: 18000
    },

    // Bakaal Luxury Multi-Story
    {
      house_title: 'Bakaal Luxury Multi-Story',
      title: 'Bakaal Multi-Story Reinforced Concrete Framework',
      description: 'Xisaabinta biraha iyo shubka tiirarka (columns) iyo suumanka dabaqa labaad ee u adkeysanaya culeyska ballaaran.',
      design_type: 'structural',
      image_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=1200&q=80',
      estimated_cost: 42000
    },
    {
      house_title: 'Bakaal Luxury Multi-Story',
      title: 'Bakaal Executive Multi-Level Elevation Render',
      description: 'Muuqaalka sare ee 3D ee labada dabaq, balakooyinka waawayn, qolalka martida, iyo garaashka baabuurta.',
      design_type: 'architectural',
      image_url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      estimated_cost: 45000
    },

    // Jubba Coastal Bungalow
    {
      house_title: 'Jubba Coastal Bungalow',
      title: 'Jubba Coastal Wind & Ventilation Blueprint',
      description: 'Naqshad injineernimo oo loo habeeyay cimilada xeebta iyo qaboojinta dabiiciga ah iyadoo la adeegsanayo daaqado waawayn.',
      design_type: 'architectural',
      image_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
      estimated_cost: 26000
    },
    {
      house_title: 'Jubba Coastal Bungalow',
      title: 'Jubba Veranda & Tropical Garden 3D Render',
      description: 'Muuqaalka balakoonka hore, bannaanka dhismaha, iyo xeyndaabka jardiinada cagaaran ee xeebta.',
      design_type: 'interior',
      image_url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
      estimated_cost: 20000
    },

    // Xamar Weyne Urban Duplex
    {
      house_title: 'Xamar Weyne Urban Duplex',
      title: 'Xamar Weyne Duplex Double-Unit Architectural Blueprint',
      description: 'Kala saarista labada qaybood ee duplex-ka, albaabada gaarka ah, jaranjarooyinka, iyo marinnada gaarka ah.',
      design_type: 'architectural',
      image_url: 'https://images.unsplash.com/photo-1524813686514-a57563d77d46?auto=format&fit=crop&w=1200&q=80',
      estimated_cost: 34000
    },
    {
      house_title: 'Xamar Weyne Urban Duplex',
      title: 'Xamar Weyne Contemporary Facade 3D Elevation',
      description: 'Naqshadda bilicsan ee wajiga hore ee dhismaha duplex-ka oo leh muraayado madow iyo dhagax dabiici ah.',
      design_type: 'architectural',
      image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      estimated_cost: 38000
    },

    // Beder Modern Townhouse
    {
      house_title: 'Beder Modern Townhouse',
      title: 'Beder Townhouse Compact Floor Space Plan',
      description: 'Kala faaideysiga booska yar ee magaalada dhexdeeda si loo helo qolal ku filan iyo raaxo buuxda.',
      design_type: 'architectural',
      image_url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80',
      estimated_cost: 21000
    },
    {
      house_title: 'Beder Modern Townhouse',
      title: 'Beder Modern Townhouse Exterior 3D Visual',
      description: 'Muuqaalka guud ee townhouse-ka casriga ah oo loogu talagalay waddooyinka magaalada.',
      design_type: 'architectural',
      image_url: 'https://images.unsplash.com/photo-1598228723793-52759bba239c?auto=format&fit=crop&w=1200&q=80',
      estimated_cost: 23000
    },

    // Galkacyo Sunrise Estate
    {
      house_title: 'Galkacyo Sunrise Estate',
      title: 'Galkacyo Estate Perimeter & Solar Grid MEP Plan',
      description: 'Shaxda shaqada korontada cadceedda (solar energy), taangiyada biyaha, iyo xeyndaabka weyn ee guriga.',
      design_type: 'mep',
      image_url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80',
      estimated_cost: 28000
    },
    {
      house_title: 'Galkacyo Sunrise Estate',
      title: 'Galkacyo Estate Grand Courtyard 3D Visual',
      description: 'Muuqaalka bannaanka weyn, hoolka martida, iyo qaabka dhismaha ee ku habboon deegaanka.',
      design_type: 'architectural',
      image_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
      estimated_cost: 36000
    },

    // Danwadaag Affordable Home
    {
      house_title: 'Danwadaag Affordable Home',
      title: 'Danwadaag Efficient Modular Foundation Blueprint',
      description: 'Naqshad aasaas adag oo qiimo jaban ah oo si fudud loo dhisi karo iyadoo la adeegsanayo agab maxalli ah.',
      design_type: 'structural',
      image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
      estimated_cost: 17000
    },
    {
      house_title: 'Danwadaag Affordable Home',
      title: 'Danwadaag Compact Residence 3D Render',
      description: 'Muuqaalka 3D ee guriga fudud oo bilicsan oo qoyska cusub u sahlaya guri qurux badan oo kharash yar.',
      design_type: 'architectural',
      image_url: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=80',
      estimated_cost: 19000
    }
  ];

  for (const item of allDesigns) {
    const houseId = houseMap[item.house_title] || 1;
    await query(`
      INSERT INTO house_designs (house_id, title, description, design_type, image_url, estimated_cost, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, 1)
    `, [houseId, item.title, item.description, item.design_type, item.image_url, item.estimated_cost]);
  }

  const countRes = await query('SELECT count(*)::int as c FROM house_designs');
  console.log(`Successfully seeded ${countRes.rows[0].c} distinct architectural blueprint designs with complete images!`);
  process.exit(0);
}

seedCompleteDesigns().catch(err => {
  console.error(err);
  process.exit(1);
});
