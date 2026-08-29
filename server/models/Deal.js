import mongoose from "mongoose";

const dealSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    value: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
    },

    expectedCloseDate: {
      type: Date,
      required: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    stage: {
      type: String,
      enum: [
        "New",
        "Qualified",
        "Proposal",
        "Negotiation",
        "Won",
        "Lost",
      ],
      default: "New",
      required: true,
    },

    collaborators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    previousStage: {
      type: String,
      enum: [
        "New",
        "Qualified",
        "Proposal",
        "Negotiation",
      ],
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Deal = mongoose.model("Deal", dealSchema);

export default Deal;