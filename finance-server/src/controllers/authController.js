// We bring in the Butler (userDao) to help us talk to the database
const userDao = require('../dao/userDao');

// We bring in a security guard tool called 'bcryptjs' to lock (encrypt) passwords
const bcrypt = require('bcryptjs');

// OLD CODE (Refactored):
// const users = require('../dao/userDb'); // We used to use a fake list of users, but now we use a real database

const authController = {

    // This is the instruction set for LOGGING IN
    login: async (request, response) => {
        // We look inside the message sent to us and grab the email and password
        const { email, password } = request.body;

        // If the person forgot to send an email or password, we stop them!
        if (!email || !password) {
            return response.status(400).json({
                message: 'Email and Password are required'
            });
        }

        /* OLD CODE (Replaced by Database):
        // This is how we used to look for a user in a simple list (array)
        const user = users.find(u => u.email === email && u.password === password);
        */

        // NEW CODE:
        // We ask the Butler to find the user in the real database
        const user = await userDao.findByEmail(email);

        // If we found a user...
        if (user) {
            // ...we compare the password they sent with the locked password in the database
            const isPasswordMatched = await bcrypt.compare(password, user.password);
            
            // If the passwords match...
            if (isPasswordMatched) {
                return response.status(200).json({
                    message: 'User authenticated',
                    user: user
                });
            }
        }
        
        // If we didn't find the user OR the password was wrong
        return response.status(400).json({
            message: 'Invalid email or password'
        });
    },

    // This is the instruction set for REGISTERING (signing up)
    register: async (request, response) => {
        // We grab the name, email, and password from the message
        const { name, email, password } = request.body;

        // We check if any piece of information is missing
        if (!name || !email || !password) {
            return response.status(400).json({
                message: 'Name, Email, Password are required'
            });
        }

        /* OLD CODE (Replaced by Database):
        // We used to check our list to see if the email was taken
        const user = users.find(u => u.email === email);
        if (user) {
            return response.status(400).json({ message: `User already exist with email: ${email}` });
        }
        // We used to make a simple object and push it into a list
        const newUser = { id: users.length + 1, name, email, password };
        users.push(newUser);
        */

        // NEW CODE:
        // We create a "salt" which is random data to make the password even harder to guess
        const salt = await bcrypt.genSalt(10);
        // We mix the password with the salt to create a "Hashed" (scrambled) password
        const hashedPassword = await bcrypt.hash(password, salt);

        // We ask the Butler to create this new person in the database
        userDao.create({
            name: name,
            email: email,
            password: hashedPassword // We save the scrambled password, not the real one!
        })
        .then(u => {
            // If it worked, we send a success message back
            return response.status(200).json({
                message: 'User registered',
                user: { id: u._id }
            });
        })
        .catch(error => {
            // If the Butler says "USER_EXIST", we tell the user that email is taken
            if (error.code === 'USER_EXIST') {
                return response.status(400).json({
                    message: 'User with the email already exist'
                });
            } else {
                // If it's another error, we say "Server Error"
                return response.status(500).json({
                    message: "Internal server error"
                });
            }
        });
    }
};

[cite_start]// We share this Manager so the routes can use it [cite: 807]
module.exports = authController;