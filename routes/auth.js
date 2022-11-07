const express = require('express');
const passport = require('passport');
const router = express.Router();

// @desc Auth with Google
// @route GET /auth/google
router.get('/google', passport.authenticate('google', { scope: ['profile'] }))

// @desc Google auth callack
// @route GET /auth/google/callack
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  res.redirect('/dashboard')
})

// @desc Logout user
//@desc /auth/logout
/* router.get('/logout', (req, res)=>{
  req.logout()
  res.redirect('/')
}) */
router.get('/logout', (req, res, next) => {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/')
  })
})

module.exports = router
