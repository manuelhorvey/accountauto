const express = require('express');
const session = require('express-session');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

// Init app
const app = express();

// CORS config
const corsOptions = {
  origin: "http://localhost:3000", // Frontend origin
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // Required for sending cookies
};
app.use(cors(corsOptions));

//Body parser
app.use(express.json());

//Session middleware AFTER cors
app.use(session({
  secret: process.env.SESSION_SECRET || "supersecretkey",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set true only in production with HTTPS
    httpOnly: true,
    maxAge: 1000 * 60 * 60, // 1 hour
  }
}));

//Connect DB
connectDB();

// Test route
app.get('/', (req, res) => {
  res.send('Dan Saviour Backend Running');
});

//Routes
const authRoutes = require("./routes/auth");
const clientRoutes = require("./routes/clients");
const statementsRoutes = require("./routes/statements");
const employeeRoutes = require("./routes/employees");
const reportRoutes = require("./routes/reports");

app.use("/api/auth", authRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/statements", statementsRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/reports", reportRoutes);

//Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
