require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

async function seed() {
  console.log("Seeding Database...");

  const timestamp = Date.now();

  const tables = {
    members: [
      {
        name: 'Jane Doe',
        first_name: 'Jane',
        last_name: 'Doe',
        email: `jane.doe.${timestamp}@example.com`,
        county: 'Nairobi',
        blood_type: 'O+',
        id_number: `ID-${timestamp}`,
        nationality: 'Kenyan',
        id_type: 'National ID'
      }
    ],
    admin_users: [
      {
        email: `admin.${timestamp}@example.com`,
        name: 'Super Admin',
        role: 'admin',
        must_change_password: true
      }
    ],
    events: [
      {
        title: 'Emergency Response Training',
        event_date: '2026-11-20',
        location: 'Nairobi Central',
        description: 'Basic first aid and CPR training.'
      }
    ],
    posts: [
      {
        title: 'The Importance of Preparedness',
        slug: `importance-of-preparedness-${timestamp}`,
        body_md: '# Preparedness\nAlways be ready for emergencies.',
        published: true,
        author: 'Admin'
      }
    ],
    projects: [
      {
        title: 'First Aid Outreach',
        focus: 'Community Health',
        description: 'Teaching first aid in schools.',
        link_text: 'Learn More'
      }
    ],
    products: [
      {
        name: 'Emergency Kit',
        price_kes: 2500,
        description: 'Comprehensive first aid kit.',
        featured: true
      }
    ],
    gallery: [
      {
        title: 'Training Day',
        image_url: 'https://via.placeholder.com/800x600.png?text=Training',
        description: 'Members practicing first aid.'
      }
    ],
    contacts: [
      {
        contact_type: 'Phone',
        contact_value: `+254700000000 ${timestamp}`,
        sort_order: 1
      }
    ],
    social_media: [
      {
        platform: 'Facebook',
        url: `https://facebook.com/example-${timestamp}`,
        media_type: 'Social Page'
      }
    ],
    faqs: [
      {
        question: `Who can join SER? (${timestamp})`,
        answer: 'Anyone with a passion for volunteering and emergency response.'
      }
    ],
    donations: [
      {
        tracking_id: `SEED-DONATION-${timestamp}`,
        merchant_reference: `SEED-REF-${timestamp}`,
        amount: 5000,
        currency: 'KES',
        status: 'COMPLETED',
        payment_method: 'M-PESA'
      }
    ]
  };

  for (const [table, data] of Object.entries(tables)) {
    console.log(`Seeding ${table}...`);
    const { error } = await supabase.from(table).insert(data);
    if (error) {
      console.error(`Error seeding ${table}:`, error.message);
    } else {
      console.log(`Successfully seeded ${table}`);
    }
  }

  console.log("Seeding complete!");
}

seed();
