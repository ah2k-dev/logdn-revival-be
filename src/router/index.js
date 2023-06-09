const auth = require("./auth");
const requests = require("./requests");
const booking = require("./booking");
const user = require("./user");
const router = require("express").Router();


router.use("/auth", auth);
router.use("/requests", requests);
router.use("/booking", booking);
router.use("/user", user);

module.exports = router;
