const Vault = require("../models/Vault");
const { encryptPassword } = require("../utils/encryption");
const generatePassword = require("../utils/passwordGenerator");
const checkPasswordStrength = require("../utils/passwordStrength");

// Add New Password
const addPassword = async (req, res) => {
  try {
    const { title, website, username, password, category, notes, favorite } =
      req.body;

    if (!website || !password) {
      return res.status(400).json({
        success: false,
        message: "Website and Password are required",
      });
    }

    // Encrypt password
    const encrypted = encryptPassword(password);

    // Save in DB
    const vault = await Vault.create({
      user: req.user._id,
      title,
      website,
      username,
      encryptedPassword: encrypted.encryptedData,
      iv: encrypted.iv,
      category,
      notes,
      favorite,
    });

    res.status(201).json({
      success: true,
      message: "Password saved successfully",
      vault,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const { decryptPassword } = require("../utils/encryption");

// Get All Passwords  (supports ?category=&sort=latest|az|oldest&search=)
const getPasswords = async (req, res) => {
  try {
    const { category, sort, search } = req.query;

    // Build base query
    const query = { user: req.user._id };

    // Category filter (case-insensitive)
    if (category && category !== "All Categories") {
      query.category = { $regex: new RegExp(`^${category}$`, "i") };
    }

    // Keyword search across title, username, website
    if (search && search.trim()) {
      const kw = search.trim();
      query.$or = [
        { title: { $regex: kw, $options: "i" } },
        { username: { $regex: kw, $options: "i" } },
        { website: { $regex: kw, $options: "i" } },
      ];
    }

    // Sort order
    let sortOrder = { createdAt: -1 }; // default: Latest
    if (sort === "az") sortOrder = { title: 1, website: 1 };
    if (sort === "oldest") sortOrder = { createdAt: 1 };

    const vaults = await Vault.find(query).sort(sortOrder);

    const decryptedVaults = vaults.map((item) => {
      const plainPassword = decryptPassword(item.encryptedPassword, item.iv);
      const strength = checkPasswordStrength(plainPassword);
      return {
        _id: item._id,
        title: item.title,
        website: item.website,
        username: item.username,
        password: plainPassword,
        category: item.category,
        notes: item.notes,
        favorite: item.favorite,
        strength,          // "Weak" | "Medium" | "Strong"
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      };
    });

    res.status(200).json({
      success: true,
      vaults: decryptedVaults,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updatePassword = async (req, res) => {
  try {
    const vault = await Vault.findById(req.params.id);

    if (!vault) {
      return res.status(404).json({
        success: false,
        message: "Password not found",
      });
    }

    // Check owner
    if (vault.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    const { title, website, username, password, category, notes, favorite } =
      req.body;

    if (password) {
      const encrypted = encryptPassword(password);
      vault.encryptedPassword = encrypted.encryptedData;
      vault.iv = encrypted.iv;
    }

    vault.title = title || vault.title;
    vault.website = website || vault.website;
    vault.username = username !== undefined ? username : vault.username;
    vault.category = category || vault.category;
    vault.notes = notes !== undefined ? notes : vault.notes;

    if (favorite !== undefined) {
      vault.favorite = favorite;
    }

    await vault.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Password
const deletePassword = async (req, res) => {
  try {
    const vault = await Vault.findById(req.params.id);

    if (!vault) {
      return res.status(404).json({
        success: false,
        message: "Password not found",
      });
    }

    // Check owner
    if (vault.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    await Vault.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Password deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Toggle Favorite
const toggleFavorite = async (req, res) => {
  try {
    const vault = await Vault.findById(req.params.id);

    if (!vault) {
      return res.status(404).json({
        success: false,
        message: "Password not found",
      });
    }

    // Check Owner
    if (vault.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: "Not Authorized",
      });
    }

    vault.favorite = !vault.favorite;

    await vault.save();

    res.status(200).json({
      success: true,
      message: "Favorite updated successfully",
      favorite: vault.favorite,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Search Passwords  (dedicated endpoint, also used by Dashboard)
const searchPasswords = async (req, res) => {
  try {
    const keyword = req.query.keyword || "";

    const vaults = await Vault.find({
      user: req.user._id,
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        { username: { $regex: keyword, $options: "i" } },
        { category: { $regex: keyword, $options: "i" } },
        { website: { $regex: keyword, $options: "i" } },
      ],
    }).sort({ createdAt: -1 });

    const data = vaults.map((item) => {
      const plainPassword = decryptPassword(item.encryptedPassword, item.iv);
      return {
        _id: item._id,
        title: item.title,
        website: item.website,
        username: item.username,
        password: plainPassword,
        category: item.category,
        notes: item.notes,
        favorite: item.favorite,
        strength: checkPasswordStrength(plainPassword),
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      };
    });

    res.status(200).json({
      success: true,
      vaults: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const generateStrongPassword = (req, res) => {
  try {
    const { length, uppercase, lowercase, numbers, symbols } = req.query;

    const password = generatePassword(
      Number(length) || 16,
      uppercase !== "false",
      lowercase !== "false",
      numbers !== "false",
      symbols !== "false",
    );

    res.status(200).json({
      success: true,
      password,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getSecurityStats = async (req, res) => {
  try {
    const vaults = await Vault.find({ user: req.user._id });

    let weak = 0;
    let medium = 0;
    let strong = 0;
    let favorites = 0;

    vaults.forEach((item) => {
      const password = decryptPassword(item.encryptedPassword, item.iv);

      const strength = checkPasswordStrength(password);

      if (strength === "Weak") weak++;
      else if (strength === "Medium") medium++;
      else strong++;

      if (item.favorite) favorites++;
    });

    const total = vaults.length;

    let score = 100;

    score -= weak * 15;
    score -= medium * 5;

    if (score < 0) score = 0;

    res.json({
      success: true,
      total,
      favorites,
      weak,
      medium,
      strong,
      securityScore: score,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = {
  addPassword,
  getPasswords,
  updatePassword,
  deletePassword,
  searchPasswords,
  toggleFavorite,
  generateStrongPassword,
  checkPasswordStrength,
  getSecurityStats,
};
