const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/auth');
//const { populate } = require('../models/Doc');
const Doc = require('../models/Doc')

// @desc Show add page
// @route GET /docs/add
router.get('/add', ensureAuth, (req, res) => {
  res.render('docs/add')
});

// @desc    Process add form
// @route   POST /docs
router.post('/', ensureAuth, async (req, res) => {
  try {
    req.body.user = req.user.id
    await Doc.create(req.body)
    res.redirect('/dashboard')
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

// @desc    Show all docs
// @route   GET /docs
router.get('/', ensureAuth, async (req, res) => {
  if (req.query.search) {
    try {
      const regex = new RegExp(escapeRegex(req.query.search), 'gi');
      const docs = await Doc.find({ status: 'public', title: regex })
        .populate('user')
        .sort({ createdAt: 'desc' })
        .lean()

      res.render('docs/index', {
        docs,
      })
    } catch (err) {
      console.error(err)
      res.render('error/500')
    }
  } else {
    try {
      const docs = await Doc.find({ status: 'public' })
        .populate('user')
        .sort({ createdAt: 'desc' })
        .lean()

      res.render('docs/index', {
        docs,
      })
    } catch (err) {
      console.error(err)
      res.render('error/500')
    }
  }
});

// @desc Show single doc
// @route GET /docs/add
router.get('/:id', ensureAuth, async (req, res) => {
  try {
    let doc = await Doc.findById(req.params.id).populate('user').lean()

    if (!doc) {
      return res.render('error/404')
    }
    res.render('docs/show', {
      doc,
    })
  } catch (err) {
    console.error(err)
    res.render('error/404')
  }
});

// @desc Show edit page
// @route GET /docs/edit/:id
router.get('/edit/:id', ensureAuth, async (req, res) => {
  try {
    const doc = await Doc.findOne({
      _id: req.params.id
    }).lean()

    if (!doc) {
      return res.render('error/404')
    }

    if (doc.user != req.user.id) {
      res.redirect('/docs')
    } else {
      res.render('docs/edit', {
        doc,
      })
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
});

// @desc Update doc
// @route PUT /docs/:id
router.put('/:id', ensureAuth, async (req, res) => {
  try {
    let doc = await Doc.findById(req.params.id).lean()

    if (!doc) {
      return res.render('error/404')
    }

    if (doc.user != req.user.id) {
      res.redirect('/docs')
    } else {
      doc = await Doc.findOneAndUpdate({ _id: req.params.id }, req.body, {
        new: true,
        runValidators: true
      })

      res.redirect('/dashboard')
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }

});

// @desc Delete doc
// @route DELETE /docs/:id
router.delete('/:id', ensureAuth, async (req, res) => {
  try {
    await Doc.remove({ _id: req.params.id })
    res.redirect('/dashboard')
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
});

// @desc User docs
// @route GET /docs/user/:userId
router.get('/user/:userId', ensureAuth, async (req, res) => {
  try {
    const docs = await Doc.find({
      user: req.params.userId,
      status: 'public'
    }).populate('user').lean()

    res.render('docs/index', {
      docs
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
});

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


module.exports = router
