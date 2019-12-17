const path = require('path');
const express = require('express');
const xss = require('xss');
const noteService = require('./note-service');

const noteRouter = express.Router();
const jsonParser = express.json();

const sanitizeNote = (note) => ({
  id: note.id,
  note_name: xss(note.note_name),
  content: xss(note.content),
  folder_id: note.folder_id
});

noteRouter
  .route('/')
  .get((req, res, next) => {
    const knexIn = req.app.get('db');
    noteService.getAllNotes(knexIn)
      .then(users => {
        res.json(users.map(sanitizeNote));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { note_name, content, folder_id } = req.body;
    const newNote = { note_name, content, folder_id };

    for (const [key, value] of Object.entries(newNote)) {
      if (!value) {
        return res.status(400).json({
          error: {message: `Missing ${key} in request body `}
        });
      }
    }

    newNote.note_name = note_name;
    newNote.content = content;
    newNote.folder_id = folder_id;

    noteService.insertNote(
      req.app.get('db'),
      newNote
    )
      .then(note => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${note.id}`))
          .json(sanitizeNote(note));
      })
      .catch(next);
  });

noteRouter
  .route('/:note_id')
  .all((req, res, next) => {
    noteService.getById(
      req.app.get('db'),
      req.params.note_id
    )
      .then(note => {
        if (!note) {
          return res.status(404).json({
            error: {message: 'Note doesn\'t exist'}
          });
        }

        res.note = note;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(sanitizeNote(res.note));
  })
  .delete((req, res, next) => {
    noteService.deleteNote(
      req.app.get('db'),
      req.params.note_id
    )
      .then(rows => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    const { note_name, content, folder_id } = req.body;
    const noteToUpdate = { note_name, content, folder_id };

    const numberOfValues = Object.values(noteToUpdate).filter(Boolean).length;
    if (numberOfValues === 0) {
      return res.status(400).json({
        error: {message: 'Request body must contain a note name and a folder Id'}
      });
    }

    noteService.updateNote(
      req.app.get('db'),
      req.params.note_id,
      noteToUpdate
    )
      .then(rows => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = noteRouter;