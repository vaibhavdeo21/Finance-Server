const groupDao = require("../dao/groupDao");

const groupController = {
    create: async (request, response) => {
        try {
            /* ==================================================================
               VERSION 1: MANUAL ADMIN ENTRY
               ------------------------------------------------------------------
               In the beginning, we asked the user to TYPE who the admin was.
               We trusted them blindly (which is not safe).
               ================================================================== */

            // const { name, description, adminEmail, membersEmail, thumbnail } = request.body;
            
            // // We manually started the list with the typed admin email
            // // let allMembers = [adminEmail]; 

            // // We created the group using that typed email
            // // await groupDao.createGroup({
            // //     name, description, adminEmail, allMembers, ...
            // // });


            /* ==================================================================
               FINAL VERSION: AUTOMATIC ADMIN (Security Guard)
               ------------------------------------------------------------------
               Now, the Security Guard (Middleware) tells us who the user is.
               We don't ask them. We know because they are logged in.
               ================================================================== */

            const {
                name,
                description,
                // adminEmail, // REMOVED: We don't ask for this anymore!
                membersEmail,
                thumbnail
            } = request.body;

            // NEW: We get the user info from the Token (Badge)
            const user = request.user; 

            // NEW: The admin is AUTOMATICALLY the person logged in
            let allMembers = [user.email];

            if (membersEmail && Array.isArray(membersEmail)) {
                allMembers = [...new Set([...allMembers, ...membersEmail])];
            }

            const newGroup = await groupDao.createGroup({
                name,
                description,
                adminEmail: user.email, // NEW: Using the secure email
                membersEmail: allMembers,
                thumbnail,
                paymentStatus: {
                    amount: 0,
                    currency: 'INR',
                    date: Date.now(),
                    isPaid: false
                }
            });

            response.status(200).json({
                message: 'Group created',
                groupId: newGroup._id
            });

        } catch (error) {
            console.log(error);
            response.status(500).json({
                message: "Internal server error"
            });
        }
    }
};

module.exports = groupController;