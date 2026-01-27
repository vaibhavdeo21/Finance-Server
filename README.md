# 🚀 Expense Tracker Backend (MERN Class Project)

![NodeJS](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white) ![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge) ![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)

Welcome to the backend server for the **Expense Tracker** application! This project is being built step-by-step during my MERN Stack placement classes. 

This documentation covers every concept, function, and file we have created so far, explained simply so anyone can understand how the system works.

---

## 📚 Table of Contents
- [Project Overview](#-project-overview)
- [Tech Stack](#-tech-stack)
- [Folder Structure](#-folder-structure-mvc-architecture)
- [Concepts & Features](#-concepts--features)
- [How to Run](#-how-to-run)

---

## 🌟 Project Overview
This is a Node.js server that manages users and expense groups. It allows users to:
1.  **Register** securely.
2.  **Login** to their account.
3.  **Create Groups** to split expenses with friends.

We started with a simple server file and evolved it into a professional, structured backend using the **MVC** pattern.

---

## 🛠 Tech Stack
* **Node.js**: The runtime environment (our server engine).
* **Express.js**: A framework to build APIs easily.
* **MongoDB & Mongoose**: Our database and the tool to talk to it.
* **BcryptJS**: For encrypting passwords (security).
* **Dotenv**: For managing secret keys.

---

## 📂 Folder Structure (MVC Architecture)
We moved from writing everything in one file to using the **MVC (Model-View-Controller)** pattern to keep our code clean.

```text
expense-server/
├── node_modules/       # External libraries (dependencies)
├── src/
│   ├── controllers/    # The "Brain" - Handles logic (authController.js)
│   ├── dao/            # The "Butler" - Talks to DB (userDao.js, groupDao.js)
│   ├── model/          # The "Blueprint" - Data shapes (users.js, group.js)
│   └── routes/         # The "Traffic Cop" - URL directions (authRoutes.js)
├── .env                # Secret variables (ignored by Git)
├── package.json        # Project ID card & dependencies
└── server.js           # Main entry point (starts the server)
```

## 💡 Concepts & Features

### 1. Basic Server Setup
* **File:** `server.js`
* **What it does:** This is the headquarters. It starts the application, connects to the database, and listens for requests.
* **Key Code:**
    * `app.use(express.json())`: Middleware that allows our server to read JSON data sent by users.
    * `app.listen(5001)`: Opens the server for business on Port 5001.

### 2. REST APIs (Register & Login)
We created endpoints (URLs) that the frontend can call.
* **Register** (`POST /auth/register`): Accepts Name, Email, and Password.
* **Login** (`POST /auth/login`): Checks if the email and password match what we have in the database.

### 3. Refactoring to MVC
Writing all code in `server.js` is messy. We split it up:
* **Routes** (`src/routes/`): Defines the URLs (like `/auth/login`). It points to the Controller.
* **Controllers** (`src/controllers/`): Contains the actual logic (e.g., the `register` function). It checks for missing fields and asks the DAO to save data.
* **DAO** (`src/dao/`): "Data Access Object". It isolates database operations. If we change our database later, we only change this file.

### 4. Database Integration (MongoDB)
We replaced our temporary memory list with a real database.
* **Mongoose**: We use this library to connect to MongoDB.
* **Models** (`src/model/`):
    * **User Schema**: Defines that a User *must* have a `name`, `email` (unique), and `password`.
* **Connection**: In `server.js`, we connect using `mongoose.connect()` which returns a Promise (handles success or failure).

### 5. Security (Environment Variables & Encryption)
Safety first! We added security measures to protect user data.
* **Environment Variables (`.env`)**:
    * We use the `dotenv` library.
    * Instead of hardcoding the database password in the code, we put `MONGO_DB_CONNECTION_URI` in a hidden `.env` file.
    * `require('dotenv').config()` loads these secrets when the server starts.
* **Password Encryption (`bcryptjs`)**:
    * **Never save plain passwords!** We use `bcrypt` to scramble passwords.
    * **Salting**: We add random data (`salt`) to the password before scrambling it to make it un-hackable.
    * **Hashing**: The final scrambled password is saved to the DB.
    * **Comparison**: When logging in, we use `bcrypt.compare()` to check if the entered password matches the scrambled one.

### 6. Groups Feature
We added a feature to manage Expense Groups.
* **Group Model** (`src/model/group.js`): Defines a Group with a name, admin email, members list, and payment status.
* **Group DAO** (`src/dao/groupDao.js`):
    * `createGroup`: Saves a new group.
    * `updateGroup`: Updates details like name or description.
    * `addMembers`: Adds new people to the group using `$addToSet` (prevents duplicates).
    * `getGroupByEmail`: Finds all groups a specific user belongs to.

## 🏃 How to Run

**1. Install Dependencies**
Open your terminal and run:
```bash
npm install
```
**2. Setup Environment Create a .env file in the root folder and add your MongoDB URL:**
```Code snippet:
MONGO_DB_CONNECTION_URI=your_mongodb_connection_string
```
**3. Start the Server Run the following command to start the backend:**
```bash
npm start
```

**You should see "Server is running on port 5001" and "MongoDB Connected" in the console.**


