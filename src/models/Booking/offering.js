const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const offeringSchema = new Schema({
    images: {
        type: [String],
        // required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    rates: {
        single: {
            type: Number,
            required: true,
        },
        double: {
            type: Number,
            required: true,
        },
        animalSupport: {
            type: Number,
            required: true,
        },
    },
    paymentLink: {
        type: String,
        required: true,
    },
});

const offering = mongoose.model("offering", offeringSchema);
module.exports = offering;