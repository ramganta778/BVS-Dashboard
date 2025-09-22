const DigitalAgreement = require('../models/DigitalAgreement');

// @desc    Get all digital agreements
// @route   GET /api/digital-agreements
// @access  Private
const getDigitalAgreements = async (req, res) => {
  try {
    const { search } = req.query;
    
    let filter = { createdBy: req.user.userId };
    if (search) {
      filter = {
        createdBy: req.user.userId,
        $or: [
          { clientCompany: { $regex: search, $options: 'i' } },
          { clientName: { $regex: search, $options: 'i' } } 
        ]
      };
    }
    
    const agreements = await DigitalAgreement.find(filter)
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

// @desc    Get single digital agreement
// @route   GET /api/digital-agreements/:id
// @access  Private
const getDigitalAgreement = async (req, res) => {
  try {
    const agreement = await DigitalAgreement.findOne({
      _id: req.params.id,
      createdBy: req.user.userId
    }).populate('createdBy', 'name email');

    if (!agreement) {
      return res.status(404).json({
        success: false,
        message: 'Digital agreement not found'
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

// @desc    Create new digital agreement
// @route   POST /api/digital-agreements
// @access  Private
const createDigitalAgreement = async (req, res) => {
  try {
    const {
      clientName,
      clientCompany,
      clientAddress,
      services,
      additionalServices,
      startDate,
      endDate,
      platforms,
      travelAllowance,
      droneShoot,
      notes
    } = req.body;

    // Validation
    if (!clientName || !clientCompany || !clientAddress || !services || services.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Client name, company, address, and at least one service are required'
      });
    }

    // Filter out empty additional services
    const filteredAdditionalServices = (additionalServices || []).filter(
      service => service.description && service.description.trim() !== ''
    );

    const agreement = await DigitalAgreement.create({
      clientName,
      clientCompany,
      clientAddress,
      services,
      additionalServices: filteredAdditionalServices,
      startDate: startDate || new Date(),
      endDate,
      platforms: platforms || [],
      travelAllowance: travelAllowance || false,
      droneShoot: droneShoot || false,
      notes: notes || '',
      createdBy: req.user.userId
    });

    await agreement.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Digital agreement created successfully',
      data: agreement
    });
  } catch (error) {
    console.error('Error creating digital agreement:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update digital agreement
// @route   PUT /api/digital-agreements/:id
// @access  Private
const updateDigitalAgreement = async (req, res) => {
  try {
    let agreement = await DigitalAgreement.findOne({
      _id: req.params.id,
      createdBy: req.user.userId
    });

    if (!agreement) {
      return res.status(404).json({
        success: false,
        message: 'Digital agreement not found'
      });
    }

    const {
      clientName,
      clientCompany,
      clientAddress,
      services,
      additionalServices,
      startDate,
      endDate,
      platforms,
      travelAllowance,
      droneShoot,
      notes
    } = req.body;

    // Filter out empty additional services
    const filteredAdditionalServices = (additionalServices || []).filter(
      service => service.description && service.description.trim() !== ''
    );

    agreement = await DigitalAgreement.findByIdAndUpdate(
      req.params.id,
      {
        clientName,
        clientCompany,
        clientAddress,
        services,
        additionalServices: filteredAdditionalServices,
        startDate,
        endDate,
        platforms,
        travelAllowance,
        droneShoot,
        notes: notes || ''
      },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Digital agreement updated successfully',
      data: agreement
    });
  } catch (error) {
    console.error('Error updating digital agreement:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update digital agreement status
// @route   PATCH /api/digital-agreements/:id/status
// @access  Private
const updateDigitalAgreementStatus = async (req, res) => {
  try {
    let agreement = await DigitalAgreement.findOne({
      _id: req.params.id,
      createdBy: req.user.userId
    });

    if (!agreement) {
      return res.status(404).json({
        success: false,
        message: 'Digital agreement not found'
      });
    }

    const { status } = req.body;
    
    if (!['Draft', 'Active', 'Completed', 'Terminated', 'Expired'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    agreement = await DigitalAgreement.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Digital agreement status updated successfully',
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

// @desc    Delete digital agreement
// @route   DELETE /api/digital-agreements/:id
// @access  Private
const deleteDigitalAgreement = async (req, res) => {
  try {
    const agreement = await DigitalAgreement.findOne({
      _id: req.params.id,
      createdBy: req.user.userId
    });

    if (!agreement) {
      return res.status(404).json({
        success: false,
        message: 'Digital agreement not found'
      });
    }

    await DigitalAgreement.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Digital agreement deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get digital agreements statistics
// @route   GET /api/digital-agreements/stats/summary
// @access  Private
const getDigitalAgreementStats = async (req, res) => {
  try {
    const stats = await DigitalAgreement.aggregate([
      {
        $match: { createdBy: req.user.userId }
      },
      {
        $group: {
          _id: null,
          totalAgreements: { $sum: 1 },
          totalRevenue: { $sum: '$totalCost' },
          activeAgreements: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Active'] }, 1, 0]
            }
          }
        }
      }
    ]);

    const monthlyRevenue = await DigitalAgreement.aggregate([
      {
        $match: { createdBy: req.user.userId }
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
  getDigitalAgreements,
  getDigitalAgreement,
  createDigitalAgreement,
  updateDigitalAgreement,
  updateDigitalAgreementStatus,
  deleteDigitalAgreement,
  getDigitalAgreementStats
};