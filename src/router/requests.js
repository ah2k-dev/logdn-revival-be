const router = require("express").Router();
const requests = require("../controllers/requestController");
const { isAuthenticated, adminAuth, userAuth } = require("../middleware/auth");

router.post("/create", isAuthenticated, userAuth, requests.createRequest);
router.get("/get", isAuthenticated, requests.getRequests);
router.get("/getOngoing", isAuthenticated, requests.getOngoingStays);
router.get("/getRejected", isAuthenticated, requests.getRejectedRequests);
router.get("/get/:id", isAuthenticated, requests.getRequest);
router.delete("/delete/:id", isAuthenticated, requests.deleteRequest);
router.put("/status/:id", isAuthenticated, adminAuth, requests.handleStatus);
router.get("/getPreviousStays", isAuthenticated, userAuth, requests.getPreviousStays);
router.put("/reject/:id", isAuthenticated, adminAuth, requests.rejectRequest);

module.exports = router;
