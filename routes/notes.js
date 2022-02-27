const express = require("express");
const router = express.Router();
const fetchUser = require("../middleware/fetchuser");
const Notes = require("../models/Notes");
const { body, validationResult } = require("express-validator");

// ROUTE 1: get all notes

router.get("/fetchallnotes", fetchUser, async (req, res) => {
  const notes = await Notes.find({ user: req.user.id });

  res.json(notes);
});

// ROUTE 2:add a new note

router.post(
  "/addnotes",
  fetchUser,
  [
    body("title", "enter a valid title").isLength({
      min: 3,
    }),
    body("description", "Description must be atleast 5 characters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;
      const errors = validationResult(req);

      //return errors if not satisfied
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
        });
      }

      // create an obj and return a promise
      const note = await new Notes({
        title,
        description,
        tag,
        user: req.user.id,
      });

      const savedNotes = await note.save();
      res.json(savedNotes);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error");
    }
  }
);

//ROUTE 3: update an existing note

router.put("/updatenote/:id", fetchUser, async (req, res) => {
  const { title, description, tag } = req.body;
  //create a new note object

  const newNote = {};

  if (title) newNote.title = title;
  if (description) newNote.description = description;
  if (tag) newNote.tag = tag;

  //find the note to be updated

  let note = await Notes.findById(req.params.id);

  if (!note) return res.status(404).send("not found");
  if (note.user.toString() !== req.user.id) {
    return res.status(401).send("not allowed");
  }

  note = await Notes.findByIdAndUpdate(
    req.params.id,
    { $set: newNote },
    { new: true }
  );

  res.json(note);
});

//ROUTE 4: delete a note

router.delete("/deletenote/:id", fetchUser, async (req, res) => {
  let note = await Notes.findById(req.params.id);

  if (!note) return res.status(404).send("not found");
  if (note.user.toString() !== req.user.id) {
    return res.status(401).send("not allowed");
  }

  note = await Notes.findByIdAndDelete(req.params.id);

  res.send("Note deleted");
});

module.exports = router;
