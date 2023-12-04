const bcrypt = require('bcryptjs');
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

    res.status(200).json(user);

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
    console.log(user.id, token);

    // send user id and token back to the client
    res.status(200).json({ id: user.id, token, name: user.name });

}

async function getProfile(req, res) {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
        where: {
            id: parseInt(id),
        },
    });

    res.status(200).json(user);
}

async function logout(req, res) {
    const { id } = req.params;

    // Delete the token from the database
    await prisma.token.deleteMany({
        where: {
            userId: parseInt(id),
        },
    });

    res.status(200).json({ message: 'Logout successful' });
}

module.exports = {
    register,
    login,
};
