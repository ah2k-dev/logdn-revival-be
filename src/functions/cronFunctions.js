const moment = require("moment");
const request = require("../models/Booking/request");
const previousStay = require("../models/Booking/previousStays");

const shiftPreviousStays = async () => {
  try {
    console.log("cron job started");
    
    const currentDate = new Date();
    
    const allStays = await request.find({
      status: "paymentVerified",
      isActive: true,
    });

    const onGoingStays = allStays.filter((stay) => {
        return moment(stay.dateRange[1]).isSameOrBefore(currentDate);
    });

    await previousStay.insertMany(
      onGoingStays.map((stay) => {
        return {
          request: stay._id,
          user: stay.user,
        };
      })
    );

    await request.updateMany(
      {
        _id: {
          $in: onGoingStays.map((stay) => stay._id),
        },
      },
      {
        $set: {
          isActive: false,
        },
      }
    );
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  shiftPreviousStays,
};
