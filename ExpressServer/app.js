const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/', (req, res) => {
    console.log('Received webhook:', req.body);
    res.sendStatus(200);
});

app.listen(PORT, '0.0.0.0',  () => {
    console.log(`Server is running on port ${PORT}`);
});
