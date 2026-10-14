import { query } from './database.js';

async function updateAndSeedHouses() {
  console.log('Seeding and updating houses with high quality architectural imagery...');

  // Update existing houses with rich images
  await query(`
    UPDATE houses 
    SET image_url = 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80'
    WHERE id = 1 OR title ILIKE '%Villa Hilaac%';
  `);

  await query(`
    UPDATE houses 
    SET image_url = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
    WHERE id = 2 OR title ILIKE '%Casri Modern%';
  `);

  await query(`
    UPDATE houses 
    SET image_url = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'
    WHERE id = 3 OR title ILIKE '%Bakaal Luxury%';
  `);

  // Update designs with blueprint renders
  await query(`
    UPDATE house_designs 
    SET image_url = 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80'
    WHERE id = 1 OR title ILIKE '%Structural%';
  `);

  await query(`
    UPDATE house_designs 
    SET image_url = 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=1200&q=80'
    WHERE id = 2 OR title ILIKE '%Architectural%';
  `);

  const updatedHouses = await query('SELECT id, title, image_url FROM houses ORDER BY id ASC');
  console.log('Updated houses in database:', updatedHouses.rows);

  process.exit(0);
}

updateAndSeedHouses().catch(err => {
  console.error(err);
  process.exit(1);
});
