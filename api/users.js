const { Router } = require('express')

const { Business } = require('../models/business')
const { Photo } = require('../models/photo')
const { Review } = require('../models/review')

const router = Router()

async function insertNewUser(userObject) {
  const {name, email, password} = userObject;
  const passwordHash = await bcrypt.hash(user.password, 8);
  const userDocument = {name, email, password: passwordHash};

  return User.create(userDocument);
}

async function getUserById(userId, includePassword=false) {
  const projection = includePassword ? {} : { password: 0 };

  return User.findByPk(userId, {projection})
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
    next()
  }
})

module.exports = router
