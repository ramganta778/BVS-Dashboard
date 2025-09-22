const Agreement = require('../models/Agreement');
const User = require('../models/User');

// @desc    Get all agreements
// @route   GET /api/agreements
// @access  Private
const getAgreements = async (req, res) => {
  try {
    const agreements = await Agreement.find({ createdBy: req.user.userId })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email');
    
    res.json({
      success: true,
      count: agreements.length,
      data: agreements
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single agreement
// @route   GET /api/agreements/:id
// @access  Private
const getAgreement = async (req, res) => {
  try {
    const agreement = await Agreement.findOne({
      _id: req.params.id,
      createdBy: req.user.userId
    }).populate('createdBy', 'name email');

    if (!agreement) {
      return res.status(404).json({
        success: false,
        message: 'Agreement not found'
      });
    }

    res.json({
      success: true,
      data: agreement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create new agreement
// @route   POST /api/agreements
// @access  Private
const createAgreement = async (req, res) => {
  try {
    const {
      clientName,
      clientCompany,
      services,
      warrantyYears,
      startDate,
      endDate,
      notes
    } = req.body;

    // Validation
    if (!clientName || !clientCompany || !services || services.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Client name, company, and at least one service are required'
      });
    }

    const agreement = await Agreement.create({
      clientName,
      clientCompany,
      services,
      warrantyYears: warrantyYears || 1,
      startDate: startDate || new Date(),
      endDate,
      notes,
      createdBy: req.user.userId
    });

    await agreement.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Agreement created successfully',
      data: agreement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update agreement
// @route   PUT /api/agreements/:id
// @access  Private
const updateAgreement = async (req, res) => {
  try {
    let agreement = await Agreement.findOne({
      _id: req.params.id,
      createdBy: req.user.userId
    });

    if (!agreement) {
      return res.status(404).json({
        success: false,
        message: 'Agreement not found'
      });
    }

    const {
      clientName,
      clientCompany,
      services,
      warrantyYears,
      startDate,
      endDate,
      notes
    } = req.body;

    agreement = await Agreement.findByIdAndUpdate(
      req.params.id,
      {
        clientName,
        clientCompany,
        services,
        warrantyYears,
        startDate,
        endDate,
        notes
      },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Agreement updated successfully',
      data: agreement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete agreement
// @route   DELETE /api/agreements/:id
// @access  Private
const deleteAgreement = async (req, res) => {
  try {
    const agreement = await Agreement.findOne({
      _id: req.params.id,
      createdBy: req.user.userId
    });

    if (!agreement) {
      return res.status(404).json({
        success: false,
        message: 'Agreement not found'
      });
    }

    await Agreement.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Agreement deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get agreements statistics
// @route   GET /api/agreements/stats/summary
// @access  Private
const getAgreementStats = async (req, res) => {
  try {
    const stats = await Agreement.aggregate([
      {
        $match: { createdBy: mongoose.Types.ObjectId(req.user.userId) }
      },
      {
        $group: {
          _id: null,
          totalAgreements: { $sum: 1 },
          totalRevenue: { $sum: '$totalCost' },
          activeAgreements: {
            $sum: {
              $cond: [{ $eq: ['$status', 'active'] }, 1, 0]
            }
          }
        }
      }
    ]);

    const monthlyRevenue = await Agreement.aggregate([
      {
        $match: { createdBy: mongoose.Types.ObjectId(req.user.userId) }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalCost' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': -1, '_id.month': -1 }
      },
      {
        $limit: 6
      }
    ]);

    res.json({
      success: true,
      data: {
        summary: stats[0] || { totalAgreements: 0, totalRevenue: 0, activeAgreements: 0 },
        monthlyRevenue
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getAgreements,
  getAgreement,
  createAgreement,
  updateAgreement,
  deleteAgreement,
  getAgreementStats
};