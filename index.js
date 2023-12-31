const express = require('express');
const app = express();


app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.use('/', require('./routes/user'));
app.use('/', require('./routes/transaction'));

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(3001, () => console.log('Server running on port 3001'));
module.exports = app;