 /* // OLD CODE (Source 2): Imported the in-memory array
// const users = require('../dao/userDb');
*/
 /* // OLD CODE (Source 2): Synchronous Array Find
        // const user = users.find(u => u.email === email && u.password === password);
        // if (user) {
        //     return response.status(200).json({ message: 'User authenticated', user: user });
        // } else {
        //     return response.status(400).json({ message: 'Invalid email or password' });
        // }
        */
       
        /* // OLD CODE (Source 2): Array Check and Push
        // const user = users.find(u => u.email === email);
        // if (user) {
        //     return response.status(400).json({ message: `User already exist with email: ${email}` });
        // }
        // const newUser = {
        //     id: users.length + 1,
        //     name: name,
        //     email: email,
        //     password: password
        // };
        // users.push(newUser);
        // return response.status(200).json({ message: 'User registered', user: { id: newUser.id } });
        */

        // UPDATED (Source 3): Use DAO to create user

        
// UPDATED: Import the DAO (Data Access Object)
const userDao = require('../dao/userDao');
const bcrypt = require('bcryptjs');//for encrypting passwords

const authController = {

    // Login Logic
    login: async (request, response) => {
        const { email, password } = request.body;

        if (!email || !password) {
            return response.status(400).json({
                message: 'Email and Password are required'
            });
        }

        // UPDATED (Source 3): Async DB call
        const user = await userDao.findByEmail(email);

        const isPasswordMatched = await bcrypt.compare(password, user.password);
        // Simple text comparison for password (in real apps, use hashing!)
        if (user && user.password === password) {
            return response.status(200).json({
                message: 'User authenticated',
                user: user
            });
        } else {
            return response.status(400).json({
                message: 'Invalid email or password'
            });
        }
    },

    // Register Logic
    register: async (request, response) => {
        const { name, email, password } = request.body;

        if (!name || !email || !password) {
            return response.status(400).json({
                message: 'Name, Email, Password are required'
            });
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);// for encrypting the password

        userDao.create({
            name: name,
            email: email,
            password: hashedPassword
        }).then(u => {
            return response.status(200).json({
                message: 'User registered',
                user: { id: u._id } // MongoDB uses _id
            });
        }).catch(error => {
            // Handle the custom error thrown by DAO
            if (error.code === 'USER_EXIST') {
                console.log(error);
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