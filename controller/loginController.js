const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Register a new user
async function register(req, res) {

    const { name, password, email } = req.body;
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user in the database
    const user = await prisma.user.create({
        data: {
            email,
            name,
            password: hashedPassword,
        },
    });

    res.status(200).json({ "msg" : "success" });

}

// Login an existing user
async function login(req, res) {
    const { email, password } = req.body;

    // Find the user in the database
    const user = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    // If the user doesn't exist, return an error
    if (!user) {
        return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Check if the password is correct
    const passwordMatch = await bcrypt.compare(password, user.password);

    // If the password is incorrect, return an error
    if (!passwordMatch) {
        return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Create a new token
    const token = jwt.sign({ userId: user.id }, process.env.TOKEN_SECRET);

    // Store the token in the database
    await prisma.token.create({
        data: {
            token,
            userId: user.id,
        },
    });

    // send cookie to user
    res.cookie('token', token, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year cookie
    });
    res.status(200).json({ "msg" : "success" });
}

module.exports = {
    register,
    login,
};
