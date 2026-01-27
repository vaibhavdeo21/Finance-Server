// This tells the computer to load our secret variables from the .env file
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');

// We bring in our traffic map for authentication
const authRoutes = require('./src/routes/authRoutes');

/* OLD CODE:
// const app = express();
// app.use(express.json());
// let users = []; // We used to keep users in this simple box
*/

// NEW CODE:
const app = express();
app.use(express.json()); // This helps the server understand JSON messages

// We tell the server: "If anyone goes to /auth, look at the authRoutes map"
app.use('/auth', authRoutes);

/* OLD CODE (Direct Routes):
// app.post('/register', (req, res) => { ... });
*/

// We connect to the Database using the secret address in our .env file
mongoose.connect(process.env.MONGO_DB_CONNECTION_URI)
    .then(() => console.log('MongoDB Connected')) // If it works, say "Connected"
    .catch((error) => console.log('Error Connecting to Database:', error)); // If it fails, tell us the error

// The server starts listening on port 5001, like opening the shop for business
app.listen(5001, () => {
    console.log('Server is running on port 5001');
});