

const jwt = require("jsonwebtoken");

// Middleware to check JWT
const jwtAuthMiddleware = (req, res, next) => {
    
  //first check request headers has authorization or not 
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Unauthorized, token missing" });
  }

  //extract the jwt token from the request headers
  const token = authHeader.split(" ")[1]; // Format: "Bearer <token>"
  if (!token) {
    return res.status(401).json({ error: "Unauthorized, token invalid" });
  }

  try {
    //verify the jwt
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "1234"); //verify jwt token
    req.user = decoded; // attach payload to request
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Invalid token" });
  }
};


// Function to generate token
const generateToken = (userData) => {
  //generate a new jwt token using user data
  return jwt.sign(userData, process.env.JWT_SECRET || "1234", { expiresIn: "1h" });
};

module.exports = { jwtAuthMiddleware, generateToken };
