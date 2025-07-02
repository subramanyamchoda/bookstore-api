const express = require('express');
const app=express();
app.use(express.json());
const port=5000;

const userRouter = require('./routes/userRoutes');
const bookRouter = require('./routes/bookRoutes');

app.use('/users', userRouter);
app.use('/books', bookRouter);


app.listen(port,()=> console.log(`Server is running on port ${port}`));