const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const previousStaySchema = new Schema({
    request: {
        type: Schema.Types.ObjectId,
        ref: "request",
        required: true,
    },
    offering: {
        type: Schema.Types.ObjectId,
        ref: "offering",
        required: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
});

const previousStay = mongoose.model("previousStay", previousStaySchema);

module.exports = previousStay;