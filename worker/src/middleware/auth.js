import jwt from "jsonwebtoken";

export async function requireAuth(c, next) {
  const authHeader = c.req.header("Authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return c.json({ error: "Missing token" }, 401);
  }

  const secret = c.env.JWT_SECRET || process.env.JWT_SECRET || "default-secret";

  try {
    const decoded = jwt.verify(token, secret);
    c.set("auth", decoded);
    await next();
  } catch {
    return c.json({ error: "Invalid token" }, 401);
  }
}

export async function requireAdmin(c, next) {
  return requireAuth(c, async () => {
    const auth = c.get("auth");
    const allowedRoles = ["admin", "event", "Author"];
    if (!allowedRoles.includes(auth?.role)) {
      return c.json({ error: "Admin access required" }, 403);
    }
    await next();
  });
}
