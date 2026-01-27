require('dotenv').config(); // Load the secret keys from the .env file immediately 

const express = require('express'); // Bring in the Express tool
const mongoose = require('mongoose'); // Bring in the Mongoose tool
const authRoutes = require('./src/routes/authRoutes'); // Bring in our list of valid website addresses (routes)

const app = express(); // Create our application (the shop)

// This line lets our app understand messages sent in JSON format (like a translator)
app.use(express.json());

// Connect to the database using the secret address we stored in the .env file
// process.env.MONGO_DB_CONNECTION_URI grabs the value from that file 
mongoose.connect(process.env.MONGO_DB_CONNECTION_URI)
  .then(() => console.log('MongoDB Connected')) // If successful, say "Connected"
  .catch((error) => console.log('Error Connecting to Database:', error)); // If it fails, show the error

// If anyone visits the address starting with /auth, send them to our authRoutes manager
app.use('/auth', authRoutes);

const PORT = 5001; // The specific door number our server listens on
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`); // Tell us the server is ready
});