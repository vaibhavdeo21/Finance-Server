/* ==========================================================================
   FINAL VERSION: JWT & COOKIES
   --------------------------------------------------------------------------
   Includes Login, Register, Logout, and Token Verification.
   ========================================================================== */

const userDao = require('../dao/userDao');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); 
const { OAuth2Client } = require('google-auth-library');

const authController = {

    register: async (request, response) => {
        const { name, email, password } = request.body;

        if (!name || !email || !password) {
            return response.status(400).json({ message: 'Name, Email, Password are required' });
        }

        try {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // 1. Create the user
            const newUser = await userDao.create({
                name: name,
                email: email,
                password: hashedPassword
            });

            // 2. NEW: Create the Token immediately (Just like Login)
            const token = jwt.sign({
                name: newUser.name,
                email: newUser.email,
                id: newUser._id
            }, process.env.JWT_SECRET, { expiresIn: '1h' });

            // 3. NEW: Set the Cookie
            response.cookie('jwtToken', token, {
                httpOnly: true,
                secure: true,
                domain: 'localhost',
                path: '/'
            });

            // 4. Return the user info (so frontend knows they are logged in)
            return response.status(200).json({
                message: 'User registered and logged in',
                user: newUser
            });

        } catch (error) {
            if (error.code === 'USER_EXIST') {
                return response.status(400).json({ message: 'User with this email already exists' });
            } else {
                console.log(error);
                return response.status(500).json({ message: "Internal server error" });
            }
        }
    },

    login: async (request, response) => {
        const { email, password } = request.body;

        if (!email || !password) {
            return response.status(400).json({ message: 'Email and Password are required' });
        }

        const user = await userDao.findByEmail(email);

        if (user) {
            // If user has a Google ID but NO password, force Google Login
            if (user.googleId && !user.password) {
                return response.status(400).json({ 
                    message: 'Please log in using Google SSO' 
                });
            }

            // Standard Password Check
            if (user.password) {
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
    },

    googleSso: async (request, response) => {
        try {
            const { idToken } = request.body;
            if (!idToken) {
                return response.status(401).json({ message: 'Invalid request' });
            }

            const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
            const googleResponse = await googleClient.verifyIdToken({
                idToken: idToken,
                audience: process.env.GOOGLE_CLIENT_ID,
            });

            const payload = googleResponse.getPayload();
            const { sub: googleId, name, email } = payload;

            let user = await userDao.findByEmail(email);

            // If user does not exist, create them
            if (!user) {
                user = await userDao.create({
                    name: name,
                    email: email,
                    googleId: googleId,
                    // No password needed for SSO users
                });
            }

            // Generate Token (Same as manual login)
            const token = jwt.sign({
                name: user.name,
                email: user.email,
                id: user._id
            }, process.env.JWT_SECRET, { expiresIn: '1h' });

            // Set Cookie
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

        } catch (error) {
            console.log(error);
            return response.status(500).json({ message: 'Internal server error' });
        }
    }
};

module.exports = authController;
