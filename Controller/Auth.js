const User = require("../Models/User");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");


// Load environment variables
dotenv.config();

// User registration
 const register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;    
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }
    const existingUser = await User.find({ email });
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Email already in use" });
    }
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const user = new User({ name, email, password_hash, phone, role });
    const savedUser = await user.save();
    res.status(201).json({ message: "User registered successfully", userId: savedUser._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// User login
 const login = async (req, res) => {
  try {
    const { email, password } = req.body;   
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }   
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } 
};

const forgotPassword = async (req, res) => {
  try {
    const {email} = req.body;
    const user = await User.findOne({ email });
    if(!user){
      return res.status(403).json({message:"Email not found"})
    }

    // Generate a 6-digit verification code
    const verificationCode = crypto.randomInt(100000, 999999).toString();

    // Save code and expiry to user (optional, if you want to verify later)
    user.resetCode = verificationCode;
    user.resetCodeExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    // Configure nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Your Password Reset Verification Code",
      text: `Your verification code is: ${verificationCode}`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Verification code sent to email" });

  }catch(err){
    res.status(500).json({ message: err.message });
  }
}

const resetPassword = async (req, res) => {
  try {
    const { code, newPassword } = req.body;
    if (!code || !newPassword) {
      return res.status(400).json({ message: "Code and new password are required" });
    }
    const user = await User.findOne({ resetCode: code, resetCodeExpiry: { $gt: Date.now() } });
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }
    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(newPassword, salt);
    user.resetCode = undefined;
    user.resetCodeExpiry = undefined;
    await user.save();
    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


 const verifyToken = (req, res, next) =>{
  const token = req.headers["authorization"]?.split(" ")[1]; // Bearer <token>
  if (!token) return res.status(403).json({ error: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Invalid token" });
      req.user = decoded; // attach user id to request
    next();
  });
}

const isAdmin = (req, res, next) => {
  if(req.user.role != "admin"){
    return res.status(401).json({error: "Contact the Administrator"})
  }
  next();
}

const isSeller = (req, res, next) => {
  if(req.user.role != "seller"){
    return res.status(401).json({error: "Contact the Administrator"})
  }
  next();
}

const isadminOrSeller = (req, res, next) => {
  if(req.user.role != "admin" && req.user.role != "seller") {
    return res.status(401).json({error: "Contact the Administrator"})
  }
  next();
}

module.exports = {
  register,
  login,
  verifyToken,
  isAdmin,
  isSeller,
  isadminOrSeller,
  forgotPassword,
  resetPassword
};
