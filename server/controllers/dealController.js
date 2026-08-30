import Deal from "../models/Deal.js";
import Company from "../models/Company.js";
import DealHistory from "../models/DealHistory.js";

export const createDeal = async (req, res) => {
  try {
    const {
      title,
      company,
      value,
      expectedCloseDate,
      stage,
    } = req.body;

    if (!title || !company || value === undefined || !expectedCloseDate) {
      return res.status(400).json({
        message: "Title, company, value and expected close date are required",
      });
    }

    const existingCompany = await Company.findById(company);

    if (!existingCompany || existingCompany.archived) {
      return res.status(404).json({
        message: "Company not found or is archived",
      });
    }

    const deal = await Deal.create({
      title,
      company,
      value,
      expectedCloseDate,
      stage: stage || "New",
      owner: req.user._id,
    });

    res.status(201).json({
      message: "Deal created successfully",
      deal,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create deal",
      error: error.message,
    });
  }
};

export const getDeals = async (req, res) => {
  try {
    const {
      search,
      stage,
      owner,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    if (search) {
      filter.title = {
        $regex: search,
        $options: "i",
      };
    }

    if (stage) {
      filter.stage = stage;
    }

    if (owner) {
      filter.owner = owner;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const deals = await Deal.find(filter)
      .populate("company", "name industry")
      .populate("owner", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Deal.countDocuments(filter);

    res.status(200).json({
      deals,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch deals",
      error: error.message,
    });
  }
};

export const updateDeal = async (req, res) => {
  try {
    const { id } = req.params;

    const deal = await Deal.findById(id);

    if (!deal) {
      return res.status(404).json({
        message: "Deal not found",
      });
    }

    // Only the owner or a sales manager can update the deal
    if (
      req.user.role !== "sales_manager" &&
      deal.owner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "You do not have permission to update this deal",
      });
    }

    const { title, value, expectedCloseDate } = req.body;

    if (title !== undefined) deal.title = title;
    if (value !== undefined) deal.value = value;
    if (expectedCloseDate !== undefined) {
      deal.expectedCloseDate = expectedCloseDate;
    }

    await deal.save();

    res.status(200).json({
      message: "Deal updated successfully",
      deal,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update deal",
      error: error.message,
    });
  }
};

export const updateDealStage = async (req, res) => {
  try {
    const { id } = req.params;
    const { stage, reason } = req.body;

    const deal = await Deal.findById(id);

    if (!deal) {
      return res.status(404).json({
        message: "Deal not found",
      });
    }

    // Only the owner or a sales manager can change the stage
    if (
      req.user.role !== "sales_manager" &&
      deal.owner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "You do not have permission to change this deal",
      });
    }

    const validStages = [
      "New",
      "Qualified",
      "Proposal",
      "Negotiation",
      "Won",
      "Lost",
    ];

    if (!validStages.includes(stage)) {
      return res.status(400).json({
        message: "Invalid deal stage",
      });
    }

    const currentStage = deal.stage;

    if (currentStage === stage) {
      return res.status(400).json({
        message: "Deal is already in this stage",
      });
    }

    const stageOrder = {
      New: 1,
      Qualified: 2,
      Proposal: 3,
      Negotiation: 4,
      Won: 5,
      Lost: 5,
    };

    const isBackwardTransition =
      stageOrder[stage] < stageOrder[currentStage];

    if (isBackwardTransition && !reason) {
      return res.status(400).json({
        message: "Reason is required for a backward stage transition",
      });
    }

    deal.stage = stage;

    await DealHistory.create({
        deal: deal._id,
        fromStage: currentStage,
        toStage: stage,
        changedBy: req.user._id,
        reason: reason || null,
    });
    
    await deal.save();

    res.status(200).json({
      message: "Deal stage updated successfully",
      deal,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update deal stage",
      error: error.message,
    });
  }
};

export const getDealHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const history = await DealHistory.find({ deal: id })
      .populate("changedBy", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      history,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch deal history",
      error: error.message,
    });
  }
};

export const addCollaborator = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const deal = await Deal.findById(id);

    if (!deal) {
      return res.status(404).json({
        message: "Deal not found",
      });
    }

    // Only owner or sales manager can add collaborators
    if (
      req.user.role !== "sales_manager" &&
      deal.owner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "You do not have permission to manage collaborators",
      });
    }

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }

    if (deal.collaborators.includes(userId)) {
      return res.status(400).json({
        message: "User is already a collaborator",
      });
    }

    deal.collaborators.push(userId);

    await deal.save();

    res.status(200).json({
      message: "Collaborator added successfully",
      deal,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add collaborator",
      error: error.message,
    });
  }
};

export const removeCollaborator = async (req, res) => {
  try {
    const { id, userId } = req.params;

    const deal = await Deal.findById(id);

    if (!deal) {
      return res.status(404).json({
        message: "Deal not found",
      });
    }

    // Only owner or sales manager can remove collaborators
    if (
      req.user.role !== "sales_manager" &&
      deal.owner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "You do not have permission to manage collaborators",
      });
    }

    const collaboratorExists = deal.collaborators.some(
      (collaborator) => collaborator.toString() === userId
    );

    if (!collaboratorExists) {
      return res.status(404).json({
        message: "Collaborator not found",
      });
    }

    deal.collaborators = deal.collaborators.filter(
      (collaborator) => collaborator.toString() !== userId
    );

    await deal.save();

    res.status(200).json({
      message: "Collaborator removed successfully",
      deal,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to remove collaborator",
      error: error.message,
    });
  }
};

export const getCollaborators = async (req, res) => {
  try {
    const { id } = req.params;

    const deal = await Deal.findById(id)
      .populate("collaborators", "name email role");

    if (!deal) {
      return res.status(404).json({
        message: "Deal not found",
      });
    }

    res.status(200).json({
      collaborators: deal.collaborators,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch collaborators",
      error: error.message,
    });
  }
};