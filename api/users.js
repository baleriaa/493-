const { Router } = require('express')

const { Business } = require('../models/business')
const { Photo } = require('../models/photo')
const { Review } = require('../models/review')
const { User } = require('../models/users')
const { generateAuthToken, requireAuthentication } = require('../lib/auth');

const bcrypt = require('bcrypt')

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
router.get('/:userId/businesses', requireAuthentication, async function (req, res) {
  const userId = req.params.userId
  const userBusinesses = await Business.findAll({ where: { ownerId: userId }})
  res.status(200).json({
    businesses: userBusinesses
  })
})

/*
 * Route to list all of a user's reviews.
 */
router.get('/:userId/reviews', requireAuthentication, async function (req, res) {
  const userId = req.params.userId
  const userReviews = await Review.findAll({ where: { userId: userId }})
  res.status(200).json({
    reviews: userReviews
  })
})

/*
 * Route to list all of a user's photos.
 */
router.get('/:userId/photos', requireAuthentication, async function (req, res) {
  const userId = req.params.userId
  const userPhotos = await Photo.findAll({ where: { userId: userId }})
  res.status(200).json({
    photos: userPhotos
  })
})

/*
 * Route to fetch info about a specific user.
 */
router.get('/:userId', requireAuthentication, async function (req, res) {
  const userId = req.params.userId
  if (req.user !== req.params.userID) {
    res.status(403).json({
      error: "Unauthorized to access the specified resource"
    });
  }
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
  console.log("== POST /login body:", req.body);
  if (req.body && req.body.id && req.body.password) {
    try {
      const authenticated = await validateUser(req.body.id, req.body.password);
      if (authenticated) {
        const token = generateAuthToken(req.body.id);
        res.status(200).send({ token });
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

/*
 * Route to register a new user
 */
router.post('/', async function (req, res) {
  try {
    const user = await insertNewUser(req.body);
    res.status(201).json({id: user.id});
  } catch (error) {
    console.error("Error inserting new user:", error);
    res.status(500).json({ error: "Error inserting new user" });
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
