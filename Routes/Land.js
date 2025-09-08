const Land = require("../Controller/Land");
const express = require("express");

const { verifyToken, isAdmin, isSeller, isadminOrSeller} = require("../Controller/Auth");

const router = express.Router();

router.post("/", verifyToken, isadminOrSeller, Land.createLand);
router.get("/", Land.getLands);
router.get("/:id/", Land.getLandById);
router.put("/:id", verifyToken, isadminOrSeller, Land.updateLand);
router.delete("/:id", verifyToken, isAdmin, Land.deleteLand);

module.exports = router;
