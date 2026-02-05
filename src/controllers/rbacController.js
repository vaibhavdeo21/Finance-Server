const bcrypt = require('bcryptjs');
const rbacDao = require("../dao/rbacDao");
const { generateTemporaryPassword } = require("../utility/passwordUtil");
const emailService = require('../services/emailService');
const { permissions } = require('../utility/userRoles');

const rbacController = {
    create: async (request, response) => {
        try {
            const adminUser = request.user; // From authMiddleware
            const { name, email, role } = request.body;

            // 1. Check if the requester has permission to create users
            // (This allows Managers to potentially create Viewers if configured)
            // Note: Middleware usually handles this, but explicit check here is good too.
            
            // 2. Generate Temp Password
            const tempPassword = generateTemporaryPassword(8);
            
            // 3. Hash Password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(tempPassword, salt);

            // 4. Create User
            const newUser = await rbacDao.createUser({
                name,
                email,
                password: hashedPassword,
                role,
                adminId: adminUser.id
            });

            // 5. Send Email
            await emailService.send(
                email, 
                "Welcome to Expense App - Your Credentials", 
                `Hello ${name},\n\nYour account has been created.\nLogin with:\nEmail: ${email}\nPassword: ${tempPassword}\n\nPlease change your password after logging in.`
            );

            response.status(201).json({ message: "User created successfully", userId: newUser._id });

        } catch (error) {
            console.error(error);
            response.status(500).json({ message: "Error creating user" });
        }
    }
};

module.exports = rbacController;