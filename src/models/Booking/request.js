const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const requestSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  location: {
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
    string: {
      type: String,
      required: true,
    },
  },
  dateRange: {
    type: [String],
    required: true,
  },
  roomRequirements: {
    single: {
      type: Number,
    },
    double: {
      type: Number,
    },
    animalSupport: {
      type: Number,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  status: {
    type: String,
    default: "recieved",
    enum: ["recieved", "negotiating", "completed", "paymentVerified", "rejected"], 
  },
  offerings: {
    type: [Schema.Types.ObjectId],
    ref: "offering",
  },
  bookedOffering: {
    type: Schema.Types.ObjectId,
    ref: "offering",
  },
  paymentReceipt: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  updateRequested: {
    type: Boolean,
    default: false,
  },
});

const request = mongoose.model("request", requestSchema);

module.exports = request;
