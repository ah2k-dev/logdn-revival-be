const request = require("../models/Booking/request");
const ErrorHandler = require("../utils/ErrorHandler");

const bookOffer = async (req, res) => {
  // #swagger.tags = ['booking']
  try {
    const { request, offering } = req.body;
    const bookedReq = await request.findByIdAndUpdate(
      request,
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

module.exports = {
  bookOffer,
};
