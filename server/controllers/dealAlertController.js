import DealAlert from "../models/DealAlert.js";
import Deal from "../models/Deal.js";

export const getDealAlerts = async (req, res) => {
  try {
    const alerts = await DealAlert.find({
      owner: req.user._id,
      dismissed: false,
    })
      .populate("deal", "title expectedCloseDate stage")
      .sort({ closeDate: 1 });

    res.status(200).json({
      alerts,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch deal alerts",
      error: error.message,
    });
  }
};

export const dismissDealAlert = async (req, res) => {
  try {
    const { id } = req.params;

    const alert = await DealAlert.findById(id);

    if (!alert) {
      return res.status(404).json({
        message: "Alert not found",
      });
    }

    // Only the alert owner can dismiss it
    if (alert.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You do not have permission to dismiss this alert",
      });
    }

    alert.dismissed = true;
    alert.dismissedAt = new Date();

    await alert.save();

    res.status(200).json({
      message: "Deal alert dismissed successfully",
      alert,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to dismiss deal alert",
      error: error.message,
    });
  }
};

export const generateDealAlerts = async (req, res) => {
  try {
    const now = new Date();

    // Deals closing within the next 3 days
    const alertDate = new Date();
    alertDate.setDate(alertDate.getDate() + 3);

    const deals = await Deal.find({
      expectedCloseDate: {
        $gte: now,
        $lte: alertDate,
      },
      stage: {
        $nin: ["Won", "Lost"],
      },
    });

    let createdAlerts = 0;

    for (const deal of deals) {
      const existingAlert = await DealAlert.findOne({
        deal: deal._id,
        dismissed: false,
      });

      if (!existingAlert) {
        await DealAlert.create({
          deal: deal._id,
          owner: deal.owner,
          closeDate: deal.expectedCloseDate,
        });

        createdAlerts++;
      }
    }

    res.status(200).json({
      message: "Deal alerts generated successfully",
      createdAlerts,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to generate deal alerts",
      error: error.message,
    });
  }
};