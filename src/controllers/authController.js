/* ==========================================================================
   VERSION 1: FAKE DATABASE (Array)
   --------------------------------------------------------------------------
   We used a file called 'userDb' which was just a list [].
   We saved plain passwords (very bad!).
   ========================================================================== */

// const users = require('../dao/userDb'); // This was our fake list

// const authController = {
//     register: (request, response) => {
//         const { name, email, password } = request.body;
//         
//         // We checked our list to see if the user existed
//         // const user = users.find(u => u.email === email);
//         // if (user) { return response.status(400).json({ message: `User already exist` }); }
//
//         // We just pushed the data into the array
//         // const newUser = { id: users.length + 1, name, email, password };
//         // users.push(newUser);
//         
//         // return response.status(200).json({ message: 'User registered' });
//     },
//     
//     login: (request, response) => {
//         const { email, password } = request.body;
//         // We checked if the password matched exactly (Plain Text)
//         // const user = users.find(u => u.email === email && u.password === password);
//         // if (user) { return response.status(200).json({ message: 'User authenticated' }); }
//     }
// };


/* ==========================================================================
   VERSION 2: REAL DATABASE (MongoDB) & ENCRYPTION
   --------------------------------------------------------------------------
   We replaced the array with 'userDao' to talk to MongoDB.
   We added 'bcrypt' to scramble passwords.
   ========================================================================== */

// const userDao = require('../dao/userDao');
// const bcrypt = require('bcryptjs');

// const authController = {
//     register: async (request, response) => {
//         const { name, email, password } = request.body;
//         
//         // Scramble the password!
//         // const salt = await bcrypt.genSalt(10);
//         // const hashedPassword = await bcrypt.hash(password, salt);
//
//         // Save to real database
//         // userDao.create({ name, email, password: hashedPassword })
//         //     .then(u => response.status(200).json({ message: 'User registered' }));
//     },
//
//     login: async (request, response) => {
//         const { email, password } = request.body;
//         const user = await userDao.findByEmail(email);
//
//         // Compare the scrambled password
//         // if (user) {
//         //     const isPasswordMatched = await bcrypt.compare(password, user.password);
//         //     if (isPasswordMatched) {
//         //         return response.status(200).json({ message: 'User authenticated', user });
//         //     }
//         // }
//     }
// };


/* ==========================================================================
   FINAL VERSION: JWT & COOKIES (Today)
   --------------------------------------------------------------------------
   Now, when you login, we give you a Digital ID (Token) and put it in a Cookie.
   ========================================================================== */

const userDao = require('../dao/userDao');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // NEW: Tool for making tokens

const authController = {

    login: async (request, response) => {
        const { email, password } = request.body;

        if (!email || !password) {
            return response.status(400).json({ message: 'Email and Password are required' });
        }

        const user = await userDao.findByEmail(email);

        if (user) {
            const isPasswordMatched = await bcrypt.compare(password, user.password);
            
            if (isPasswordMatched) {
                // NEW: Create the Digital ID Card (Token)
                const token = jwt.sign({
                    name: user.name,
                    email: user.email,
                    id: user._id
                }, process.env.JWT_SECRET, { expiresIn: '1h' });

                // NEW: Put the ID Card in a Cookie Jar
                response.cookie('jwtToken', token, {
                    httpOnly: true,
                    secure: true,
                    domain: 'localhost',
                    path: '/'
                });

                return response.status(200).json({
                    message: 'User authenticated',
                    user: user
                });
            }
        }
        
        return response.status(400).json({ message: 'Invalid email or password' });
    },

    register: async (request, response) => {
        const { name, email, password } = request.body;

        if (!name || !email || !password) {
            return response.status(400).json({ message: 'Name, Email, Password are required' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        userDao.create({
            name: name,
            email: email,
            password: hashedPassword
        })
        .then(u => {
            return response.status(200).json({
                message: 'User registered',
                user: { id: u._id }
            });
        })
        .catch(error => {
            if (error.code === 'USER_EXIST') {
                return response.status(400).json({ message: 'User with the email already exist' });
            } else {
                return response.status(500).json({ message: "Internal server error" });
            }
        });
    }
};

module.exports = authController;