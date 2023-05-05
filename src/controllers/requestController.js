const offering = require("../models/Booking/offering");
const previousStay = require("../models/Booking/previousStays");
const request = require("../models/Booking/request");
const ErrorHandler = require("../utils/ErrorHandler");
const SuccessHandler = require("../utils/SuccessHandler");

const createRequest = async (req, res) => {
  // #swagger.tags = ['requests']
  try {
    const userId = req.user._id;
    const { location, dateRange, roomRequirements } = req.body;
    const newrequest = await request.create({
      location,
      dateRange,
      roomRequirements,
      user: userId,
    });
    newrequest.save();
    if (!newrequest) {
      return ErrorHandler("Request not created", 400, req, res);
    }
    return SuccessHandler(
      { message: "Request created successfully", newrequest },
      201,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};
const getRequests = async (req, res) => {
  // #swagger.tags = ['requests']
  try {
    const userId = req.user._id;
    if (req.user.role == "admin" || req.user.role == "moderator") {
      const requests = await request
        .find({
          isActive: true,
          // $where: "this.status != 'ongoing'",
          // status: { $and: { $ne: "paymentVerified", $ne: "rejected" } },
          $and: [
            { status: { $ne: "paymentVerified" } },
            { status: { $ne: "rejected" } },
          ],
        })
        .populate("offerings")
        .populate("bookedOffering");
      if (!requests) {
        return ErrorHandler("No requests found", 400, req, res);
      }
      return SuccessHandler(
        { message: "Requests found successfully", requests },
        200,
        res
      );
    } else if (req.user.role == "user") {
      const requests = await request
        .find({
          user: userId,
          isActive: true,
          // $where: "this.status != 'ongoing'",
          // status: { $and: { $ne: "paymentVerified", $ne: "rejected" } },
          $and: [
            { status: { $ne: "paymentVerified" } },
            { status: { $ne: "rejected" } },
          ],
        })
        .populate("offerings")
        .populate("bookedOffering")
        .sort({
          createdAt: -1,
        });
      if (!requests) {
        return ErrorHandler("No requests found", 400, req, res);
      }
      return SuccessHandler(
        { message: "Requests found successfully", requests },
        200,
        res
      );
    } else {
      return ErrorHandler("Invalid user role", 400, req, res);
    }
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};
const getOngoingStays = async (req, res) => {
  // #swagger.tags = ['requests']
  try {
    const userId = req.user._id;
    if (req.user.role == "admin" || req.user.role == "moderator") {
      const requests = await request
        .find({
          isActive: true,
          status: "paymentVerified",
        })
        .populate("offerings")
        .populate("bookedOffering")
        .sort({
          createdAt: -1,
        });
      if (!requests) {
        return ErrorHandler("No requests found", 400, req, res);
      }
      return SuccessHandler(
        { message: "Requests found successfully", requests },
        200,
        res
      );
    } else if (req.user.role == "user") {
      const requests = await request
        .find({
          user: userId,
          isActive: true,
          status: "paymentVerified",
        })
        .populate("offerings")
        .populate("bookedOffering")
        .sort({
          createdAt: -1,
        });
      if (!requests) {
        return ErrorHandler("No requests found", 400, req, res);
      }
      return SuccessHandler(
        { message: "Requests found successfully", requests },
        200,
        res
      );
    } else {
      return ErrorHandler("Invalid user role", 400, req, res);
    }
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};
const getRequest = async (req, res) => {
  // #swagger.tags = ['requests']
  try {
    const { id } = req.params;
    const request = request.findById(id).populate("user");
    if (!request) {
      return ErrorHandler("No request found", 400, req, res);
    }
    return SuccessHandler(
      { message: "Request found successfully", request },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};
const updateRequest = async (req, res) => {
  // #swagger.tags = ['requests']
  try {
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};
const deleteRequest = async (req, res) => {
  // #swagger.tags = ['requests']
  try {
    const { id } = req.params;
    const request = await request.findById(id);
    if (!request) {
      return ErrorHandler("No request found", 400, req, res);
    }
    request.isActive = false;
    request.save();
    return SuccessHandler(
      { message: "Request deleted successfully", request },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};
const handleStatus = async (req, res) => {
  // #swagger.tags = ['requests']
  // #swagger.description = 'Handles the status of a request and when completed, creates offerings'
  try {
    const { id } = req.params;
    const { status } = req.body;
    const newReuest = await request.findById(id);
    if (!newReuest) {
      return ErrorHandler("No newReuest found", 400, req, res);
    }
    if (status == "completed") {
      const { offerings } = req.body;
      if (!offerings || offerings.length == 0) {
        return ErrorHandler("No offerings provided", 400, req, res);
      }
      const newOfferings = await offering.insertMany(offerings);
      if (!newOfferings) {
        return ErrorHandler("Offerings not created", 400, req, res);
      }
      if (newReuest.offerings && newReuest.offerings.length > 0) {
        newReuest.offerings = [
          ...newReuest.offerings,
          ...newOfferings.map((val) => val._id),
        ];
      } else {
        newReuest.offerings = newOfferings.map((val) => val._id);
      }
    }
    newReuest.status = status;
    await newReuest.save();
    return SuccessHandler(
      { message: "Request status updated successfully", newReuest },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const getPreviousStays = async (req, res) => {
  // #swagger.tags = ['requests']
  try {
    const userId = req.user._id;
    const stays = await previousStay
      .find({
        user: userId,
      })
      .populate("user")
      // .populate("offerings")
      // .populate("bookedOffering");
      .populate({
        path: "request",
        populate: {
          path: "bookedOffering",
        },
      });
    if (!stays) {
      return ErrorHandler("No stays found", 400, req, res);
    }

    return SuccessHandler(
      { message: "Stays found successfully", stays },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const rejectRequest = async (req, res) => {
  // #swagger.tags = ['requests']
  try {
    const { id } = req.params;
    const exRequest = await request.findByIdAndUpdate(
      id,
      { status: "rejected" },
      { new: true }
    );
    if (!exRequest) {
      return ErrorHandler("No request found", 400, req, res);
    }
    return SuccessHandler(
      { message: "Request rejected successfully", exRequest },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const getRejectedRequests = async (req, res) => {
  // #swagger.tags = ['requests']
  try {
    const userId = req.user._id;
    if (req.user.role == "admin") {
      const requests = await request

        .find({
          isActive: true,
          status: "rejected",
        })
        .populate("offerings")
        .populate("bookedOffering")
        .sort({
          createdAt: -1,
        });
      if (!requests) {
        return ErrorHandler("No requests found", 400, req, res);
      }
      return SuccessHandler(
        { message: "Requests found successfully", requests },
        200,
        res
      );
    } else if (req.user.role == "user") {
      const requests = await request

        .find({
          user: userId,
          isActive: true,
          status: "rejected",
        })
        .populate("offerings")
        .populate("bookedOffering")
        .sort({
          createdAt: -1,
        });
      if (!requests) {
        return ErrorHandler("No requests found", 400, req, res);
      }
      return SuccessHandler(
        { message: "Requests found successfully", requests },
        200,
        res
      );
    } else {
      return ErrorHandler("Invalid user role", 400, req, res);
    }
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const updateOffer = async (req, res) => {
  // swagger.tags = ['request']
  try {
    const { id } = req.params;
    const { images, title, description, rates, paymentLink, flag } = req.body;
    const exOffer = await offering.findByIdAndUpdate(
      id,
      { images, title, description, rates, paymentLink, flag },
      { new: true }
    );
    if (!exOffer) {
      return ErrorHandler(error.message, 500, req, res);
    }
    return SuccessHandler(
      { message: "Offer updated successfully", exOffer },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

module.exports = {
  createRequest,
  getRequests,
  getRequest,
  updateRequest,
  deleteRequest,
  getOngoingStays,
  handleStatus,
  getPreviousStays,
  rejectRequest,
  getRejectedRequests,
  updateOffer,
};
