const router = require('express').Router();
const verify = require('./verifyToken');

// test route to check verify works
// /api/protected
router.get('/', verify, async (req, res) => {
 return res.json({message: "THIS IS PROTECTED"})
});

// check information passed through token
router.get('/userinfo', verify, async (req, res) => {
    return res.json(req.user);
})

module.exports = router;