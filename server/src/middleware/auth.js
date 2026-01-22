import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

    if (!token) return res.status(401).json({ error: "Missing token" });

    try {
        req.auth = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({ error: "Invalid token" });
    }
}

export function requireAdmin(req, res, next) {
    return requireAuth(req, res, () => {
        if (req.auth?.role !== "admin") {
            return res.status(403).json({ error: "Admin access required" });
        }
        next();
    });
}
