const request = require("../models/Booking/request");
const requestUpdate = require("../models/Booking/requestUpdates");
const ErrorHandler = require("../utils/ErrorHandler");
const SuccessHandler = require("../utils/SuccessHandler");

const bookOffer = async (req, res) => {
  // #swagger.tags = ['booking']
  try {
    const { requestId, offering } = req.body;
    const bookedReq = await request.findByIdAndUpdate(
      requestId,
      {
        // status: "payentVerified",
        bookedOffering: offering,
      },
      { new: true }
    );
    if (!bookedReq) {
      return ErrorHandler("Request not found", 400, req, res);
    }
    return SuccessHandler(
      { message: "Request booked successfully", bookedReq },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const requestBookingUpdate = async (req, res) => {
  // #swagger.tags = ['booking']
  try {
    const { request, dateRange, roomRequirements } = req.body;
    const exRequestUpdate = await requestUpdate.create({
      request,
      dateRange,
      roomRequirements,
    });
    if (!exRequestUpdate) {
      return ErrorHandler("Request not found", 400, req, res);
    }
    return SuccessHandler(
      { message: "Request updated successfully", exRequestUpdate },
      201,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const approveRejctUpdate = async (req, res) => {
  // #swagger.tags = ['booking']
  try {
    const { id, status } = req.body;
    const exRequestUpdate = await requestUpdate.findByIdAndUpdate(
      id,
      {
        $set: {
          status,
        },
      },
      { new: true }
    );
    if (!exRequestUpdate) {
      return ErrorHandler("Request not found", 400, req, res);
    }
    if (exRequestUpdate.status == "approved") {
      const updatedRequest = await request.findByIdAndUpdate(
        exRequestUpdate.request,
        {
          $set: {
            dateRange: exRequestUpdate.dateRange,
            roomRequirements: exRequestUpdate.roomRequirements,
          },
        },
        { new: true }
      );
      if (!updatedRequest) {
        return ErrorHandler("Request not found", 400, req, res);
      }
      return SuccessHandler(
        { message: "Request updated successfully", updatedRequest },
        201,
        res
      );
    } else {
      return SuccessHandler(
        { message: "Request rejected successfully", exRequestUpdate },
        201,
        res
      );
    }
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const getRequestUpdates = async (req, res) => {
  try {
    const user = req.user;
    if (user.role == "admin") {
      const updates = await requestUpdate.find({}).populate("request");
      if (!updates) {
        return ErrorHandler("No updates found", 400, req, res);
      }
      return SuccessHandler(
        { message: "Updates found successfully", updates },
        200,
        res
      );
    } else if (user.role == "user") {
      const updates = await requestUpdate
        .find({ user: user._id })
        .populate("request");
      if (!updates) {
        return ErrorHandler("No updates found", 400, req, res);
      }
      return SuccessHandler(
        { message: "Updates found successfully", updates },
        200,
        res
      );
    }
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const getReports = async (req, res) => {
  // #swagger.tags = ['booking']
  try {
    
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

module.exports = {
  bookOffer,
  requestBookingUpdate,
  approveRejctUpdate,
  getRequestUpdates,
};
