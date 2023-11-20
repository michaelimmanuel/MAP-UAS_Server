const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();


async function createSpending(req, res) {
    const { amount, description, date, category } = req.body;
    const { id } = req.params;
    
    const spending = await prisma.spending.create({
        data: {
        amount,
        description,
        type : "spending",
        date,
        category,
        user: {
            connect: {
            id,
            },
        },
        },
    });
    
    res.status(201).json(spending);
    }