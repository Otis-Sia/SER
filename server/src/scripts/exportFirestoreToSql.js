import { db } from "../utils/firebase.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputPath = path.resolve(__dirname, "../../../import.sql");

function escapeSql(str) {
  if (str === null || str === undefined) return "NULL";
  if (typeof str === "boolean") return str ? "TRUE" : "FALSE";
  if (typeof str === "number") return str;
  
  let s = String(str).replace(/'/g, "''");
  if (s.includes('\n') || s.includes('\r')) {
    s = s.replace(/\n/g, '\\n').replace(/\r/g, '\\r');
    return "E'" + s + "'";
  }
  return "'" + s + "'";
}

async function exportToSql() {
  if (!db) {
    console.error("Firestore DB not initialized.");
    process.exit(1);
  }

  console.log("Exporting Firestore to SQL...");
  let sqlContent = "-- Firestore Dump\n\n";

  const collections = [
    { name: "products", table: "products", fields: ["id", "name", "priceKes", "imageUrl", "description", "featured", "createdAt", "updatedAt"], sqlFields: ["id", "name", "price_kes", "image_url", "description", "featured", "created_at", "updated_at"] },
    { name: "events", table: "events", fields: ["id", "title", "eventDate", "location", "description", "createdAt", "updatedAt"], sqlFields: ["id", "title", "event_date", "location", "description", "created_at", "updated_at"] },
    { name: "posts", table: "posts", fields: ["id", "title", "slug", "author", "cover_url", "body_md", "published", "published_at", "created_by_email", "hidden", "hiddenByEmail", "createdAt", "updatedAt"], sqlFields: ["id", "title", "slug", "author", "cover_url", "body_md", "published", "published_at", "created_by_email", "hidden", "hidden_by_email", "created_at", "updated_at"] },
    { name: "gallery", table: "gallery", fields: ["id", "title", "imageUrl", "alt", "description", "createdAt", "updatedAt"], sqlFields: ["id", "title", "image_url", "alt", "description", "created_at", "updated_at"] },
    { name: "faqs", table: "faqs", fields: ["id", "question", "answer", "order", "createdAt", "updatedAt"], sqlFields: ["id", "question", "answer", "sort_order", "created_at", "updated_at"] },
    { name: "projects", table: "projects", fields: ["id", "title", "focus", "description", "link", "linkText", "createdAt", "updatedAt"], sqlFields: ["id", "title", "focus", "description", "link", "link_text", "created_at", "updated_at"] },
    { name: "contacts", table: "contacts", fields: ["id", "type", "value", "order", "createdAt", "updatedAt"], sqlFields: ["id", "contact_type", "contact_value", "sort_order", "created_at", "updated_at"] },
    { name: "social_media", table: "social_media", fields: ["id", "platform", "type", "url", "createdAt", "updatedAt"], sqlFields: ["id", "platform", "media_type", "url", "created_at", "updated_at"] },
    { name: "users", table: "users", fields: ["id", "uid", "name", "email", "role", "createdAt", "updatedAt"], sqlFields: ["id", "uid", "full_name", "email", "role", "created_at", "updated_at"] },
    { name: "admin_users", table: "admin_users", fields: ["id", "uid", "email", "name", "role", "mustChangePassword", "flagged", "flaggedByEmail", "createdAt", "updatedAt"], sqlFields: ["id", "uid", "email", "name", "role", "must_change_password", "flagged", "flagged_by_email", "created_at", "updated_at"] },
    { name: "members", table: "members", fields: ["id", "name", "firstName", "middleName", "lastName", "county", "subCounty", "crew", "bloodType", "email", "whatsapp", "phone", "idNumber", "nationality", "idType", "flagged", "flaggedByEmail", "createdAt", "updatedAt"], sqlFields: ["id", "name", "first_name", "middle_name", "last_name", "county", "sub_county", "crew", "blood_type", "email", "whatsapp", "phone", "id_number", "nationality", "id_type", "flagged", "flagged_by_email", "created_at", "updated_at"] }
  ];

  for (const coll of collections) {
    const snapshot = await db.collection(coll.name).get();
    if (snapshot.empty) continue;
    
    sqlContent += `-- Data for ${coll.table}\n`;
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const idVal = doc.id;
      
      const cols = [];
      const vals = [];
      
      for (let i = 0; i < coll.fields.length; i++) {
        const field = coll.fields[i];
        const sqlField = coll.sqlFields[i];
        
        if (field === 'id') continue; 
        
        let val = data[field];
        if (val !== undefined) {
          cols.push(sqlField);
          vals.push(escapeSql(val));
        }
      }
      
      sqlContent += `INSERT INTO ${coll.table} (${cols.join(", ")}) VALUES (${vals.join(", ")});\n`;
    });
    sqlContent += "\n";
  }

  fs.writeFileSync(outputPath, sqlContent, "utf8");
  console.log(`Export completed: ${outputPath}`);
  process.exit(0);
}

exportToSql();
