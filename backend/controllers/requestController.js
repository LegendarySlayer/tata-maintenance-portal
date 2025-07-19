import Request from '../models/Request.js';

// ✅ Create a request
export const createRequest = async (req, res) => {
  try {
    const newReq = new Request({ ...req.body, submittedBy: req.user.username });
    if (req.file) {
      newReq.attachment = `/uploads/${req.file.filename}`;
    }
    await newReq.save();
    res.status(201).json({ message: 'Request created', request: newReq });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create request' });
  }
};

// ✅ THIS FUNCTION IS NOW UPDATED to handle roles and search
export const getAllRequests = async (req, res) => {
  try {
    // 1. Start with a base filter determined by the user's role.
    const filter = req.user.role === "manager" 
      ? {} 
      : { submittedBy: req.user.username };

    // 2. Get the search term from the query parameters.
    const { search } = req.query;

    // 3. If a search term exists, add it to the filter.
    if (search) {
      filter.$or = [
        { machine: { $regex: search, $options: "i" } },
        { department: { $regex: search, $options: "i" } },
        { machineId: { $regex: search, $options: "i" } }
      ];
    }

    // 4. Execute the query with the combined filter.
    const requests = await Request.find(filter).sort({ createdAt: -1 });
    res.json(requests);

  } catch (err) {
    console.error("Get All Requests Error:", err);
    res.status(500).json({ message: "Error fetching requests" });
  }
};

// ✅ Get one request
export const getSingleRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Not found' });

    if (req.user.role !== "manager" && request.submittedBy !== req.user.username) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(request);
  } catch (err) {
    res.status(500).json({ message: "Error fetching request" });
  }
};

// ✅ Update request (only by creator or manager)
export const updateRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    const isOwner = request.submittedBy === req.user.username;
    if (!isOwner && req.user.role !== "manager") {
      return res.status(403).json({ message: "Not allowed to update this request." });
    }

    const updated = await Request.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Only Manager can change status
export const updateRequestStatus = async (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({ message: "Only managers can update status" });
    }

    const { status } = req.body;
    const update = { status };
    if (status === 'Resolved') update.resolvedAt = new Date();

    const updated = await Request.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json({ message: 'Status updated', request: updated });
  } catch (err) {
    res.status(500).json({ message: "Status update failed" });
  }
};

// ✅ Delete request (only by creator or manager)
export const deleteRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    const isOwner = request.submittedBy === req.user.username;
    if (!isOwner && req.user.role !== "manager") {
      return res.status(403).json({ message: "Not allowed to delete this request." });
    }

    const deleted = await Request.findByIdAndDelete(req.params.id);
    res.json({ message: 'Request deleted', deleted });
  } catch (err) {
    res.status(500).json({ message: "Deletion failed" });
  }
};