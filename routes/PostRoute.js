const router = require('express').Router();
const db = require('../db');
const verifyToken = require('./verifyToken');

// ALL ROUTES PREFIXED WITH /api/posts

// get all posts
router.get('/', async (req, res) => {
    try {
        const {rows} = await db.query('SELECT p.postid, p.posttitle, p.postcontent, p.time_edited, p.postuserid, u.username, u.avatar_image FROM posts as p LEFT JOIN users as u ON p.postuserid = u.userid ORDER BY time_edited DESC');
        return res.json(rows);
    } catch (e) {
        return res.json({
            status: "failed",
            error: "The database failed to respond. Please refresh and try again",
            details: e
        })
    }
    
});

// get post with specific id
router.get('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const {rows} = await db.query('SELECT p.postid, p.posttitle, p.postcontent, p.time_edited, p.postuserid, u.username, u.avatar_image FROM posts as p LEFT JOIN users as u ON p.postuserid = u.userid WHERE postid=$1 ORDER BY time_edited DESC', [id]);

        return res.json(rows);
    } catch (e) {
        return res.json({
            status: "failed",
            error: "The database failed to respond. Please refresh and try again",
            details: e
        });
    }
})

// get all posts from a specific user id
router.get('/user/getbyid/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const {rows} = await db.query('SELECT p.postid, p.posttitle, p.postcontent, p.time_edited, p.postuserid, u.username, u.avatar_image FROM posts as p LEFT JOIN users as u ON p.postuserid = u.userid WHERE postuserid=$1 ORDER BY p.time_edited DESC', [id]);
        return res.json(rows);
    } catch (e) {
        return res.json({
            status: "failed",
            error: "The database failed to respond. Please refresh and try again",
            details: e
        })
    }
});

// get all posts from a specific username
router.get('/user/getbyusername/:username', async (req, res) => {
    const username = req.params.username;
    try {
        const {rows} = await db.query('SELECT p.postid, p.posttitle, p.postcontent, p.time_edited, p.postuserid, u.username, u.avatar_image FROM posts as p LEFT JOIN users as u ON p.postuserid = u.userid WHERE u.username=$1 ORDER BY p.time_edited DESC',
        [username]);
        return res.json(rows);
    } catch (e) {
        return res.json({
            status: "failed",
            error: "The database failed to respond. Please refresh and try again",
            details: e
        })
    }
})

// get all posts whose title/content/username contains value
router.get('/search/:value', async (req, res) => {
    const value = req.params.value;
    console.log(value);
    try {
        const {rows} = await db.query(`
        SELECT p.postid, p.posttitle, p.postcontent, p.time_edited, p.postuserid, u.username, u.avatar_image 
        FROM posts as p 
        LEFT JOIN users as u ON p.postuserid = u.userid
        WHERE p.posttitle LIKE '%' || $1 || '%' OR p.postcontent LIKE '%' || $1 || '%' OR u.username LIKE '%' || $1 || '%'
        ORDER BY p.time_edited DESC`, [value]);
        return res.json(rows);
    } catch (e) {
        return res.status(400).json({
            status: "failed",
            error: "The database failed to respond. Please refresh and try again",
            details: e
        })
    }
})

// add a post by a specific user
router.post('/user/:id', verifyToken, async (req, res) => {
    const id = req.params.id;
    const {postTitle, postContent} = req.body;

    try {
        await db.query('INSERT INTO posts (posttitle, postcontent, postuserid) VALUES ($1, $2, $3)', [postTitle, postContent, id]);
        return res.json({
            status: "success",
            post: {postTitle, postContent}
        });
    } catch (e) {
        return res.status(400).json({
            status: "failed",
            error: "The database failed to respond. Please refresh and try again",
            details: e
        })
    }
})

// delete post by postid
router.delete('/:id', verifyToken, async (req, res) => {
    const id = req.params.id;

    try {
        const { rows: post } = await db.query(`SELECT COUNT(*) FROM posts WHERE postid=${id}`);

        if (parseInt(post[0].count) <= 0) { // if post does not exist, raise 404
            return res.status(404).json({
                status: "failed",
                error: "Post not found"
            });
        }

        const response = await db.query(`DELETE FROM posts WHERE postid=${id}`); // delete post
        return res.json({
            status: "success",
            response
        });
    } catch (e) {
        return res.status(400).json({
            status: "failed",
            error: "The database failed to respond. Please refresh and try again",
            details: e
        });
    }
});

//update post by postid
router.put('/:id', verifyToken, async (req, res) => {
    const id = req.params.id;
    const {postTitle, postContent} = req.body;
    const timeNow = new Date();

    try {
        const { rows: post } = await db.query(`SELECT COUNT(*) FROM posts WHERE postid=${id}`);

        if (parseInt(post[0].count) <= 0) { // if post does not exist, raise 404
            return res.status(404).json({
                status: "failed",
                error: "Post not found"
            });
        }

        await db.query('UPDATE posts SET posttitle=$1, postcontent=$2, time_edited=$3 WHERE postid=$4', [postTitle, postContent, timeNow, id]); // delete post
        return res.json({
            status: "success"
        });
    } catch (e) {
        return res.status(400).json({
            status: "failed",
            error: "The database failed to respond. Please refresh and try again",
            details: e
        });
    }
})

module.exports = router;