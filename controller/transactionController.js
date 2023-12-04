const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();


async function createSpending(req, res) {
    const { amount, description, date, name } = req.body;
    const { id } = req.params;
    
    // convert date from YYYY-MM-DD to datetime
    const formattedDate = new Date(date);

    console.log(req.body)
    
    const spending = await prisma.transaction.create({
        data: {
            name,
            amount : parseFloat(amount),
            desc : description,
            type : "spending",
            date : formattedDate,
            
        user: {
            connect: {
                id: parseInt(id),
            },
        },
        },
    });
    
    res.status(201).json(spending);
}

async function getSpendingByDay(req, res) {
    const { id } = req.params;
    // get spending from database and group by month
    const spending = await prisma.transaction.findMany({
        where: {
            userId: parseInt(id),
            type: "spending",
        },
        orderBy: {
            date: "desc",
        },
    });

    
    // group spending by day
    const spendingByDay = spending.reduce((acc, curr) => {
        const date = new Date(curr.date).toLocaleDateString();
        const total = acc[date] ? acc[date].total + curr.amount : curr.amount;
        const count = acc[date] ? acc[date].count + 1 : 1;
        const items = acc[date] ? [...acc[date].items, curr] : [curr];
        return {
            ...acc,
            [date]: {
                date,
                total,
                count,
                items,
        
            },
        };
    }, {});

    

    return res.status(200).json(spendingByDay);
}

async function getSpendingByMonth(req, res) {
    const { id } = req.params;
    // get spending from database and group by month
    const spending = await prisma.transaction.findMany({
        where: {
            userId: parseInt(id),
            type: "spending",
        },
        orderBy: {
            date: "desc",
        },
    });

    // group spending by month
    const spendingByMonth = spending.reduce((acc, curr) => {
        const date = new Date(curr.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        const total = acc[date] ? acc[date].total + curr.amount : curr.amount;
        const count = acc[date] ? acc[date].count + 1 : 1;
        const items = acc[date] ? [...acc[date].items, curr] : [curr];
        return {
            ...acc,
            [date]: {
                date,
                total,
                count,
                items,
            },
        };
    }, {});

    return res.status(200).json(spendingByMonth);
}

module.exports = {
    createSpending,
    getSpendingByDay,
    getSpendingByMonth
};
