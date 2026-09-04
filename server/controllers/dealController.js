import Deal from "../models/Deal.js";
import Company from "../models/Company.js";
import DealHistory from "../models/DealHistory.js";
import User from "../models/User.js";

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

    if (
      req.user.role === "sales_rep" &&
      existingCompany.owner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Sales reps can only create deals for companies they own",
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
    await DealHistory.create({
      deal: deal._id,
      type: "created",
      performedBy: req.user._id,
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
      company,
      sortBy,
      sortOrder = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    // Sales managers can see all deals.
    // Sales reps can only see deals they own or collaborate on.
    const visibilityClause =
      req.user.role !== "sales_manager"
        ? {
            $or: [
              { owner: req.user._id },
              { collaborators: req.user._id },
            ],
          }
        : null;

    const andClauses = [];

    if (visibilityClause) {
      andClauses.push(visibilityClause);
    }

    // Search by deal title OR company name
    if (search) {
      const matchingCompanies = await Company.find({
        name: { $regex: search, $options: "i" },
      }).select("_id");

      const matchingCompanyIds = matchingCompanies.map(
        (company) => company._id
      );

      andClauses.push({
        $or: [
          { title: { $regex: search, $options: "i" } },
          { company: { $in: matchingCompanyIds } },
        ],
      });
    }

    // Stage filter
    if (stage) {
      andClauses.push({ stage });
    }

    // Company filter
    if (company) {
      andClauses.push({ company });
    }

    // Owner filter
    if (owner) {
      andClauses.push({ owner });
    }

    const filter =
      andClauses.length > 0
        ? { $and: andClauses }
        : {};

    // Allowed sorting fields
    const SORTABLE_FIELDS = {
      value: "value",
      expectedCloseDate: "expectedCloseDate",
      updatedAt: "updatedAt",
    };

    const sortField =
      SORTABLE_FIELDS[sortBy] || "createdAt";

    const sortDirection =
      sortOrder === "asc" ? 1 : -1;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const skip =
      (pageNumber - 1) * limitNumber;

    const deals = await Deal.find(filter)
      .populate("company", "name industry")
      .populate("owner", "name email")
      .sort({
        [sortField]: sortDirection,
      })
      .skip(skip)
      .limit(limitNumber);

    const total = await Deal.countDocuments(filter);

    res.status(200).json({
      deals,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(
          total / limitNumber
        ),
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

    const isOwner =
      deal.owner.toString() === req.user._id.toString();

    const isCollaborator = deal.collaborators.some(
      (collaboratorId) =>
        collaboratorId.toString() === req.user._id.toString()
    );

    if (
      req.user.role !== "sales_manager" &&
      !isOwner &&
      !isCollaborator
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

    const stages = [
      "New",
      "Qualified",
      "Proposal",
      "Negotiation",
      "Won",
      "Lost",
    ];

    const currentIndex = stages.indexOf(deal.stage);
    const newIndex = stages.indexOf(stage);

    if (newIndex === -1) {
      return res.status(400).json({
        message: "Invalid deal stage",
      });
    }

    if (deal.stage === "Won" || deal.stage === "Lost") {
      return res.status(400).json({
        message:
          "Closed deals cannot be changed. A sales manager must reopen the deal first.",
      });
    }

    if (deal.stage === stage) {
      return res.status(400).json({
        message: "Deal is already in this stage",
      });
    }

    if (newIndex > currentIndex) {
      if (newIndex !== currentIndex + 1) {
        return res.status(400).json({
          message: "Deal can only move forward by one stage at a time",
        });
      }
    }

    if (newIndex < currentIndex) {
      if (newIndex !== currentIndex - 1) {
        return res.status(400).json({
          message: "Deal can only move backward by one stage at a time",
        });
      }

      if (!reason || !reason.trim()) {
        return res.status(400).json({
          message: "A reason is required when moving a deal backward",
        });
      }
    }

    const oldStage = deal.stage;

    deal.previousStage = oldStage;
    deal.stage = stage;

    await deal.save();

    await DealHistory.create({
      deal: deal._id,
      type: "stage_change",
      oldStage,
      newStage: stage,
      reason: reason || null,
      performedBy: req.user._id,
    });

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

export const reopenDeal = async (req, res) => {
  try {
    const { id } = req.params;

    const deal = await Deal.findById(id);

    if (!deal) {
      return res.status(404).json({
        message: "Deal not found",
      });
    }

    if (req.user.role !== "sales_manager") {
      return res.status(403).json({
        message: "Only a sales manager can reopen a closed deal",
      });
    }

    if (deal.stage !== "Won" && deal.stage !== "Lost") {
      return res.status(400).json({
        message: "Only Won or Lost deals can be reopened",
      });
    }

    if (!deal.previousStage) {
      return res.status(400).json({
        message: "Previous stage is not available for this deal",
      });
    }

    const oldStage = deal.stage;
    const newStage = deal.previousStage;

    deal.stage = newStage;
    deal.previousStage = null;

    await deal.save();

    await DealHistory.create({
      deal: deal._id,
      type: "stage_change",
      oldStage,
      newStage,
      reason: "Deal reopened by sales manager",
      performedBy: req.user._id,
    });

    res.status(200).json({
      message: "Deal reopened successfully",
      deal,
      reopenedFrom: oldStage,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to reopen deal",
      error: error.message,
    });
  }
};

export const reassignDeal = async (req, res) => {
  try {
    const { id } = req.params;
    const { newOwnerId } = req.body;

    const deal = await Deal.findById(id);

    if (!deal) {
      return res.status(404).json({
        message: "Deal not found",
      });
    }

    if (req.user.role !== "sales_manager") {
      return res.status(403).json({
        message: "Only a sales manager can reassign a deal",
      });
    }

    if (!newOwnerId) {
      return res.status(400).json({
        message: "New owner ID is required",
      });
    }

    const newOwner = await User.findById(newOwnerId);

    if (!newOwner) {
      return res.status(404).json({
        message: "New owner not found",
      });
    }
    if (newOwner.role !== "sales_rep") {
      return res.status(400).json({
        message: "Deal owner must be a sales representative",
      });
    }

    if (deal.owner.toString() === newOwnerId.toString()) {
      return res.status(400).json({
        message: "Deal is already assigned to this user",
      });
    }

    const previousOwner = deal.owner;

    deal.owner = newOwnerId;

    await deal.save();

    await DealHistory.create({
      deal: deal._id,
      type: "owner_change",
      oldOwner: previousOwner,
      newOwner: newOwnerId,
      performedBy: req.user._id,
    });

    res.status(200).json({
      message: "Deal reassigned successfully",
      deal,
      previousOwner,
      newOwner: newOwnerId,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to reassign deal",
      error: error.message,
    });
  }
};

export const bulkReassignDeals = async (req, res) => {
  try {
    if (req.user.role !== "sales_manager") {
      return res.status(403).json({
        message: "Only a sales manager can bulk reassign deals",
      });
    }

    const { dealIds, newOwnerId } = req.body;

    if (!Array.isArray(dealIds) || dealIds.length === 0) {
      return res.status(400).json({
        message: "dealIds must be a non-empty array",
      });
    }

    if (!newOwnerId) {
      return res.status(400).json({
        message: "New owner ID is required",
      });
    }

    const newOwner = await User.findById(newOwnerId);

    if (!newOwner) {
      return res.status(404).json({
        message: "New owner not found",
      });
    }
    if (newOwner.role !== "sales_rep") {
      return res.status(400).json({
        message: "Deal owner must be a sales representative",
      });
    }

    const results = [];

    for (const dealId of dealIds) {
      try {
        const deal = await Deal.findById(dealId);

        if (!deal) {
          results.push({
            dealId,
            success: false,
            message: "Deal not found",
          });
          continue;
        }

        if (deal.owner.toString() === newOwnerId.toString()) {
          results.push({
            dealId,
            success: false,
            message: "Deal is already assigned to this user",
          });
          continue;
        }

        const previousOwner = deal.owner;

        deal.owner = newOwnerId;

        await deal.save();

        await DealHistory.create({
          deal: deal._id,
          type: "owner_change",
          oldOwner: previousOwner,
          newOwner: newOwnerId,
          performedBy: req.user._id,
        });

        results.push({
          dealId,
          success: true,
          message: "Deal reassigned successfully",
        });
      } catch (error) {
        results.push({
          dealId,
          success: false,
          message: error.message,
        });
      }
    }

    res.status(200).json({
      message: "Bulk reassignment completed",
      results,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to process bulk reassignment",
      error: error.message,
    });
  }
};

export const bulkAdvanceDeals = async (req, res) => {
  try {
    if (req.user.role !== "sales_manager") {
      return res.status(403).json({
        message: "Only a sales manager can bulk advance deals",
      });
    }

    const { dealIds } = req.body;

    if (!Array.isArray(dealIds) || dealIds.length === 0) {
      return res.status(400).json({
        message: "dealIds must be a non-empty array",
      });
    }

    const stages = [
      "New",
      "Qualified",
      "Proposal",
      "Negotiation",
      "Won",
      "Lost",
    ];

    const results = [];

    for (const dealId of dealIds) {
      try {
        const deal = await Deal.findById(dealId);

        if (!deal) {
          results.push({
            dealId,
            success: false,
            message: "Deal not found",
          });
          continue;
        }

        if (deal.stage === "Won" || deal.stage === "Lost") {
          results.push({
            dealId,
            success: false,
            message: "Closed deals cannot be advanced",
          });
          continue;
        }

        const currentIndex = stages.indexOf(deal.stage);

        if (currentIndex >= stages.indexOf("Negotiation")) {
          results.push({
            dealId,
            success: false,
            message: "Deal cannot be advanced further",
          });
          continue;
        }

        const oldStage = deal.stage;
        const newStage = stages[currentIndex + 1];

        deal.previousStage = oldStage;
        deal.stage = newStage;

        await deal.save();

        await DealHistory.create({
          deal: deal._id,
          type: "stage_change",
          oldStage,
          newStage,
          reason: "Bulk stage advancement by sales manager",
          performedBy: req.user._id,
        });

        results.push({
          dealId,
          success: true,
          oldStage,
          newStage,
          message: "Deal advanced successfully",
        });
      } catch (error) {
        results.push({
          dealId,
          success: false,
          message: error.message,
        });
      }
    }

    res.status(200).json({
      message: "Bulk advancement completed",
      results,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to process bulk advancement",
      error: error.message,
    });
  }
};

export const getDealHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const deal = await Deal.findById(id);

    if (!deal) {
      return res.status(404).json({
        message: "Deal not found",
      });
    }

    const isOwner =
      deal.owner.toString() === req.user._id.toString();

    const isCollaborator = deal.collaborators.some(
      (collaboratorId) =>
        collaboratorId.toString() === req.user._id.toString()
    );

    if (
      req.user.role !== "sales_manager" &&
      !isOwner &&
      !isCollaborator
    ) {
      return res.status(403).json({
        message: "You do not have permission to view this deal's history",
      });
    }

    const history = await DealHistory.find({ deal: id })
      .populate("performedBy", "name email role")
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

export const deleteDeal = async (req, res) => {
  try {
    const { id } = req.params;

    const deal = await Deal.findById(id);

    if (!deal) {
      return res.status(404).json({
        message: "Deal not found",
      });
    }

    if (
      req.user.role !== "sales_manager" &&
      deal.owner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "You do not have permission to delete this deal",
      });
    }

    await Deal.findByIdAndDelete(id);

    res.status(200).json({
      message: "Deal deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete deal",
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
    const collaborator = await User.findById(userId);

    if (!collaborator) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (collaborator.role !== "sales_rep") {
      return res.status(400).json({
        message: "Only sales representatives can be collaborators",
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

    const deal = await Deal.findById(id);

    if (!deal) {
      return res.status(404).json({
        message: "Deal not found",
      });
    }

    const isOwner =
      deal.owner.toString() === req.user._id.toString();

    const isCollaborator = deal.collaborators.some(
      (collaborator) =>
        collaborator.toString() === req.user._id.toString()
    );

    if (
      req.user.role !== "sales_manager" &&
      !isOwner &&
      !isCollaborator
    ) {
      return res.status(403).json({
        message: "You do not have permission to view collaborators",
      });
    }

    await deal.populate("collaborators", "name email role");

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
export const exportDealsCsv = async (req, res) => {
  try {
    const stageWeights = {
      New: 0.10,
      Qualified: 0.25,
      Proposal: 0.50,
      Negotiation: 0.75,
    };

    const visibilityFilter =
    req.user.role === "sales_manager"
      ? {}
      : {
          $or: [
            { owner: req.user._id },
            { collaborators: req.user._id },
          ],
        };
    const deals = await Deal.find({
      ...visibilityFilter,
      stage: {
        $nin: ["Won", "Lost"],
      },
    })
      .populate("company", "name")
      .populate("owner", "name email")
      .sort({ expectedCloseDate: 1 });

    const rows = deals.map((deal) => {
      const value = parseFloat(deal.value.toString());
      const weight = stageWeights[deal.stage] || 0;
      const weightedValue = value * weight;

      return {
        company: deal.company?.name || "",
        title: deal.title,
        stage: deal.stage,
        value,
        weightedValue,
      };
    });

    const csvHeader =
      "Company,Deal Title,Stage,Value,Stage-Weighted Value\n";

    const csvRows = rows
      .map(
        (row) =>
          `"${row.company.replace(/"/g, '""')}","${row.title.replace(
            /"/g,
            '""'
          )}","${row.stage}",${row.value},${row.weightedValue.toFixed(2)}`
      )
      .join("\n");

    const csv = csvHeader + csvRows;

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=deals-pipeline.csv"
    );

    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({
      message: "Failed to export deals",
      error: error.message,
    });
  }
};

export const addDealNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    if (!note || !note.trim()) {
      return res.status(400).json({
        message: "Note is required",
      });
    }

    const deal = await Deal.findById(id);

    if (!deal) {
      return res.status(404).json({
        message: "Deal not found",
      });
    }

    const isOwner =
      deal.owner.toString() === req.user._id.toString();

    const isCollaborator = deal.collaborators.some(
      (collaboratorId) =>
        collaboratorId.toString() === req.user._id.toString()
    );

    if (
      req.user.role !== "sales_manager" &&
      !isOwner &&
      !isCollaborator
    ) {
      return res.status(403).json({
        message: "You do not have permission to add a note",
      });
    }

    const history = await DealHistory.create({
      deal: deal._id,
      type: "note",
      note: note.trim(),
      performedBy: req.user._id,
    });

    res.status(201).json({
      message: "Note added successfully",
      history,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add note",
      error: error.message,
    });
  }
};