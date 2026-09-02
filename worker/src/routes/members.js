import { Hono } from "hono";
import { getSupabase } from "../utils/supabase.js";

const members = new Hono();

// Public: submit membership application
members.post("/", async (c) => {
  const body = await c.req.json();
  const {
    first_name,
    middle_name,
    last_name,
    county,
    sub_county,
    crew,
    blood_type,
    email,
    whatsapp,
  } = body;

  if (
    !first_name ||
    !last_name ||
    !county ||
    !sub_county ||
    !crew ||
    !email ||
    !whatsapp
  ) {
    return c.json(
      {
        error:
          "first_name, last_name, county, sub_county, crew, email, and whatsapp are required",
      },
      400
    );
  }

  try {
    const supabase = getSupabase(c.env);
    const { data, error } = await supabase
      .from("members")
      .insert([
        {
          name: `${first_name} ${last_name}`,
          first_name,
          middle_name: middle_name || null,
          last_name,
          county,
          sub_county,
          crew,
          blood_type: blood_type || null,
          email,
          whatsapp,
        },
      ])
      .select()
      .single();

    if (error) {
      if (error.code === "23505" && error.message?.includes("email")) {
        return c.json(
          { error: "This email address is already registered." },
          409
        );
      }
      throw error;
    }

    return c.json(data, 201);
  } catch (err) {
    console.error("Failed to insert member:", err);
    return c.json(
      { error: "Internal server error. Please try again later." },
      500
    );
  }
});

// List all members
members.get("/", async (c) => {
  try {
    const supabase = getSupabase(c.env);
    const { data, error } = await supabase
      .from("members")
      .select(
        "id, first_name, middle_name, last_name, county, sub_county, crew, blood_type, email, whatsapp, created_at"
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    return c.json(data);
  } catch (err) {
    console.error("Failed to fetch members:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default members;
