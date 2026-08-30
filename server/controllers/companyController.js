import Company from "../models/Company.js";

export const createCompany = async (req, res) => {
  try {
    const { name, industry, website } = req.body;

    if (!name || !industry) {
      return res.status(400).json({
        message: "Name and industry are required",
      });
    }

    const company = await Company.create({
      name,
      industry,
      website,
      owner: req.user._id,
    });

    res.status(201).json({
      message: "Company created successfully",
      company,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create company",
      error: error.message,
    });
  }
};

export const getCompanies = async (req, res) => {
  try {
    const { search } = req.query;

    const filter = {
      archived: false,
    };

    if (search) {
      filter.name = {
        $regex: search,
        $options: "i",
      };
    }

    const companies = await Company.find(filter)
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      companies,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch companies",
      error: error.message,
    });
  }
};

export const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, industry, website } = req.body;

    const company = await Company.findById(id);

    if (!company) {
      return res.status(404).json({
        message: "Company not found",
      });
    }

    // Only the owner or a sales manager can edit the company
    if (
      req.user.role !== "sales_manager" &&
      company.owner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "You do not have permission to edit this company",
      });
    }

    if (name !== undefined) company.name = name;
    if (industry !== undefined) company.industry = industry;
    if (website !== undefined) company.website = website;

    await company.save();

    res.status(200).json({
      message: "Company updated successfully",
      company,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update company",
      error: error.message,
    });
  }
};

export const archiveCompany = async (req, res) => {
  try {
    const { id } = req.params;

    const company = await Company.findById(id);

    if (!company) {
      return res.status(404).json({
        message: "Company not found",
      });
    }

    // Only the owner or a sales manager can archive the company
    if (
      req.user.role !== "sales_manager" &&
      company.owner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "You do not have permission to archive this company",
      });
    }

    company.archived = true;

    await company.save();

    res.status(200).json({
      message: "Company archived successfully",
      company,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to archive company",
      error: error.message,
    });
  }
};

export const restoreCompany = async (req, res) => {
  try {
    const { id } = req.params;

    const company = await Company.findById(id);

    if (!company) {
      return res.status(404).json({
        message: "Company not found",
      });
    }

    // Only the owner or a sales manager can restore the company
    if (
      req.user.role !== "sales_manager" &&
      company.owner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "You do not have permission to restore this company",
      });
    }

    company.archived = false;

    await company.save();

    res.status(200).json({
      message: "Company restored successfully",
      company,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to restore company",
      error: error.message,
    });
  }
};