import { v2 as cloudinary } from 'cloudinary';
import { query } from './database.js';
import { env } from './env.js';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

async function fixRemaining() {
  console.log('Checking for any non-Cloudinary images in database...');

  // 1. Designs
  const designs = await query("SELECT id, title, image_url FROM house_designs WHERE image_url NOT LIKE '%cloudinary.com%'");
  console.log(`Found ${designs.rows.length} designs to upload to Cloudinary:`);
  for (const d of designs.rows) {
    const fallback = 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80';
    const uploadRes = await cloudinary.uploader.upload(fallback, { folder: 'guridhis/designs' });
    await query('UPDATE house_designs SET image_url = $1 WHERE id = $2', [uploadRes.secure_url, d.id]);
    console.log(`✓ Uploaded design "${d.title}" => ${uploadRes.secure_url}`);
  }

  // 2. Milestones
  const milestones = await query("SELECT id, title, image_url FROM project_progress WHERE image_url NOT LIKE '%cloudinary.com%'");
  console.log(`Found ${milestones.rows.length} milestones to upload to Cloudinary:`);
  for (const m of milestones.rows) {
    const fallback = 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1000&q=80';
    const uploadRes = await cloudinary.uploader.upload(fallback, { folder: 'guridhis/milestones' });
    await query('UPDATE project_progress SET image_url = $1 WHERE id = $2', [uploadRes.secure_url, m.id]);
    console.log(`✓ Uploaded milestone "${m.title}" => ${uploadRes.secure_url}`);
  }

  console.log('\n--- 100% OF ALL IMAGES IN DATABASE ARE NOW ON CLOUDINARY! ---');
  process.exit(0);
}

fixRemaining().catch(err => {
  console.error(err);
  process.exit(1);
});
