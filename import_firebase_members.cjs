const admin = require('firebase-admin');
const { createClient } = require('@supabase/supabase-js');
const serviceAccount = require('./server/serviceAccountKey.json');

// Initialize Firebase Admin with seresponse-f4bb2 credentials
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// Initialize Supabase Admin
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hotnfgrqzgmnwzeedwar.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvdG5mZ3Jxemdtbnd6ZWVkd2FyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjY0MjU0NSwiZXhwIjoyMTAyMjE4NTQ1fQ.GVKn0Nru_CbDBwSUUu1oW6vlkRoS7lwniEy27TlgD-o';

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function runImport() {
  console.log('Fetching members from Firestore (seresponse-f4bb2)...');
  const snapshot = await db.collection('members').get();
  console.log(`Found ${snapshot.size} member records in Firebase.`);

  if (snapshot.empty) {
    console.log('No members found in Firebase.');
    return;
  }

  const records = [];

  snapshot.forEach(doc => {
    const d = doc.data();

    const record = {
      name: d.name || `${d.firstName || ''} ${d.lastName || ''}`.trim() || null,
      first_name: d.firstName || d.first_name || null,
      middle_name: d.middleName || d.middle_name || null,
      last_name: d.lastName || d.last_name || null,
      county: d.county || null,
      sub_county: d.subCounty || d.sub_county || null,
      crew: d.crew || d.crewDetails || null,
      blood_type: d.bloodType || d.blood_type || null,
      email: d.email ? String(d.email).trim().toLowerCase() : null,
      whatsapp: d.whatsapp ? String(d.whatsapp).trim() : null,
      phone: d.phone ? String(d.phone).trim() : null,
      id_number: d.idNumber || d.id_number ? String(d.idNumber || d.id_number).trim() : null,
      nationality: d.nationality || null,
      id_type: d.idType || d.id_type || null,
      flagged: !!d.flagged,
      flagged_by_email: d.flaggedByEmail || d.flagged_by_email || null,
      address_country: d.addressCountry || d.address_country || null,
      city: d.city || null,
      other_address_country: d.otherAddressCountry || d.other_address_country || null,
      other_city: d.otherCity || d.other_city || null,
      other_county: d.otherCounty || d.other_county || null,
      other_sub_county: d.otherSubCounty || d.other_sub_county || null,
      dob: d.dob || null,
      gender: d.gender || null,
      next_of_kin_name: d.nextOfKinName || d.next_of_kin_name || null,
      next_of_kin_phone: d.nextOfKinPhone || d.next_of_kin_phone || null,
      community_preparedness: d.communityPreparedness || d.community_preparedness || null,
      calendar_recommendations: d.calendarRecommendations || d.calendar_recommendations || null,
      member_goals: d.memberGoals || d.member_goals || null,
      is_scout: d.isScout !== undefined ? String(d.isScout) : null,
      education_level: d.educationLevel || d.education_level || null,
      trainings: Array.isArray(d.trainings) ? d.trainings : (d.trainings ? [String(d.trainings)] : []),
      certifications: Array.isArray(d.certifications) ? d.certifications : (d.certifications ? [String(d.certifications)] : []),
      availability: d.availability || null,
      willing_to_participate: d.willingToParticipate !== undefined ? String(d.willingToParticipate) : null,
      why_join: d.whyJoin || d.why_join || null,
      hope_to_contribute: d.hopeToContribute || d.hope_to_contribute || null,
      joined_whatsapp: d.joinedWhatsapp !== undefined ? !!d.joinedWhatsapp : null,
      declaration: d.declaration !== undefined ? !!d.declaration : null,
      created_at: d.createdAt ? (typeof d.createdAt.toDate === 'function' ? d.createdAt.toDate().toISOString() : String(d.createdAt)) : new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    records.push(record);
  });

  let successCount = 0;
  let errorCount = 0;

  // Insert in chunks of 50
  const chunkSize = 50;
  for (let i = 0; i < records.length; i += chunkSize) {
    const chunk = records.slice(i, i + chunkSize);
    const { data, error } = await supabaseAdmin.from('members').insert(chunk).select('id');
    
    if (error) {
      console.warn(`Chunk ${Math.floor(i / chunkSize) + 1} batch insert failed (${error.message}). Retrying individually...`);
      for (const rec of chunk) {
        const { error: singleErr } = await supabaseAdmin.from('members').insert([rec]);
        if (singleErr) {
          errorCount++;
          console.error(`Failed to insert member ${rec.email || rec.id_number || rec.name}:`, singleErr.message);
        } else {
          successCount++;
        }
      }
    } else {
      const count = data ? data.length : chunk.length;
      successCount += count;
      console.log(`Successfully imported chunk ${Math.floor(i / chunkSize) + 1} (${count} records).`);
    }
  }

  console.log(`\n========================================`);
  console.log(`MIGRATION FINISHED!`);
  console.log(`Total records in Firebase: ${snapshot.size}`);
  console.log(`Successfully imported to Supabase: ${successCount}`);
  console.log(`Failed insertions: ${errorCount}`);
  console.log(`========================================`);
}

runImport().catch(console.error);
