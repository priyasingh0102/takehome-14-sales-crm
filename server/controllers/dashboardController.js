import Deal from "../models/Deal.js";
import DealHistory from "../models/DealHistory.js";

const stageWeights = {
  New: 0.10,
  Qualified: 0.25,
  Proposal: 0.50,
  Negotiation: 0.75,
};

export const getDashboard = async (req, res) => {
  try {
    // Managers can see all deals.
    // Sales reps can see deals they own or collaborate on.
    const visibilityFilter =
      req.user.role === "sales_manager"
        ? {}
        : {
            $or: [
              { owner: req.user._id },
              { collaborators: req.user._id },
            ],
          };

    // Open deals
    const openDeals = await Deal.find({
      ...visibilityFilter,
      stage: {
        $nin: ["Won", "Lost"],
      },
    })
      .populate("owner", "name email")
      .populate("company", "name");

    // Total open deals
    const openDealsCount = openDeals.length;

    // Weighted pipeline
    const weightedPipeline = openDeals.reduce((total, deal) => {
      const value = parseFloat(deal.value.toString());
      const weight = stageWeights[deal.stage] || 0;

      return total + value * weight;
    }, 0);

    // Current month boundaries
    const now = new Date();

    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    const startOfNextMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      1
    );

    // Won this month
    const wonHistory = await DealHistory.find({
      type: "stage_change",
      newStage: "Won",
      createdAt: {
        $gte: startOfMonth,
        $lt: startOfNextMonth,
      },
    }).select("deal");

    const wonDealIds = wonHistory.map((entry) => entry.deal);

    const wonThisMonth = await Deal.countDocuments({
      _id: { $in: wonDealIds },
      ...visibilityFilter,
    });

    // Lost this month
    const lostHistory = await DealHistory.find({
      type: "stage_change",
      newStage: "Lost",
      createdAt: {
        $gte: startOfMonth,
        $lt: startOfNextMonth,
      },
    }).select("deal");

    const lostDealIds = lostHistory.map((entry) => entry.deal);

    const lostThisMonth = await Deal.countDocuments({
      _id: { $in: lostDealIds },
      ...visibilityFilter,
    });

    // Open deals by stage
    const openDealsByStage = {};

    Object.keys(stageWeights).forEach((stage) => {
      openDealsByStage[stage] = 0;
    });

    openDeals.forEach((deal) => {
      if (openDealsByStage[deal.stage] !== undefined) {
        openDealsByStage[deal.stage]++;
      }
    });

    // Open deals by owner
    const openDealsByOwner = {};

    openDeals.forEach((deal) => {
      const ownerId = deal.owner?._id?.toString();

      if (!ownerId) {
        return;
      }

      if (!openDealsByOwner[ownerId]) {
        openDealsByOwner[ownerId] = {
          ownerId,
          ownerName: deal.owner.name,
          ownerEmail: deal.owner.email,
          count: 0,
        };
      }

      openDealsByOwner[ownerId].count++;
    });

    // Won deals per week for the last 8 weeks
    const wonPerWeek = [];

    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setHours(0, 0, 0, 0);
      weekStart.setDate(
        weekStart.getDate() - i * 7 - weekStart.getDay()
      );

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const weeklyWonHistory = await DealHistory.find({
        type: "stage_change",
        newStage: "Won",
        createdAt: {
          $gte: weekStart,
          $lt: weekEnd,
        },
      }).select("deal");

      const weeklyWonDealIds = weeklyWonHistory.map(
        (entry) => entry.deal
      );

      const count = await Deal.countDocuments({
        _id: { $in: weeklyWonDealIds },
        ...visibilityFilter,
      });

      wonPerWeek.push({
        weekStart,
        weekEnd,
        count,
      });
    }

    res.status(200).json({
      openDeals: openDealsCount,
      weightedPipeline: Number(weightedPipeline.toFixed(2)),
      wonThisMonth,
      lostThisMonth,
      openDealsByStage,
      openDealsByOwner: Object.values(openDealsByOwner),
      wonPerWeek,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch dashboard data",
      error: error.message,
    });
  }
};