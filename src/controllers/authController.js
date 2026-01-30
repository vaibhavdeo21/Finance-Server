/* ==========================================================================
   FINAL VERSION: JWT & COOKIES
   --------------------------------------------------------------------------
   Includes Login, Register, Logout, and Token Verification.
   ========================================================================== */

const userDao = require('../dao/userDao');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); 

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
                const token = jwt.sign({
                    name: user.name,
                    email: user.email,
                    id: user._id
                }, process.env.JWT_SECRET, { expiresIn: '1h' });

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
    },

    // NEW FUNCTION: Check if the user is logged in (Verify Token) [cite: 1295-1376]
    isUserLoggedIn: async (request, response) => {
        try {
            // 1. Get the token from the cookie
            const token = request.cookies?.jwtToken;

            // 2. If no token, they are not logged in
            if (!token) {
                return response.status(401).json({
                    message: 'Unauthorized access'
                });
            }

            // 3. Verify the token using our secret key
            jwt.verify(token, process.env.JWT_SECRET, (error, user) => {
                if (error) {
                    return response.status(401).json({
                        message: 'Invalid token'
                    });
                } else {
                    // 4. Token is valid! Send back the user info
                    response.json({
                        user: user
                    });
                }
            });

        } catch (error) {
            console.log(error);
            return response.status(500).json({
                message: 'Internal server error'
            });
        }
    },

    // NEW FUNCTION: Logout (Delete the Cookie) [cite: 1395-1411]
    logout: async (request, response) => {
        try {
            // Clear the cookie named 'jwtToken'
            response.clearCookie('jwtToken');
            response.json({ message: 'Logout successful' });
        } catch (error) {
            console.log(error);
            return response.status(500).json({
                message: 'Internal server error'
            });
        }
    }
};

module.exports = authController;