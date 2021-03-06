const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/UserRoute');
const postRoutes = require('./routes/PostRoute');
const protectedRoutes = require('./routes/protectedRoute');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// MIDDLEWARE
app.use('/api/users/updateuser', express.json({limit: '10mb'})); // changing the default request size limit from 100kb to 10mb
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(express.static(path.join(__dirname, "client", "build")));

// ROUTES
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/protected', protectedRoutes);

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "build", "index.html"));
})
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));