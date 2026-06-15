const Issue = require('../models/Issues') ;
const generateToken = require('../utilities/generateToken');


// #Function to create a new issue
exports.createIssue = async (req, res) => {
  try {
    const { description, department, location, photoUrl } = req.body;

    if (!description || !department || !location) {
      return res.status(400).json({ error: "description, department, and location are required" });
    }

    const token = generateToken();

    const newIssue = new Issue({
      token,
      citizenId: req.user.userId, // JWT payload has `userId` (set during login in authController)
      description,
      department,
      location,

      // photoUrl: photoUrl || null,
      photoUrl: photoUrl ?? null
    });

    await newIssue.save();

    return res.status(201).json({
      success: true,
      message: "Issue filed successfully",
      data: {
        token: newIssue.token,
        status: newIssue.status
      }
    });


  } catch (err) {
    console.error("❌ [CREATE_ISSUE_ERROR]:", err.message);

    res.status(500).json({ error: "Internal server error" , details: err.message });
  }
} ;

// # Function to Get all issues (admin only)
exports.getAllIssues = async (req, res) => {
  try {
    const issues = await Issue.find().sort({ createdAt: -1 });
    res.json({ success: true, issues });
  } catch (error) {
    console.error("Error fetching issues:", error.message);
    res.status(500).json({ error: "Internal server error" , details: error.message });
  }
}

// # Function to Get issues filed by the logged-in citizen (JWT required)
exports.getMyIssues = async (req, res) => {
  try {
    const issues = await Issue.find({ citizenId: req.user.userId }).sort({ createdAt: -1 });
    res.json({ success: true, issues });
  } catch (error) {
    console.error("Error fetching citizen issues:", error.message);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
}


// #Function to Track issue by token (public, no auth needed)
exports.trackIssueByToken =  async (req, res) => {
  try {
    const issue = await Issue.findOne({ token: req.params.token });

    if (!issue) {
      return res.status(404).json({ error: "No issue found with that token" });
    }

    res.json({ success: true, issue });
  }catch (error) {
    console.error("Error Tracking issues:", error.message);
    res.status(500).json({ error: "Internal server error" , details: error.message });
  }
}


// # Function to Update issue status (admin only)
exports.updateIssueStatus = async (req, res) => {
  try {
    const { status, officerNotes } = req.body;

    // const updateData = { status, officerNotes };
    const updateData = { status };
      if (officerNotes !== undefined) updateData.officerNotes = officerNotes;

    // Record the resolution time so the score calculator can use it
    if (status === "Resolved") {
      updateData.resolvedAt = new Date();
    }

    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }  // return the updated document
    );

    if (!issue) {
      return res.status(404).json({ error: "Issue not found" });
    }

    res.json({ success: true, issue });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// #Function to Get recent complaints (public, paginated)
exports.getRecentComplaints = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const skip = (page - 1) * limit;

    // Fetch only token, status, and createdAt for confidentiality
    const issues = await Issue.find({}, 'token status createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Issue.countDocuments();

    res.json({
      success: true,
      issues,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error("Error fetching recent complaints:", error.message);
    res.status(500).json({ error: "Internal server error" , details: error.message });
  }
}