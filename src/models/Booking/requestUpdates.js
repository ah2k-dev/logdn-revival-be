const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const requestUpdateSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  request: {
    type: Schema.Types.ObjectId,
    ref: "request",
    required: true,
  },
//   location: {
//     lat: {
//       type: Number,
//       required: true,
//     },
//     lng: {
//       type: Number,
//       required: true,
//     },
//     string: {
//       type: String,
//       required: true,
//     },
//   },
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
    default: "pending",
    enum: ["pending", "approved", "rejected"],
  },
//   offerings: {
//     type: [Schema.Types.ObjectId],
//     ref: "offering",
//   },
//   bookedOffering: {
//     type: Schema.Types.ObjectId,
//     ref: "offering",
//   },
  isActive: {
    type: Boolean,
    default: true,
  },
  roaster: {
    type: String,
  }
});

const requestUpdate = mongoose.model("requestUpdate", requestUpdateSchema);

module.exports = requestUpdate;
