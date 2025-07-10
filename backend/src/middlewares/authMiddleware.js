import jwt from "jsonwebtoken";
import User from "../models/User.js";


const authMiddleware = async (req, res, next) => {
  const token = req.headers.Authorization?.replace("Bearer", "");
  if (!token) {
    return res.status(401).json({ message: "Unauthorized Access" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    if(!user){
      return res.status(401).json({ message: "Invalid Token"});
    }
    req.user = user;
    next();
  } catch (error) {
    console.log("Authentication error", error)
    res.status(401).json({ message: "Invalid token" });
  }
};

export default authMiddleware;
