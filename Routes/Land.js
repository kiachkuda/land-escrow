const Land = require("../Controller/Land");
const express = require("express");
const router = express.Router();



router.post("/", Land.createLand);
router.get("/", Land.getLands);
// router.get("/:id/land", Land.getLandById);
// router.put("/:id/land", Land.updateLand);
// router.delete("/delete/:id", Land.deleteLand);

module.exports = router;
