const express = require("express");
const { getActiveBanners, incrementClick } = require("../controllers/bannerController");

const router = express.Router();

router.get("/", getActiveBanners);
router.post("/:id/click", incrementClick);

module.exports = router;