const express = require('express');
const app = express();
const connectDB=require(  './config/database');
const cookieParser = require('cookie-parser');
const cors=require('cors');
const http=require("http");
require('dotenv').config();

app.use(cors({
  origin: 'https://gittogether.me/',
  credentials: true,
}));
app.use(cookieParser()); 
app.use(express.json());

const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const requestsRouter = require('./routes/requests');  
const userRouter = require('./routes/user');
const initializeSocket = require("./utils/socket");
const chatRouter = require("./routes/chat");


app.use('/', authRouter);
app.use('/', profileRouter);
app.use('/', requestsRouter);
app.use('/', userRouter);

app.use("/", chatRouter);

const server = http.createServer(app);
initializeSocket(server);



connectDB()
.then(() => {
    console.log('Database connected successfully');
    server.listen(process.env.PORT,()=>{
    console.log(`Server is running on port ${process.env.PORT}`);
}) 
})
.catch(err => {
    console.error('Database connection failed:', err);
});



