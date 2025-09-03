const Land = require("../Models/Land");
const User = require("../Models/User");


exports.createLand = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      size_acres,
      county,
      sub_county,
      lat,
      lng,
    } = req.body;

    const coordinates = {}

    // Basic validation
    if (!title || typeof title !== "string") {
        return res.status(400).json({ message: "Title is required and must be a string" });
    }

    if (!price || typeof Number(price) !== "number" || Number(price) <= 0) {
        return res.status(400).json({ message: "Price is required and must be a positive number" });
    }

    if (!size_acres || typeof Number(size_acres) !== "number" || Number(size_acres) <= 0) {
        return res.status(400).json({ message: "Size (acres) is required and must be a positive number" });
    }

    if ( !county) {
        return res.status(400).json({ message: "Location with county is required" });
    }

    if (lat && lng) {
        const { lat, lng } = coordinates;
        if (lat && (lat < -90 || lat > 90)) {
            return res.status(400).json({ message: "Latitude must be between -90 and 90" });
        }
        if (lng && (lng < -180 || lng > 180)) {
            return res.status(400).json({ message: "Longitude must be between -180 and 180" });
        }
    }

    // Collect uploaded files
    let images = [];
    let documents = {};

    if (req.files["images"]) {
      images = req.files["images"].map(file => file.path);
    }
    if (req.files["title_deed_copy"]) {
      documents.title_deed_copy = req.files["title_deed_copy"][0].path;
    }
    if (req.files["user_id_copy"]) {
      documents.user_id_copy = req.files["user_id_copy"][0].path;
    }

    const userId = req.body._id.toString(); // from verifyToken middleware
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User ID missing" });
    }
    // Check oif the user exist on the DB
    const userExist = await User.findById(userId);
    if (!userExist) {
      return res.status(404).json({ message: "User not found" });
    }

    const land = new Land({
      title,
      description,
      price,
      size_acres,
      location: {
        county,
        sub_county,
        coordinates: { lat, lng },
      },
      documents,
      images,
      owner_id: req.body._id, // authenticated user
    });

    const savedLand = await land.save();
    res.status(201).json(savedLand);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};




//  Get all land listings (with filters)
exports.getLands = async (req, res) => {
  try {
    const { county, min_price, max_price, status } = req.query;
    let filter = {};

    if (county) filter["location.county"] = county;
    if (status) filter.status = status;
    if (min_price || max_price) {
      filter.price = {};
      if (min_price) filter.price.$gte = Number(min_price);
      if (max_price) filter.price.$lte = Number(max_price);
    }

    const lands = await Land.find(filter).populate("owner_id", "name email phone");
    res.status(200).json(lands);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Get single land by ID
exports.getLandById = async (req, res) => {
  try {
    const land = await Land.findById(req.params.id).populate("owner_id", "name email phone");
    if (!land) return res.status(404).json({ message: "Land not found" });
    res.status(200).json(land);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Update land listing (owner only)
exports.updateLand = async (req, res) => {
  try {
    const land = await Land.findById(req.params.id);
    if (!land) return res.status(404).json({ message: "Land not found" });

     console.log(land.owner_id );

    // check if current user is the owner
    if (land.owner_id.toString() !== req.body._id ) {
      return res.status(403).json({ message: "Not authorized to update this land" });
    }
   
    Object.assign(land, req.body);
    const updatedLand = await land.save();
    res.status(200).json(updatedLand);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//  Delete land listing (owner only)
exports.deleteLand = async (req, res) => {
  try {
    const land = await Land.findById(req.params.id);
    if (!land) return res.status(404).json({ message: "Land not found" });

  
    await land.deleteOne();
    res.status(200).json({ message: "Land deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
