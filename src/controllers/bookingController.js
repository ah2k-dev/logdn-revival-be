const request = require("../models/Booking/request");
const requestUpdate = require("../models/Booking/requestUpdates");
const ErrorHandler = require("../utils/ErrorHandler");
const SuccessHandler = require("../utils/SuccessHandler");
const path = require("path");
const { ObjectId } = require("mongoose").Types;
const offering = require("../models/Booking/offering");

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
    const { requestId, dateRange, roomRequirements } = req.body;
    let filepath;
    if (req.files) {
      const { roaster } = req.files;
      // save file in files folder in project root directory
      filepath = `/files/${roaster.name}`;
      roaster.mv(path.join(__dirname, "../../files", roaster.name), (err) => {
        if (err) {
          console.error(err);
          return ErrorHandler(err.message, 500, req, res);
        }
      });
    }
    const exRequestUpdate = await requestUpdate.create({
      request: requestId,
      dateRange: JSON.parse(dateRange),
      roomRequirements: JSON.parse(roomRequirements),
      roaster: filepath ? filepath : null,
      user: req.user._id,
    });
    await request.findByIdAndUpdate(
      requestId,
      {
        $set: {
          updateRequested: true,
        },
      },
      { new: true }
    );
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
    const { id, status, rates } = req.body;
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
            // rates: rates
          },
        },
        { new: true }
      );
      const updatedOffering = await offering.findByIdAndUpdate(
        updatedRequest.bookedOffering,
        {
          $set: {
            rates: rates,
          },
        },
        { new: true }
      );
      console.log(updatedRequest);
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
  // #swagger.tags = ['booking']
  try {
    const user = req.user;
    if (user.role == "admin" || user.role == "moderator") {
      const updates = await requestUpdate.find({}).populate("request").sort({
        createdAt: -1,
      });
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
        .populate("request").sort({
          createdAt: -1,
        });
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
    const user = req.user;
    let response;
    if (user.role == "admin") {
      response = await request.aggregate([
        // Match only documents with a bookedOffering
        {
          $match: {
            bookedOffering: { $exists: true },
            // isActive: true,
            status: "paymentVerified",
            // user: ObjectId(user._id),
          },
        },
        {
          $project: {
            location: 1,
            dateRange: 1,
            bookedOffering: 1,
            user: 1,
          },
        },
        {
          $lookup: {
            from: "users",
            let: { userId: "$user" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$_id", "$$userId"],
                  },
                },
              },
            ],
            as: "user",
          },
        },
        // Lookup the bookedOffering document
        {
          $lookup: {
            from: "offerings",
            let: { bookedOfferingId: "$bookedOffering" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$_id", "$$bookedOfferingId"],
                  },
                },
              },
            ],
            as: "bookedOffering",
          },
        },
        // Unwind the bookedOffering array
        { $unwind: "$bookedOffering" },
        { $unwind: "$user" },
        // Project the desired fields
        {
          $project: {
            request: "$location.string",
            startDate: { $arrayElemAt: ["$dateRange", 0] },
            endDate: { $arrayElemAt: ["$dateRange", 1] },
            totalPaid: {
              $sum: [
                { $ifNull: ["$bookedOffering.rates.single", 0] },
                { $ifNull: ["$bookedOffering.rates.double", 0] },
                { $ifNull: ["$bookedOffering.rates.animalSupport", 0] },
              ],
            },
            paidPerSingle: { $ifNull: ["$bookedOffering.rates.single", null] },
            paidPerDouble: { $ifNull: ["$bookedOffering.rates.double", null] },
            paidPerAnimal: {
              $ifNull: ["$bookedOffering.rates.animalSupport", null],
            },
            user: "$user.name",
          },
        },
      ]);
    } else if (user.role == "user") {
      response = await request.aggregate([
        // Match only documents with a bookedOffering
        {
          $match: {
            bookedOffering: { $exists: true },
            // isActive: true,
            status: "paymentVerified",
            user: ObjectId(user._id),
          },
        },
        {
          $project: {
            location: 1,
            dateRange: 1,
            bookedOffering: 1,
          },
        },
        // Lookup the bookedOffering document
        {
          $lookup: {
            from: "offerings",
            let: { bookedOfferingId: "$bookedOffering" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$_id", "$$bookedOfferingId"],
                  },
                },
              },
            ],
            as: "bookedOffering",
          },
        },
        // Unwind the bookedOffering array
        { $unwind: "$bookedOffering" },
        // Project the desired fields
        {
          $project: {
            request: "$location.string",
            startDate: { $arrayElemAt: ["$dateRange", 0] },
            endDate: { $arrayElemAt: ["$dateRange", 1] },
            totalPaid: {
              $sum: [
                { $ifNull: ["$bookedOffering.rates.single", 0] },
                { $ifNull: ["$bookedOffering.rates.double", 0] },
                { $ifNull: ["$bookedOffering.rates.animalSupport", 0] },
              ],
            },
            paidPerSingle: { $ifNull: ["$bookedOffering.rates.single", null] },
            paidPerDouble: { $ifNull: ["$bookedOffering.rates.double", null] },
            paidPerAnimal: {
              $ifNull: ["$bookedOffering.rates.animalSupport", null],
            },
          },
        },
      ]);
      console.log(response);
    } else {
      return ErrorHandler("Invalid user", 400, req, res);
    }
    if (!response) {
      return ErrorHandler("No reports found", 400, req, res);
    }
    return SuccessHandler(
      { message: "Reports found successfully", response },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

module.exports = {
  bookOffer,
  requestBookingUpdate,
  approveRejctUpdate,
  getRequestUpdates,
  getReports,
};
