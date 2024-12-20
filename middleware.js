const jwt = require("jsonwebtoken");
const authorize = (role) => (req, res, next) => {
    if (req.user.role !== role) {
        return res.status(403).json({ error: "Access denied" });
    }
    next();
};

module.exports = authorize;

const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(403).json({ error: "Invalid token" });
    }
};

module.exports = authenticate;
