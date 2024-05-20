const { Router } = require('express')

const { Business } = require('../models/business')
const { Photo } = require('../models/photo')
const { Review } = require('../models/review')
const { User } = require('../models/user')

const bcrypt = require('bcrypt')
const { authenticate } = require('../middleware/auth')

const router = Router()

async function insertNewUser(userObject) {
  const {name, email, password} = userObject;
  const passwordHash = await bcrypt.hash(password, 8);
  const userDocument = {name, email, password: passwordHash};

  return User.create(userDocument);
}

async function getUserById(userId, includePassword=false) {
  const attributes = includePassword ? {} : { attributes: 0 };

  return User.findByPk(userId, {attributes})
}

async function validateUser(id, password) {
  const user = await getUserByID(id, true);
  const authenticated = user && await bcrypt.compare(password, user.password);
  return authenticated;
}

/*
 * Route to list all of a user's businesses.
 */
router.get('/:userId/businesses', async function (req, res) {
  const userId = req.params.userId
  const userBusinesses = await Business.findAll({ where: { ownerId: userId }})
  res.status(200).json({
    businesses: userBusinesses
  })
})

/*
 * Route to list all of a user's reviews.
 */
router.get('/:userId/reviews', async function (req, res) {
  const userId = req.params.userId
  const userReviews = await Review.findAll({ where: { userId: userId }})
  res.status(200).json({
    reviews: userReviews
  })
})

/*
 * Route to list all of a user's photos.
 */
router.get('/:userId/photos', async function (req, res) {
  const userId = req.params.userId
  const userPhotos = await Photo.findAll({ where: { userId: userId }})
  res.status(200).json({
    photos: userPhotos
  })
})

/*
 * Route to fetch info about a specific user.
 */
router.get('/:userId', async function (req, res) {
  const userId = req.params.userId
  const user = await getUserById(userId)
  if (user) {
    res.status(200).send(user)
  } else {
    res.status(404).json({ error: 'User not found' });
  }
})

/*
 * Route to log in a user.
 */
router.post('/login', async function (req, res) {
  if (req.body && req.body.id && req.body.password) {
    try {
      const authenticated = await validateUser(req.body.id, req.body.password);
      if (authenticated) {
        res.status(200).send({});
      } else {
        res.status(401).send({
          error: "Invalid authentication credentials"
        });
      }
    } catch (err) {
      res.status(500).send({
        error: "Error logging in.  Try again later."
      });
    }
  } else {
    res.status(400).json({
      error: "Request body needs user ID and password."
    });
  }
})

// Temporary endpoint to list all users (for debugging purposes)
router.get('/all', async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router
