const router = require("express").Router();
const requests = require("../controllers/requestController");
const { isAuthenticated, adminAuth, userAuth } = require("../middleware/auth");

router.post("/create", isAuthenticated, userAuth, requests.createRequest);
router.get("/get", isAuthenticated, requests.getRequests);
router.get("/getOngoing", isAuthenticated, requests.getOngoingStays);
router.get("/get/:id", isAuthenticated, requests.getRequest);
// router.put("/update/:id", isAuthenticated, requests.updateRequest);
router.delete("/delete/:id", isAuthenticated, requests.deleteRequest);

router.put("/status/:id", isAuthenticated, adminAuth, requests.handleStatus);

router.get("/getPreviousStays", isAuthenticated, userAuth, requests.getPreviousStays);

module.exports = router;
