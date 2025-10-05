const express = require('express');
const router = express.Router();
const candidate = require('../models/candidate.js');
const { jwtAuthMiddleware, generateToken } = require('../jwt.js');
const user = require('../models/user.js');
const { use } = require('passport');


// ✅ Check admin role
const checkAdminRole = async (userId) => {
  try {
    const person = await user.findById(userId);
    if(person.role === 'admin'){
        return true ; 
    }
  } catch (err) {
    return false;
  }
};

// ✅ POST: Add candidate (Admin only)
router.post("/", jwtAuthMiddleware, async (req, res) => {
  try {
    // Check admin role
    if (!await checkAdminRole(req.user.id)) {
      return res.status(403).json({ message: 'User does not have admin role' });
    }

    const data = req.body;
    const newCandidate = new candidate(data);          // ✅ create instance
    const response = await newCandidate.save();        // ✅ save instance

    console.log("✅ Candidate saved:", response);
    res.status(201).json({
      message: "Candidate created successfully!",
      candidate: response,
    });
  } catch (err) {
    console.error("❌ Error saving candidate:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});




// ✅ PUT: Update candidate (Admin only)
router.put('/:candidateID', jwtAuthMiddleware, async (req, res) => {
  try {
    if (!await checkAdminRole(req.user.id)) {
      return res.status(403).json({ message: 'User does not have admin role' });
    }

    const candidateID = req.params.candidateID;
    const updateCandidateData = req.body;

    // 🧩 FIXED: Added missing comma and corrected options
    const response = await candidate.findByIdAndUpdate(candidateID, updateCandidateData, {
      new: true,
      runValidators: true,  // ✅ typo fixed from "renValidators"
    });

    if (!response) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    console.log('✅ Candidate data updated');
    res.status(200).json(response);
  } catch (err) {
    console.error("❌ Error updating candidate:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ DELETE: Remove candidate (Admin only)
router.delete('/:candidateID', jwtAuthMiddleware, async (req, res) => {
  try {
    if (!await checkAdminRole(req.user.id)) {
      return res.status(403).json({ message: 'User does not have admin role' });
    }

    const candidateID = req.params.candidateID;
    const response = await candidate.findByIdAndDelete(candidateID);

    if (!response) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    console.log('✅ Candidate deleted');
    res.status(200).json({ message: "Candidate deleted successfully", candidate: response });
  } catch (err) {
    console.error("❌ Error deleting candidate:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


// ✅ POST: Vote for candidate
router.post('/vote/:candidateID', jwtAuthMiddleware, async (req, res) => {
  const candidateID = req.params.candidateID;
  const userId = req.user.id;

  try {
    // Find candidate by ID
    const selectedCandidate = await candidate.findById(candidateID);
    if (!selectedCandidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    // Find voter
    const voter = await user.findById(userId);
    if (!voter) {
      return res.status(404).json({ message: 'Voter not found' });
    }

    // Check if already voted
    if (voter.isVoted) {
      return res.status(400).json({ message: 'You have already voted' });
    }

    // Admins cannot vote
    if (voter.role === 'admin') {
      return res.status(403).json({ message: 'Admin not allowed to vote' });
    }

    // Record vote
    selectedCandidate.votes.push({ user: userId });
    selectedCandidate.voteCount++;
    await selectedCandidate.save();

    // Mark voter as voted
    voter.isVoted = true;
    await voter.save();

    return res.status(200).json({ message: 'Vote recorded successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// ✅ GET: Vote count
router.get('/vote/count', async (req, res) => {
  try {
    const candidates = await candidate.find().sort({ voteCount: -1 });

    const voteRecord = candidates.map(data => ({
      party: data.party,
      count: data.voteCount,
    }));

    return res.status(200).json(voteRecord);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// ✅ Get total number of candidates + their name & ID
router.get('/count', async (req, res) => {
  try {
    // Count total candidates
    const totalCandidates = await candidate.countDocuments();

    // Get candidate names and IDs only
    const candidateList = await candidate.find({}, { _id: 1, name: 1,party:1 });

    res.status(200).json({
      totalCandidates,
      candidates: candidateList
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});



module.exports = router;
