const express = require("express");

const app = express(); // Creates javascript object named app

app.use(express.json()); // Middleware (converts JSON into javascript objects)

let users = []; // Creating empty array of users so that whenevr new user is created it gets stored ove here

app.post('/register', (request, response) =>{ //if request coming matches with /register then this will get executed
    const {name, email, password} = request.body;
    
    if(!name || !email || !password){
        return response.status(400).json({
            message: 'Name, Email, Password are required'
        });
    }

    const newUser = {
        id: users.length + 1,
        name: name,
        email: email,
        password: password
    };

    users.push(newUser);

    return response.status(200).json({
        message: "User Registered Successfully!",
        user: { id: newUser.id }
    });
});

app.listen(3001, () => {
    console.log("Server is running on port 3001");
});