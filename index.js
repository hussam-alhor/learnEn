const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./src/config/db');
// const { errorHandler } = require('./src/middleware/error.middleware');
// const allApiRoutes = require('./src/routes/index');



dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.get('/', (req, res) => {
  res.send('API is running...');
});

// routes
app.use("/api/auth" , require("./src/routes/authRoutes"))

// app.use(errorHandler);


// running
const PORT = process.env.PORT;
app.listen(PORT, ()=> console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`))
