const { isAuthenticated, userAuth } = require("../middleware/auth");
const bookingController = require("../controllers/bookingController.js");

const router = require("express").Router();

router.route('/bookOffer').post(isAuthenticated, userAuth, bookingController.bookOffer);


module.exports = router;