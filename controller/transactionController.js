const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();



function formatDate(date) {
    // Ensure the input is a Date object
    if (!(date instanceof Date)) {
      return "Invalid Date";
    }
  
    // Get the individual components of the date and time
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const milliseconds = String(date.getMilliseconds()).padStart(3, '0');
  
    // Concatenate the components in the desired format
    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
  
    return formattedDate;
  }

async function createSpending(req, res) {
    const { amount, description, date, name } = req.body;
    const { id } = req.params;
    


    console.log(req.body)
    
    const spending = await prisma.transaction.create({
        data: {
            name,
            amount : parseFloat(amount),
            desc : description,
            type : "spending",
            date : date,
            
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
    
    console.log(spending)
    
    const spendingByDay = spending.reduce((acc, curr) => {
        const date = curr.date
        const total = acc[date] ? acc[date].total + curr.amount : curr.amount;
        const count = acc[date] ? acc[date].count + 1 : 1;
        const items = acc[date] ? [...acc[date].items, curr] : [curr];

        const formattedTotal = total.toLocaleString('en-US', {
            style: 'currency',
            currency: 'IDR',
        });
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

async function getDaySpending(req, res) {
    const { id } = req.params;
    const { date } = req.query;
    console.log(date)
    // get spending by date
    const spending = await prisma.transaction.findMany({
        where: {
            userId: parseInt(id),
            date: date,
            type: "spending",
        },
    });

    return res.status(200).json(spending);

}

module.exports = {
    createSpending,
    getSpendingByDay,
    getSpendingByMonth,
    getDaySpending
};
