const auth = require("./auth");
const requests = require("./requests");
const router = require("express").Router();

router.use("/auth", auth);
router.use("/requests", requests);

module.exports = router;
