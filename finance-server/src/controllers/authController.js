const userDao = require('../dao/userDao');
const bcrypt = require('bcryptjs');

/* OLD CODE:
// We only needed these two tools before
*/

// NEW CODE:
// We bring in the tool to make digital tokens (ID cards)
const jwt = require('jsonwebtoken'); [cite_start]// [cite: 1204]

const authController = {

    login: async (request, response) => {
        // We look at the message to find email and password
        const { email, password } = request.body;

        // If something is missing, we stop here
        if (!email || !password) {
            return response.status(400).json({
                message: 'Email and Password are required'
            });
        }

        // We ask the Butler to find the user in the database
        const user = await userDao.findByEmail(email);

        if (user) {
            // We check if the password matches the lock
            const isPasswordMatched = await bcrypt.compare(password, user.password);
            
            /* OLD CODE:
            // Before, we just said "Success" and sent the user data back
            // if (isPasswordMatched) {
            //     return response.status(200).json({
            //         message: 'User authenticated',
            //         user: user
            //     });
            // }
            */

            // NEW CODE:
            if (isPasswordMatched) {
                // 1. We create a Digital Wristband (Token)
                // We write their Name and ID on it
                // We stamp it with our Secret Stamp (JWT_SECRET) so it's official
                // It is only good for 1 hour ('1h')
                const token = jwt.sign({
                    name: user.name,
                    email: user.email,
                    id: user._id
                }, process.env.JWT_SECRET, {
                    expiresIn: '1h'
                });

                // 2. We put this wristband inside a "Cookie" jar
                // 'httpOnly: true' means hackers can't steal it using Javascript
                // 'secure: true' means it only travels on safe roads (HTTPS)
                response.cookie('jwtToken', token, {
                    httpOnly: true,
                    secure: true,
                    domain: 'localhost',
                    path: '/'
                });

                // 3. We finally say "Success" and send the user info
                return response.status(200).json({
                    message: 'User authenticated',
                    user: user
                });
            }
        }
        
        // If password was wrong or user not found
        return response.status(400).json({
            message: 'Invalid email or password'
        });
    },

    register: async (request, response) => {
        const { name, email, password } = request.body;

        if (!name || !email || !password) {
            return response.status(400).json({
                message: 'Name, Email, Password are required'
            });
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
                return response.status(400).json({
                    message: 'User with the email already exist'
                });
            } else {
                return response.status(500).json({
                    message: "Internal server error"
                });
            }
        });
    }
};

module.exports = authController;