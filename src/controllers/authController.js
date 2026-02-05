const userDao = require('../dao/userDao');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { validationResult } = require('express-validator');
const { ADMIN_ROLE } = require('../utility/userRoles'); // [cite: 7806]

const authController = {

    register: async (request, response) => {
        const { name, email, password } = request.body;
        if (!name || !email || !password) {
            return response.status(400).json({ message: 'Name, Email, Password are required' });
        }

        try {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Default register role can be handled in DAO or Schema, usually 'viewer' or 'admin' depending on logic
            // For now, we assume Schema default or specific logic isn't strictly defined in the prompt for Register
            const newUser = await userDao.create({
                name: name,
                email: email,
                password: hashedPassword
                // role: ADMIN_ROLE // Optional: Assign default role here if needed
            });

            // Issue Token with Role
            const token = jwt.sign({
                name: newUser.name,
                email: newUser.email,
                id: newUser._id,
                role: newUser.role
            }, process.env.JWT_SECRET, { expiresIn: '1h' });

            response.cookie('jwtToken', token, {
                httpOnly: true,
                secure: true,
                domain: 'localhost',
                path: '/'
            });

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

                    // 1. Issue Access Token with ROLE
                    const token = jwt.sign({
                        name: user.name,
                        email: user.email,
                        id: user._id,
                        role: user.role // [cite: 7858]
                    }, process.env.JWT_SECRET, { expiresIn: '1h' });

                    // 2. Issue Refresh Token with ROLE
                    const refreshToken = jwt.sign({
                        name: user.name,
                        email: user.email,
                        id: user._id,
                        role: user.role // [cite: 7865]
                    }, process.env.JWT_SECRET, { expiresIn: '7d' });

                    response.cookie('jwtToken', token, {
                        httpOnly: true,
                        secure: true,
                        domain: 'localhost',
                        path: '/'
                    });

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

            const verifyToken = (token) => {
                try {
                    return jwt.verify(token, process.env.JWT_SECRET);
                } catch (e) {
                    return null;
                }
            };

            let user = verifyToken(jwtToken);

            if (!user && refreshToken) {
                user = verifyToken(refreshToken);

                if (user) {
                    // Refresh Token is valid! Issue new Access Token (1h)
                    // Ensure we carry over the ROLE
                    const newToken = jwt.sign({
                        name: user.name,
                        email: user.email,
                        id: user.id,
                        role: user.role 
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

            response.json({
                user: {
                    name: user.name,
                    email: user.email,
                    _id: user.id || user._id, // Handle both id formats
                    role: user.role
                }
            });

        } catch (error) {
            console.log(error);
            return response.status(500).json({ message: 'Internal server error' });
        }
    },

    logout: async (request, response) => {
        response.clearCookie('jwtToken');
        response.clearCookie('refreshToken');
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

            if (!user) {
                user = await userDao.create({
                    name: name,
                    email: email,
                    googleId: googleId,
                    role: ADMIN_ROLE // [cite: 7894] Default new Google Users to Admin
                });
            }

            // Issue Token with ROLE
            const token = jwt.sign({
                name: user.name,
                email: user.email,
                id: user._id,
                role: user.role 
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

        } catch (error) {
            console.log(error);
            return response.status(500).json({ message: 'Internal server error' });
        }
    }
};

module.exports = authController;