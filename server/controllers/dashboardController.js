import Company from "../models/Company.js";
import Deal from "../models/Deal.js";

export const getDashboardSummary = async (req, res) => {
  try {
    const totalCompanies = await Company.countDocuments({
      archived: false,
    });

    const activeDeals = await Deal.countDocuments({
      stage: { $nin: ["Won", "Lost"] },
    });

    const dealsByStage = await Deal.aggregate([
      {
        $group: {
          _id: "$stage",
          count: { $sum: 1 },
        },
      },
    ]);

    const totalDealValue = await Deal.aggregate([
      {
        $match: {
          stage: { $nin: ["Won", "Lost"] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$value" },
        },
      },
    ]);

    res.status(200).json({
        totalCompanies,
        activeDeals,
        dealsByStage,
        totalDealValue: totalDealValue[0]?.total ? totalDealValue[0].total.toString() : "0",
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch dashboard summary",
      error: error.message,
    });
  }
};