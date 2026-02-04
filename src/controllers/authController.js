/* ==========================================================================
   FINAL VERSION: JWT & COOKIES
   --------------------------------------------------------------------------
   Includes Login, Register, Logout, and Token Verification.
   ========================================================================== */

const userDao = require('../dao/userDao');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { validationResult } = require('express-validator');

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
        // 1. Validator Check [cite: 161]
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ errors: errors.array() });
        }

        const { email, password } = request.body;
        const user = await userDao.findByEmail(email);

        if (user) {
            if (user.googleId && !user.password) {
                return response.status(400).json({ message: 'Please log in using Google SSO' });
            }

            if (user.password) {
                const isPasswordMatched = await bcrypt.compare(password, user.password);
                if (isPasswordMatched) {

                    // 2. Issue Access Token (1 Hour)
                    const token = jwt.sign({
                        name: user.name,
                        email: user.email,
                        id: user._id
                    }, process.env.JWT_SECRET, { expiresIn: '1h' });

                    // 3. Issue Refresh Token (7 Days) [Ref: WhatsApp Image 1]
                    const refreshToken = jwt.sign({
                        name: user.name,
                        email: user.email,
                        id: user._id
                    }, process.env.JWT_SECRET, { expiresIn: '7d' });

                    // Set Access Cookie
                    response.cookie('jwtToken', token, {
                        httpOnly: true,
                        secure: true, // true if using https
                        domain: 'localhost',
                        path: '/'
                    });

                    // Set Refresh Cookie
                    response.cookie('refreshToken', refreshToken, {
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

    isUserLoggedIn: async (request, response) => {
        try {
            const { jwtToken, refreshToken } = request.cookies;

            // Helper to verify token
            const verifyToken = (token) => {
                try {
                    return jwt.verify(token, process.env.JWT_SECRET);
                } catch (e) {
                    return null;
                }
            };

            // 1. Try Access Token first
            let user = verifyToken(jwtToken);

            // 2. If Access Token invalid/expired, try Refresh Token [Ref: WhatsApp Image 1]
            if (!user && refreshToken) {
                user = verifyToken(refreshToken);

                if (user) {
                    // Refresh Token is valid! Issue new Access Token (1h)
                    const newToken = jwt.sign({
                        name: user.name,
                        email: user.email,
                        id: user.id
                    }, process.env.JWT_SECRET, { expiresIn: '1h' });

                    response.cookie('jwtToken', newToken, {
                        httpOnly: true,
                        secure: true,
                        domain: 'localhost',
                        path: '/'
                    });
                }
            }

            if (!user) {
                return response.status(401).json({ message: 'Unauthorized access' });
            }

            // Return user info
            // (You might want to fetch fresh user data from DB here to be safe)
            response.json({
                user: {
                    name: user.name,
                    email: user.email,
                    _id: user.id
                }
            });

        } catch (error) {
            console.log(error);
            return response.status(500).json({ message: 'Internal server error' });
        }
    },

    logout: async (request, response) => {
        response.clearCookie('jwtToken');
        response.clearCookie('refreshToken'); // Clear refresh token too
        response.json({ message: 'Logout successful' });
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
