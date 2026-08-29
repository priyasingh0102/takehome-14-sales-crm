import mongoose from "mongoose";

const dealHistorySchema = new mongoose.Schema(
  {
    deal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Deal",
      required: true,
    },

    type: {
      type: String,
      enum: [
        "created",
        "stage_change",
        "owner_change",
        "note",
      ],
      required: true,
    },

    oldStage: {
      type: String,
      default: null,
    },

    newStage: {
      type: String,
      default: null,
    },

    reason: {
      type: String,
      default: null,
      trim: true,
    },

    oldOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    newOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    note: {
      type: String,
      default: null,
      trim: true,
    },

    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const DealHistory = mongoose.model(
  "DealHistory",
  dealHistorySchema
);

export default DealHistory;