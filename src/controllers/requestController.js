const offering = require("../models/Booking/offering");
const request = require("../models/Booking/request");
const ErrorHandler = require("../utils/ErrorHandler");
const SuccessHandler = require("../utils/SuccessHandler");

const createRequest = async (req, res) => {
  // #swagger.tags = ['requests']
  try {
    const userId = req.user._id;
    const { location, dateRange, roomRequirements } = req.body;
    const request = await request.create({
      location,
      dateRange,
      roomRequirements,
      user: userId,
    });
    request.save();
    if (!request) {
      return ErrorHandler("Request not created", 400, req, res);
    }
    return SuccessHandler(
      { message: "Request created successfully", request },
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
    if (req.user.role == "admin") {
      const requests = await request.find({
        isActive: true,
        $where: "this.status != 'ongoing'",
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
      const requests = await request.find({
        user: userId,
        isActive: true,
        $where: "this.status != 'ongoing'",
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
    if (req.user.role == "admin") {
      const requests = await request.find({
        isActive: true,
        status: "ongoing",
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
      const requests = await request.find({
        user: userId,
        isActive: true,
        status: "ongoing",
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
    const request = await request.findById(id);
    if (!request) {
      return ErrorHandler("No request found", 400, req, res);
    }
    if(status == "completed"){
      const {offerings} = req.body;
      if(!offerings || offerings.length == 0){
        return ErrorHandler("No offerings provided", 400, req, res);
      }
      const newOfferings = await offering.insertMany(offerings);
      if(!newOfferings){
        return ErrorHandler("Offerings not created", 400, req, res);
      }
      request.offerings = newOfferings.map(val => val._id);
    }
    request.status = status;
    await request.save();
    return SuccessHandler(
      { message: "Request status updated successfully", request },
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
};
