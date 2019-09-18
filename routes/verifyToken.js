const jwt = require('jsonwebtoken');
const db = require('../db')
require('dotenv').config();

module.exports = async function(req, res, next) {
    // check for auth token in cookies
    const auth_token = req.cookies['auth-token'];

    // if no auth token, throw error
    if (!auth_token) return res.status(401).json({status: 'failed', error: 'Access denied: Not logged in. Please log in to continue'});

    try {
        // verify auth-token
        const verified = jwt.verify(auth_token, process.env.TOKEN_SECRET);
        console.log('AUTH TOKEN VERIFIED: verifytoken.js');

        // set user
        req.user = verified;
        // continue
        next();
    } catch(e) {
        // if auth-token is not verified (expired/doesnt exist), check refresh token
        res.clearCookie('auth-token');

        // get refresh token
        const refresh_token = req.cookies['refresh-token'];

        // if no refresh token throw error
        if (!refresh_token) {
            return res.status(401).json({status: 'failed', error: 'Access denied: Not logged in. Please log in to continue'});
        }
        
        try {
            // verify refresh token
            const {username, userid} = jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET);

            // check refresh token in database
            const {rows} = await db.query(`SELECT COUNT(*) FROM tokens WHERE refreshtoken=$1`, [refresh_token]);

            // if no refresh token in database, throw error
            if (parseInt(rows[0].count) <= 0) {
                return res.status(401).json({status: 'failed', error: 'Access denied: Refresh token not found in database. Please log in to continue'});
            }

            // create a new auth-token
            const updated_token = jwt.sign({username, userid}, process.env.TOKEN_SECRET, { expiresIn: parseInt(process.env.TOKEN_LIFE) });

            // set auth-token cookie
            res.cookie('auth-token', updated_token, {httpOnly: true, secure: process.env.NODE_ENV !== 'development'});

            // set user
            req.user = {username, userid};
            
            // continue
            next();
        } catch(e) {
            // if error, clear all cookies and throw error
            console.log('REFRESH TOKEN NOT VERIFIED: verifytoken.js');
            return res.status(401).clearCookie('refresh-token').clearCookie('auth-token').json({status: 'failed', error: 'Something went wrong, please log in again', details: e});
        }
    }
    // next();
}