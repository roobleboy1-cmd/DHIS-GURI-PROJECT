import { v2 as cloudinary } from 'cloudinary';
import { query } from './database.js';
import { env } from './env.js';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

async function migrateAllToCloudinary() {
  console.log('--- Migrating System Images to User Cloudinary Account (' + env.CLOUDINARY_CLOUD_NAME + ') ---');

  // 1. HOUSES
  console.log('1. Uploading house catalog photos to Cloudinary...');
  const houses = await query('SELECT id, title, image_url FROM houses WHERE image_url IS NOT NULL');
  for (const h of houses.rows) {
    if (h.image_url && !h.image_url.includes('res.cloudinary.com')) {
      try {
        console.log(` - Uploading house "${h.title}" to Cloudinary...`);
        const uploadRes = await cloudinary.uploader.upload(h.image_url, {
          folder: 'guridhis/houses',
          transformation: [{ quality: 'auto', fetch_format: 'auto' }]
        });
        await query('UPDATE houses SET image_url = $1 WHERE id = $2', [uploadRes.secure_url, h.id]);
        console.log(`   ✓ Saved Cloudinary URL: ${uploadRes.secure_url}`);
      } catch (err) {
        console.error(`   ✗ Failed to upload house ${h.id}:`, err.message);
      }
    }
  }

  // 2. HOUSE DESIGNS
  console.log('2. Uploading architectural blueprint designs to Cloudinary...');
  const designs = await query('SELECT id, title, image_url FROM house_designs WHERE image_url IS NOT NULL');
  for (const d of designs.rows) {
    if (d.image_url && !d.image_url.includes('res.cloudinary.com')) {
      try {
        console.log(` - Uploading design "${d.title}" to Cloudinary...`);
        const uploadRes = await cloudinary.uploader.upload(d.image_url, {
          folder: 'guridhis/designs',
          transformation: [{ quality: 'auto', fetch_format: 'auto' }]
        });
        await query('UPDATE house_designs SET image_url = $1 WHERE id = $2', [uploadRes.secure_url, d.id]);
        console.log(`   ✓ Saved Cloudinary URL: ${uploadRes.secure_url}`);
      } catch (err) {
        console.error(`   ✗ Failed to upload design ${d.id}:`, err.message);
      }
    }
  }

  // 3. USER AVATARS
  console.log('3. Uploading user and staff avatars to Cloudinary...');
  const users = await query('SELECT id, full_name, avatar_url FROM users WHERE avatar_url IS NOT NULL');
  for (const u of users.rows) {
    if (u.avatar_url && !u.avatar_url.includes('res.cloudinary.com')) {
      try {
        console.log(` - Uploading avatar for "${u.full_name}" to Cloudinary...`);
        const uploadRes = await cloudinary.uploader.upload(u.avatar_url, {
          folder: 'guridhis/avatars',
          transformation: [{ quality: 'auto', fetch_format: 'auto', width: 400, height: 400, crop: 'fill' }]
        });
        await query('UPDATE users SET avatar_url = $1 WHERE id = $2', [uploadRes.secure_url, u.id]);
        console.log(`   ✓ Saved Cloudinary URL: ${uploadRes.secure_url}`);
      } catch (err) {
        console.error(`   ✗ Failed to upload avatar for ${u.full_name}:`, err.message);
      }
    }
  }

  // 4. PROJECT MILESTONE PHOTOS
  console.log('4. Uploading construction milestone progress photos to Cloudinary...');
  const progress = await query('SELECT id, title, image_url FROM project_progress WHERE image_url IS NOT NULL');
  for (const p of progress.rows) {
    if (p.image_url && !p.image_url.includes('res.cloudinary.com')) {
      try {
        console.log(` - Uploading milestone "${p.title}" to Cloudinary...`);
        const uploadRes = await cloudinary.uploader.upload(p.image_url, {
          folder: 'guridhis/milestones',
          transformation: [{ quality: 'auto', fetch_format: 'auto' }]
        });
        await query('UPDATE project_progress SET image_url = $1 WHERE id = $2', [uploadRes.secure_url, p.id]);
        console.log(`   ✓ Saved Cloudinary URL: ${uploadRes.secure_url}`);
      } catch (err) {
        console.error(`   ✗ Failed to upload milestone ${p.id}:`, err.message);
      }
    }
  }

  // 5. PROJECT DOCUMENTS
  console.log('5. Uploading project document previews to Cloudinary...');
  const docs = await query('SELECT id, title, file_url FROM project_documents WHERE file_url IS NOT NULL');
  for (const doc of docs.rows) {
    if (doc.file_url && !doc.file_url.includes('res.cloudinary.com')) {
      try {
        console.log(` - Uploading document "${doc.title}" to Cloudinary...`);
        const uploadRes = await cloudinary.uploader.upload(doc.file_url, {
          folder: 'guridhis/documents',
          transformation: [{ quality: 'auto', fetch_format: 'auto' }]
        });
        await query('UPDATE project_documents SET file_url = $1 WHERE id = $2', [uploadRes.secure_url, doc.id]);
        console.log(`   ✓ Saved Cloudinary URL: ${uploadRes.secure_url}`);
      } catch (err) {
        console.error(`   ✗ Failed to upload document ${doc.id}:`, err.message);
      }
    }
  }

  console.log('\n--- ALL SYSTEM IMAGES SUCCESSFULLY SAVED TO CLOUDINARY ACCOUNT (vzhzosef)! ---');
  process.exit(0);
}

migrateAllToCloudinary().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
