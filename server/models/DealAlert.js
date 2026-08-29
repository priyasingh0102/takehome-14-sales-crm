import mongoose from "mongoose";

const dealAlertSchema = new mongoose.Schema(
  {
    deal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Deal",
      required: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    closeDate: {
      type: Date,
      required: true,
    },

    dismissed: {
      type: Boolean,
      default: false,
    },

    dismissedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const DealAlert = mongoose.model("DealAlert", dealAlertSchema);

export default DealAlert;