const router = require("express").Router();
const user = require("../controllers/userController");
const { isAuthenticated, userAuth, adminAuth } = require("../middleware/auth");

//get
router.route("/").get(isAuthenticated, user.getUsers);
router.route("/me").get(isAuthenticated, userAuth, user.getMe);

//post
router.route("/createModerator").post(isAuthenticated, adminAuth, user.createModerator);

//put 
router.route("/updateMe").put(isAuthenticated, userAuth, user.updateMe);    
router.route('/blockUnblock').put(isAuthenticated, adminAuth, user.blockUnblock);
router.route('/updateModerator').put(isAuthenticated, adminAuth, user.updateModerator);


module.exports = router;