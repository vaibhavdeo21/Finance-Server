/* ==========================================================================
   VERSION 1: THE BEGINNING (Day 1)
   --------------------------------------------------------------------------
   In the start, we wrote everything in this one file. 
   We kept users in a simple list (array) because we didn't have a database.
   ========================================================================== */

// const express = require('express');
// const app = express();
// app.use(express.json()); // This lets us read JSON messages

// // We created a fake list to hold users because we had no database house yet
// // let users = []; 

// // This was our first Register function right here in the main file!
// // app.post('/register', (request, response) => {
// //     const { name, email, password } = request.body;
// //     
// //     // We checked if anything was missing
// //     if (!name || !email || !password) {
// //         return response.status(400).json({ message: 'Name, Email, Password are required' });
// //     }
// //
// //     // We created a new user and added them to our list
// //     const newUser = {
// //         id: users.length + 1,
// //         name: name,
// //         email: email,
// //         password: password
// //     };
// //     users.push(newUser);
// //
// //     return response.status(200).json({ message: 'User registered', user: { id: newUser.id } });
// // });

// // app.listen(5001, () => { console.log('Server is running on port 5001'); });


/* ==========================================================================
   VERSION 2: CLEANING UP (Refactoring)
   --------------------------------------------------------------------------
   We moved the Register and Login logic to a separate folder (routes & controllers).
   But we still didn't have a database or secret keys.
   ========================================================================== */

// const express = require('express');
// const app = express();
// app.use(express.json());

// // We brought in the Traffic Map (routes)
// // const authRoutes = require('./src/routes/authRoutes');

// // We told the server to use the map
// // app.use('/auth', authRoutes);

// // app.listen(5001, () => { console.log('Server is running on port 5001'); });


/* ==========================================================================
   VERSION 3: ADDING DATABASE (MongoDB) & SECRETS (.env)
   --------------------------------------------------------------------------
   We added Mongoose to talk to the database.
   We added 'dotenv' to hide our passwords.
   ========================================================================== */

// require('dotenv').config(); // Load secrets
// const express = require('express');
// const mongoose = require('mongoose'); // Bring in the database tool
// const authRoutes = require('./src/routes/authRoutes');

// const app = express();
// app.use(express.json());

// // Connect to the real database house
// // mongoose.connect(process.env.MONGO_DB_CONNECTION_URI)
// //    .then(() => console.log('MongoDB Connected'))
// //    .catch((error) => console.log('Error Connecting to Database:', error));

// app.use('/auth', authRoutes);

// // app.listen(5001, () => { console.log('Server is running on port 5001'); });


/* ==========================================================================
   FINAL VERSION: THE COMPLETE SERVER (Today)
   --------------------------------------------------------------------------
   Now we have:
   1. Cookie Parser (to read cookies)
   2. Group Routes (to manage groups)
   ========================================================================== */

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

// NEW: We bring in the tool to read cookies
const cookieParser = require('cookie-parser');

const authRoutes = require('./src/routes/authRoutes');
const groupRoutes = require('./src/routes/groupRoutes');

const app = express();
app.use(express.json());

// NEW: We tell the server to use the Cookie Parser tool
app.use(cookieParser());

app.use('/auth', authRoutes);
app.use('/groups', groupRoutes);

mongoose.connect(process.env.MONGO_DB_CONNECTION_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch((error) => console.log('Error Connecting to Database:', error));

app.listen(5001, () => {
    console.log('Server is running on port 5001');
});