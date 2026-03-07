import mongoose from "mongoose";

const trekSlotSchema = new mongoose.Schema({

  trekId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Blog",
    required: true
  },

  date: {
    type: Date,
    required: true
  },

  totalSeats: {
    type: Number,
    required: true
  },

  bookedSeats: {
    type: Number,
    default: 0
  }

},{timestamps:true});

export default mongoose.model("TrekSlot", trekSlotSchema);