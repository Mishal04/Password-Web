const Note = require("../models/Note");

// Create a note
const createNote = async (req, res) => {
  try {
    const { title, content, colored } = req.body;

    const note = await Note.create({
      owner: req.user._id,
      title: title || "",
      content: content || "",
      colored: colored || "#fffae6",
      pinned: false,
    });

    res.status(201).json({ success: true, note });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all notes (with optional search)
const getNotes = async (req, res) => {
  try {
    const keyword = req.query.search || "";

    const filter = { owner: req.user._id };

    if (keyword) {
      filter.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { content: { $regex: keyword, $options: "i" } },
      ];
    }

    const notes = await Note.find(filter).sort({ pinned: -1, updatedAt: -1 });

    res.status(200).json({ success: true, notes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a note
const updateNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ success: false, message: "Note not found" });
    }

    if (note.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const { title, content, colored } = req.body;
    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (colored !== undefined) note.colored = colored;

    await note.save();

    res.status(200).json({ success: true, note });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a note
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ success: false, message: "Note not found" });
    }

    if (note.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    await Note.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: "Note deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle pin
const togglePin = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ success: false, message: "Note not found" });
    }

    if (note.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    note.pinned = !note.pinned;
    await note.save();

    res.status(200).json({ success: true, pinned: note.pinned, note });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createNote,
  getNotes,
  updateNote,
  deleteNote,
  togglePin,
};
