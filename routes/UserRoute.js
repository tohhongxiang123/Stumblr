const router = require('express').Router();
const db = require('../db');
const { registerValidation, loginValidation } = require('../validation');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const verifyToken = require('./verifyToken');
require('dotenv').config();

// ALL ERROR RETURNS SHOULD GIVE {STATUS, ERROR, DETAILS}


// ALL ROUTES PREFIXED WITH /api/users

// get all users
// returns array of users
// public
router.get('/', async (req, res) => {
    try {
        const {rows} = await db.query('SELECT username, userid, email, avatar_image FROM users'); 
        return res.json(rows);
    } catch (e) {
        return res.json({
            status: "failed",
            error: "The database failed to respond. Please refresh and try again", 
            details:e
        });
    }
});

// get user by id
// returns user with id
// public
router.get('/getuser/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const {rows} = await db.query('SELECT username, userid, email, avatar_image FROM users where userid=$1 LIMIT 1', [id]);
        if (rows.length > 0) {
            return res.json(rows[0]);
        } else {
            return res.status(404).json({
                status: "failed",
                error: "User not found",
                details: "User not found"
            });
        }
    } catch(e) {
        return res.status(400).json({
            status: "failed",
            error: "The database failed to respond. Please refresh and try again", 
            details:e
        });
    }
});

// get user by username
// returns user with username
// public
router.get('/getuser/username/:username', async (req, res) => {
    const username = req.params.username;
    try {
        const {rows} = await db.query('SELECT username, userid, email, avatar_image FROM users where username=$1 LIMIT 1', [username]);
        if (rows.length > 0) {
            return res.json(rows[0]);
        } else {
            return res.status(404).json({
                status: "failed",
                error: "User not found",
                details: "User not found"
            });
        }
    } catch(e) {
        return res.status(400).json({
            status: "failed",
            error: "The database failed to respond. Please refresh and try again", 
            details:e
        });
    }
});

// register a user
// public
router.post('/register', async (req, res) => {
    // validate data
    const {error} = registerValidation(req.body);
   
    if (error) return res.status(400).json({
        status: "failed",
        error: error.details[0].message,
        details: error.details[0]
    });

   // extract information from req body
   const {username, email, password} = req.body;
   
   // check if username exists
   try {
       const {rows: username_exists} = await db.query('SELECT COUNT(*) FROM users WHERE username=$1', [username]); 
       if (parseInt(username_exists[0].count) > 0) return res.status(400).json({status: "failed", error: "Username exists", details: "Username exists"});
   } catch (e) {
       return res.json({status: 'failed', error: "The database failed to respond. Please refresh and try again", details:e});
   }

   // check if email exists
   try {
       const {rows: email_exists} = await db.query('SELECT COUNT(*) FROM users WHERE email=$1', [email]);
       if (parseInt(email_exists[0].count) > 0) return res.status(400).json({status: "failed", error: "Email exists", details: "Email exists"});
   } catch (e) {
       return res.json({status: 'failed', error: "The database failed to respond. Please refresh and try again", details:e})
   }

   // hash the password 
   const salt = await bcrypt.genSalt(10);
   const hashedPassword = await bcrypt.hash(password, salt);
   
   // insert into database
   try {
       await db.query('INSERT INTO users (username, password, email) VALUES ($1, $2, $3)', [username, hashedPassword, email]);

       // return success
       return res.json({
           status: "success"
       });
   } catch (e) {
       return res.status(400).json({
           status: "failed", 
           error: "The database failed to respond. Please refresh and try again", 
           details:e
       });
   }
});

// login
// public
router.post('/login', async (req, res) => {
   // validate req.body
   const {error} = loginValidation(req.body);

   if (error) return res.status(400).json({
       status: "failed",
       error: error.details[0].message,
       details: error.details[0]
   });

   // extract information from req.body
   const {username, password} = req.body;
   
   let user;
   // check if username exists
   try {
       const response = await db.query('SELECT * FROM users WHERE username=$1', [username]); 
       user = response.rows[0];
       if (!user) return res.status(400).json({status: "failed", error: "Username does not exist", details: "Username does not exist"});
   } catch (e) {
       return res.json({status: 'failed', error: "Something went wrong with querying database", details: e});
   }

   // check password is correct
   const validPass = await bcrypt.compare(password, user.password);
   if (!validPass) return res.status(400).json({status: "failed", error: "Password is wrong", details: "Password is wrong"});

   //create and assign auth-token and refresh-token
   const token = jwt.sign({userid: user.userid, username: user.username}, process.env.TOKEN_SECRET, {expiresIn: parseInt(process.env.TOKEN_LIFE)});
   const refresh_token = jwt.sign({userid: user.userid, username: user.username}, process.env.REFRESH_TOKEN_SECRET, {expiresIn: parseInt(process.env.REFRESH_TOKEN_LIFE)});

   // write token into database
   await db.query(`INSERT INTO tokens (refreshtoken) VALUES ($1)`, [refresh_token]);

   // return token in cookie and return success
   // secure is false in production, true in development
   return res.cookie('auth-token', token, {httpOnly: true, secure: process.env.NODE_ENV !== 'development'})
   .cookie('refresh-token', refresh_token, {httpOnly: true, secure: process.env.NODE_ENV !== 'development'})
   .json({
       status: "success", 
       'auth-token':token, 
       user: {
           username: user.username, 
           userid: user.userid, 
           email: user.email, 
           avatar_image: user.avatar_image}});
});

// logs user out
// public
router.post('/logout', async (req, res) => {
    const refresh_token = req.cookies['refresh-token'];
    // delete token from the database
    await db.query(`DELETE FROM tokens WHERE refreshtoken=$1`, [refresh_token]);
    return res.clearCookie('refresh-token').clearCookie('auth-token').json({status: "success"});
});

// verify current user
// private
router.get('/currentuser', verifyToken, async (req, res) => {
    let user = req.user; // get user
   try {
       // check that user actually exists in the database
       const response = await db.query('SELECT username, userid, email, avatar_image FROM users WHERE username=$1', [user.username]);  
       user = response.rows[0];

       if (!user) {
           // clear cookie cus its a fake, raise a 404
           return res.clearCookie('auth-token').status(404).json({status: "failed", error: "Username does not exist", details: "Username does not exist"});
       }

       return res.json({status:"success", user});
   } catch (e) {
       console.log(e);
       return res.status(400).json({status:"failed", message:"user not verified"});
   }
   
});

// delete user by id
// private
router.delete('/delete/:id', verifyToken, async (req, res) => {
    const id = req.params.id;

    // check if user exists
    try {
        const { rows: user } = await db.query(`SELECT COUNT(*) FROM users WHERE userid=${id}`);
        if (parseInt(user[0].count) <= 0) { // if user does not exist, raise 404
            return res.status(404).json({
                status: "failed",
                error: "User not found",
                details: "User not found"
            });
        }

        // delete user
        const response = await db.query(`DELETE FROM users WHERE userid=${id}`); 
        return res.json({
            status: "success"
        });
    } catch (e) {
        return res.status(400).json({
            status: "failed",
            error: "The database failed to respond. Please refresh and try again", 
            details:e
        });
    }
});

// update user by id
router.put('/updateuser/:id', verifyToken,  async (req, res) => {
    const {username, email, password, avatarImage} = req.body;
    let newPassword = req.body.newPassword;
    const id = req.params.id;

    // if newPassword is blank, set it as the old password
    if (!newPassword) {
        newPassword = password;
    }

    // validate the new user credentials
    const {error} = registerValidation({username, email, password: newPassword});
   
    if (error) return res.status(400).json({
        status: "failed",
        error: error.details[0].message,
        details: error.details[0]
    });

    // make sure username doesnt already exist
    try {
        const { rows: usernameCount } = await db.query('SELECT COUNT(*) FROM users WHERE username=$1 AND NOT userid=$2', [username, id]);
        if (parseInt(usernameCount[0].count) > 0) {
            return res.status(400).json({
                status: "failed",
                error: "Username already taken",
                details: "Username already taken"
            });
        }

        const { rows: emailCount } = await db.query('SELECT COUNT(*) FROM users WHERE email=$1 AND NOT userid=$2', [email, id]);
        if (parseInt(emailCount[0].count) > 0) {
            return res.status(400).json({
                status: "failed",
                error: "Email already taken",
                details: "Email already taken"
            });
        }
    } catch (e) {
        return res.status(400).json({
            status: "failed",
            error: "The database failed to respond. Please refresh and try again",
            details:e
        });
    }

    try {
        // find user from database
        const { rows } = await db.query(`SELECT * FROM users WHERE userid=${id}`);
        const user = rows[0];

        if (!user) { // if user does not exist, raise 404
            return res.status(404).json({
                status: "failed",
                error: "User not found",
                details: "User not found"
            });
        }

        // check password is correct
        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) return res.status(400).json({status: "failed", error: "Password is wrong", details: "Password is wrong"});

        // hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // update user credentials
        await db.query('UPDATE users SET username=$1, password=$2, email=$3, avatar_image=$4 WHERE userid=$5', [username, hashedPassword, email, avatarImage, id]);

        // create a new token
        const token = jwt.sign({userid: user.userid, username: user.username}, process.env.TOKEN_SECRET);

        // update the cookie with the new token
        return res.cookie('auth-token', token, {httpOnly: true}).json({
            status: "success"
        });
    } catch (e) {
        return res.status(400).json({
            status: "failed",
            error: "The database failed to respond. Please refresh and try again",
            details:e
        });
    }
});

// gets all users that user with username is following
router.get('/following/:username', async (req, res) => {
    const username = req.params.username;
    try {
        const { rows } = await db.query(`
        SELECT 
        u2.username, u2.userid, u2.email, u2.avatar_image 
        FROM users as u 
        INNER JOIN user_followers as uf 
        ON uf.userid=u.userid 
        INNER JOIN users AS u2 
        ON uf.follows_userid=u2.userid
        WHERE u.username=$1`, [username]);

        return res.json(rows);
    } catch(e) {
        return res.status(400).json({
            status: "failed",
            error: "The database failed to respond. Please refresh and try again",
            details:e
        });
    }
});

// checks whether user1 is following user2
router.get('/isfollowing/:username1/:username2', async (req, res) => {
    const username1 = req.params.username1;
    const username2 = req.params.username2;

    if (username1 === username2) {
        return res.json({isFollowing: true});
    }

    try {
        const { rows } = await db.query(`SELECT COUNT(*) 
        FROM users AS u INNER JOIN user_followers AS uf
        ON uf.userid=u.userid
        INNER JOIN users AS u2
        ON uf.follows_userid=u2.userid
        WHERE u.username=$1 AND u2.username=$2`, [username1, username2]);

        const count = parseInt(rows[0].count);
        if (count <= 0) {
            return res.json({isFollowing: false})
        } else {
            return res.json({isFollowing: true});
        }
    } catch(e) {
        return res.status(400).json({
            status: "failed",
            error: "The database failed to respond. Please refresh and try again",
            details:e
        });
    }
});

// user1 follows user2
router.post('/follow/:username1/:username2', verifyToken, async (req, res) => {
    const username1 = req.params.username1;
    const username2 = req.params.username2;

    // do not continue if username1 === username2
    if (username1 === username2) {
        return res.status(400).json({
            status: "failed",
            error: "Same User",
            details: "User cannot follow himself/herself"
        });
    }

    // get userid of username1 and username2
    const getUserid1 = db.query(`SELECT userid FROM users WHERE username=$1`, [username1]);
    const getUserid2 = db.query(`SELECT userid FROM users WHERE username=$1`, [username2]);

    const [{rows: userid1row}, {rows: userid2row}] = await Promise.all([getUserid1, getUserid2]);
    
    if (userid1row.length <=0 || userid2row.length <= 0) {
        return res.status(400).json({
            status: "failed",
            error: "User not found",
            details: "One or more of the usernames provided could not be found"
        });
    }

    const {userid: userid1} = userid1row[0];
    const {userid: userid2} = userid2row[0];

    // add them to the user_followers table
    try {
        await db.query(`INSERT INTO user_followers VALUES ($1, $2)`, [userid1, userid2]);
        return res.json({status: "success"});
    } catch(e) {
        return res.status(400).json({
            status: "failed",
            error: "The database failed to respond. Please refresh and try again",
            details:e
        });
    }
    
});

// user1 unfollows user2
router.post('/unfollow/:username1/:username2', verifyToken, async (req, res) => {
    const username1 = req.params.username1;
    const username2 = req.params.username2;

    // do not continue if username1 === username2
    if (username1 === username2) {
        return res.status(400).json({
            status: "failed",
            error: "Same User",
            details: "User cannot unfollow himself/herself"
        });
    }

    // get userid of username1 and username2
    const getUserid1 = db.query(`SELECT userid FROM users WHERE username=$1`, [username1]);
    const getUserid2 = db.query(`SELECT userid FROM users WHERE username=$1`, [username2]);

    const [{rows: userid1row}, {rows: userid2row}] = await Promise.all([getUserid1, getUserid2]);
    
    if (userid1row.length <=0 || userid2row.length <= 0) {
        return res.status(400).json({
            status: "failed",
            error: "User not found",
            details: "One or more of the usernames provided could not be found"
        });
    }

    const {userid: userid1} = userid1row[0];
    const {userid: userid2} = userid2row[0];

    // add them to the user_followers table
    try {
        await db.query(`DELETE FROM user_followers WHERE userid=$1 AND follows_userid=$2`, [userid1, userid2]);
        return res.json({status: "success"});
    } catch(e) {
        return res.status(400).json({
            status: "failed",
            error: "The database failed to respond. Please refresh and try again",
            details:e
        });
    }
    
});

module.exports = router;