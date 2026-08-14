const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './server/.env' });

const supabaseUrl = process.env.SUPABASE_URL || 'https://hotnfgrqzgmnwzeedwar.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Service Role Key in .env');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('Starting seed process...');

  // 1. Seed Members (Sample)
  const members = [
    {
      id_number: '12345678',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      phone: '0712345678',
      whatsapp: '0712345678',
      county: 'Nairobi',
      sub_county: 'Westlands',
      blood_type: 'O+',
      crew: 'Eagle Patrol',
      status: 'pending'
    },
    {
      id_number: '87654321',
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane.smith@example.com',
      phone: '0798765432',
      whatsapp: '0798765432',
      county: 'Kiambu',
      sub_county: 'Thika',
      blood_type: 'A+',
      crew: 'Lion Patrol',
      status: 'approved'
    }
  ];
  
  for (const member of members) {
    const { error } = await supabaseAdmin.from('members').upsert(member, { onConflict: 'id_number' });
    if (error) console.log('Error seeding member:', error.message);
  }
  console.log('Seeded members');

  // 2. Seed Events
  const events = [
    {
      title: 'Annual Rescue Training',
      date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
      location: 'Nairobi National Park',
      description: 'Comprehensive rescue training for all members.',
      type: 'Training'
    },
    {
      title: 'Community Clean-up',
      date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
      location: 'Uhuru Park',
      description: 'Community service project to clean up the park.',
      type: 'Community Service'
    }
  ];

  for (const event of events) {
    const { error } = await supabaseAdmin.from('events').insert(event);
    if (error) console.log('Error seeding event:', error.message);
  }
  console.log('Seeded events');

  // 3. Seed Posts
  const posts = [
    {
      title: 'First Aid Tips for Hikers',
      slug: 'first-aid-tips-hikers',
      body_md: 'Always carry a well-stocked first aid kit...',
      author: 'Admin',
      published: true
    },
    {
      title: 'Recruitment Drive 2024',
      slug: 'recruitment-drive-2024',
      body_md: 'Join SER today and make a difference...',
      author: 'Admin',
      published: true
    }
  ];

  for (const post of posts) {
    const { error } = await supabaseAdmin.from('posts').upsert(post, { onConflict: 'slug' });
    if (error) console.log('Error seeding post:', error.message);
  }
  console.log('Seeded posts');

  // 4. Seed Products
  const products = [
    {
      name: 'SER Scout Uniform Shirt',
      description: 'Official SER Response scout uniform shirt, durable and comfortable.',
      price: 1500.00,
      image_url: 'https://via.placeholder.com/400x400?text=Scout+Shirt',
      stock: 50
    },
    {
      name: 'First Aid Kit (Standard)',
      description: 'Essential first aid supplies for field operations and camping.',
      price: 2500.00,
      image_url: 'https://via.placeholder.com/400x400?text=First+Aid+Kit',
      stock: 30
    }
  ];

  for (const product of products) {
    const { error } = await supabaseAdmin.from('products').insert(product);
    if (error) console.log('Error seeding product:', error.message);
  }
  console.log('Seeded products');

  // 5. Seed Gallery
  const galleryItems = [
    {
      title: 'Training Session 2024',
      image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
      description: 'Members practicing CPR techniques.'
    }
  ];

  for (const item of galleryItems) {
    const { error } = await supabaseAdmin.from('gallery').insert(item);
    if (error) console.log('Error seeding gallery:', error.message);
  }
  console.log('Seeded gallery');

  // 6. Seed FAQs
  const faqs = [
    {
      question: 'How do I join SER?',
      answer: 'You can join by filling out the online registration form on our Community page.'
    },
    {
      question: 'Is there a membership fee?',
      answer: 'Yes, an annual membership fee is required to maintain your active status.'
    }
  ];

  for (const faq of faqs) {
    const { error } = await supabaseAdmin.from('faqs').insert(faq);
    if (error) console.log('Error seeding faq:', error.message);
  }
  console.log('Seeded faqs');

  // 7. Seed Donations
  const donations = [
    {
      tracking_id: 'TEST-DONATION-001',
      merchant_reference: 'TEST-REF-001',
      amount: 1000,
      currency: 'KES',
      status: 'COMPLETED'
    },
    {
      tracking_id: 'TEST-DONATION-002',
      merchant_reference: 'TEST-REF-002',
      amount: 500,
      currency: 'USD',
      status: 'PENDING'
    }
  ];

  for (const donation of donations) {
    const { error } = await supabaseAdmin.from('donations').insert(donation);
    if (error) console.log('Error seeding donation:', error.message);
  }
  console.log('Seeded donations');

  console.log('Finished seeding process!');
}

seed().catch(console.error);
