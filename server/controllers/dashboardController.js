import Deal from "../models/Deal.js";

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
    const wonThisMonth = await Deal.countDocuments({
      ...visibilityFilter,
      stage: "Won",
      updatedAt: {
        $gte: startOfMonth,
        $lt: startOfNextMonth,
      },
    });

    // Lost this month
    const lostThisMonth = await Deal.countDocuments({
      ...visibilityFilter,
      stage: "Lost",
      updatedAt: {
        $gte: startOfMonth,
        $lt: startOfNextMonth,
      },
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

      const count = await Deal.countDocuments({
        ...visibilityFilter,
        stage: "Won",
        updatedAt: {
          $gte: weekStart,
          $lt: weekEnd,
        },
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