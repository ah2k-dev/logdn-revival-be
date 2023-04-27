const { isAuthenticated, userAuth, adminAuth } = require("../middleware/auth");
const bookingController = require("../controllers/bookingController.js");

const router = require("express").Router();

router.route('/bookOffer').post(isAuthenticated, userAuth, bookingController.bookOffer);
router.route('/requestUpdate').post(isAuthenticated, userAuth, bookingController.requestBookingUpdate);
router.route('/approveRejectUpdate').put(isAuthenticated, adminAuth, bookingController.approveRejctUpdate);
router.route('/getRequestUpdates').get(isAuthenticated, bookingController.getRequestUpdates);
router.route('/getReports').get(isAuthenticated, bookingController.getReports);

// router.route('/getReports').get(isAuthenticated, adminAuth, bookingController.getReports);



module.exports = router;