const path = require('path');
const express = require('express');
const xss = require('xss';
const userService) = require('./user-service');

const userRouter = express.Router();
const jsonParser = express.json();

const sanitizeUser = (user) => {
  id: user.id
  username: xss(user.username)
};

userRouter
  .route('/')
  .get((req, res, next) => {
    const knexIn = req.app.get('db');
    userService.getAllUsers(knexIn)
      .then(users => {
        res.json(users.map(sanitizeUser));
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { username } = req.body;
    const newUser = { username };

    for (const [key, value] of Object.entries(newUser)) {
      if (!value) {
        return res.status(400).json({
          error: {message: `Missing ${key} in request body `}
        });
      }
    }

    newUser.username = username;

    userService.insertUser(
      req.app.get('db'),
      newUser
    )
      .then(user => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${user.id}`))
          .json(sanitizeUser(user))
      })
      .catch(next)
  });

userRouter
  .route('/:user_id')
  .all((req, res, next) => {
    userService.getById(
      req.app.get('db'),
      req.params.user_id
    )
      .then( user => {
        if (!user) {
          return res.status(404).json({
            error: {message: 'User doesn\'t exist'}
          });
        }

        res.user = user;
        next();
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(sanitizeUser(res.user))
  })
  .delete((req, res, next) => {
    userService.deleteUser(
      req.app.get('db'),
      req.params.user_id
    )
      .then(rows => {
        res.status(204).end();
      })
      .catch(next)
  })
  .patch(jsonParser, (req, res, next) => {
    const { username } = req.body;
    const userToUpdate = { username };

    const numberOfValues = Object.values(userToUpdate).filter(Boolean).length;
    if (numberOfValues === 0) {
      return res.status(400).json({
        error: {message: 'Request body must contain a username'}
      });
    }

    userService.updateUser(
      req.app.get('db'),
      req.params.user_id,
      userToUpdate
    )
      .then(rows => {
        res.status(204).end()
      })
      .catch(next)
  })

  module.exports = userRouter;