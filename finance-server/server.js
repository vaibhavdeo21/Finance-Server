require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose'); // Import Mongoose for MongoDB interaction
const authRoutes = require('./src/routes/authRoutes'); // Import authentication routes

const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Connect to MongoDB
// Note: The connection string is empty in the source, usually this would be process.env.MONGO_URI
mongoose.connect("process.env.MONGO_DB_CONNECTION_URI") //we shouldn't push this connection uri or .dotenv file in github
  .then(() => console.log('MongoDB Connected'))
  .catch((error) => console.log('Error Connecting to Database:', error));

/* // OLD CODE (Source 1): In-memory user storage
// let users = [];
*/

// Use the auth routes for any requests to /auth
app.use('/auth', authRoutes);

/* // OLD CODE (Source 1): Inline Register Route (Before Refactoring)
// app.post('/register', (request, response) => {
//     const { name, email, password } = request.body;
//     if (!name || !email || !password) {
//         return response.status(400).json({ message: 'Name, Email, Password are required' });
//     }
//     const newUser = {
//         id: users.length + 1,
//         name: name,
//         email: email,
//         password: password
//     };
//     users.push(newUser);
//     return response.status(200).json({ message: 'User registered', user: { id: newUser.id } });
// });
*/

const PORT = 5001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});