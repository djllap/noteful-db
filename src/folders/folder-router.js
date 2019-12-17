const path = require('path');
const express = require('express');
const xss = require('xss');
const folderService = require('./folder-service');

const folderRouter = express.Router();
const jsonParser = express.json();

const sanitizeFolder = (folder) => ({
  id: folder.id,
  folder_name: xss(folder.folder_name),
  user: folder.user
});

folderRouter
  .route('/')
  .get((req, res, next) => {
    const knexIn = req.app.get('db');
    folderService.getAllFolders(knexIn)
      .then(folders => {
        res.json(folders.map(sanitizeFolder));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { folder_name } = req.body;
    const newFolder = { folder_name };

    if (!folder_name) {
      return res.status(400).json({
        error: {message: 'Missing folder name in request body '}
      });
    }

    newFolder.folder_name = folder_name;

    folderService.insertFolder(
      req.app.get('db'),
      newFolder
    )
      .then(folder => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${folder.id}`))
          .json(sanitizeFolder(folder));
      })
      .catch(next);
  });

folderRouter
  .route('/:folder_id')
  .all((req, res, next) => {
    folderService.getById(
      req.app.get('db'),
      req.params.folder_id
    )
      .then(folder => {
        if (!folder) {
          return res.status(404).json({
            error: {message: 'Folder doesn\'t exist'}
          });
        }

        res.folder = folder;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(sanitizeFolder(res.folder));
  })
  .delete((req, res, next) => {
    folderService.deleteFolder(
      req.app.get('db'),
      req.params.folder_id
    )
      .then(rows => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    const { folder_name, _user } = req.body;
    const folderToUpdate = { folder_name, _user };

    const numberOfValues = Object.values(folderToUpdate).filter(Boolean).length;
    if (numberOfValues === 0) {
      return res.status(400).json({
        error: {message: 'Request body must contain both a folder name and a user Id'}
      });
    }

    folderService.updateFolder(
      req.app.get('db'),
      req.params.folder_id,
      folderToUpdate
    )
      .then(rows => {
        res.status(204).end();
      })
      .catch(next);
  });

folderRouter
  .route('/:folder_id/notes')
  .all((req, res, next) => {
    folderService.getById(
      req.app.get('db'),
      req.params.folder_id
    )
      .then(folder => {
        if (!folder) {
          return res.status(404).json({
            error: {message: 'Folder doesn\'t exist'}
          });
        }
        res.folder = folder;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    const knexIn = req.app.get('db');
    folderService.getNotesInFolder(knexIn, req.params.folder_id)
      .then(notes => {
        return res.json(notes);
      });
  });

module.exports = folderRouter;