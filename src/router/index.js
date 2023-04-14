const auth = require("./auth");
const requests = require("./requests");
const booking = require("./booking");
const router = require("express").Router();


router.use("/auth", auth);
router.use("/requests", requests);
router.use("/booking", booking);

module.exports = router;
