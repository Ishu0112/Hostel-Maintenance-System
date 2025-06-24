const express = require('express');
const cors = require('cors');
require('dotenv').config();
// Initialize the Express app
const app = express();
const pool = require('./db/connection'); // your mysql2 pool
const timezoneMiddleware = require('./middlewares/timezoneMiddleware');
// CORS configuration (must come before routes)
const corsOptions = {
  origin: "http://localhost:5173", // your frontend origin
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS","PATCH"],
  allowedHeaders: ["Content-Type","Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
// CORS configuration (must come before routes)
// const allowedOrigins = [
//   'http://localhost:5173',
//   'https://hostel-maintenance-system-frontend3.onrender.com'
// ];

// const corsOptions = {
//   origin: function (origin, callback) {
//     // Allow requests with no origin (like mobile apps, curl, postman) or if in allowed list
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error('CORS policy: This origin is not allowed'));
//     }
//   },
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
//   allowedHeaders: ["Content-Type", "Authorization"],
//   credentials: true
// };

// app.use(cors(corsOptions));
// app.options('*', cors(corsOptions));  // Handle preflight requests globally


app.use(express.json()); // Parse incoming JSON data
app.locals.pool = pool;

app.use(timezoneMiddleware);
//middleware to set date







// Use the authentication login route
// *******************************************************************************************
// STUDENT DASHBOARD ROUTES

const studentProfileRoute = require('./routes/studentDashboardRoutes/studentProfileRoute');
const complainHistoryRoute = require('./routes/studentDashboardRoutes/studentComplaintsHistoryRoute');
const recentComplaintsRouter = require('./routes/studentDashboardRoutes/studentRecentComplaintsRoute'); 
const studentAddComplaintRoute = require('./routes/studentDashboardRoutes/studentAddComplaintRoute');
const studentNotificationRoutes = require('./routes/studentDashboardRoutes/studentNotificationRoute');

// *******************************************************************************************
// ADMIN DASHBOARD ROUTES
const adminEngineerRoute = require('./routes/adminDashboardRoutes/adminEngineerRoute');
const adminComplaintRoute = require('./routes/adminDashboardRoutes/adminComplaintRoute');
const adminAssignmentRoute = require('./routes/adminDashboardRoutes/adminAssignmentRoute');
const adminProfileRoute = require('./routes/adminDashboardRoutes/adminProfileRoute'); // Admin profile route

// *******************************************************************************************
// ENGINEER DASHBOARD ROUTES
const engineerComplaintRoute = require('./routes/engineerDashboardRoutes/engineerComplaintRoute'); // Engineer complaint routes
const engineerProfileRoute = require('./routes/engineerDashboardRoutes/engineerProfileRoute'); // Engineer profile route
const engineerScheduledVisitsRoute = require('./routes/engineerDashboardRoutes/engineerScheduledVisitsRoute'); // Engineer scheduled visits route


const feedbackRoute = require('./routes/feedback'); // Import the feedback route


// Import the authentication routes
const authLogin = require('./routes/authLogin');

// *******************************************************************************************
// Admin routes
app.use('/api/admin', adminEngineerRoute);
app.use('/api/admin', adminComplaintRoute);
app.use('/api/admin', adminAssignmentRoute); // Uncomment if you have assignment routes
app.use("/api/admin", adminProfileRoute);
// app.use("/api/admin", adminProfileRoute);



// *******************************************************************************************
// Engineer routes
app.use('/api/engineer', engineerComplaintRoute); // Engineer complaint routes
app.use('/api/engineer', engineerProfileRoute);
app.use('/api/engineer', engineerScheduledVisitsRoute); // Engineer scheduled visits route
// *******************************************************************************************
// Engineer routes
app.use('/api/engineer', engineerComplaintRoute); // Engineer complaint routes






app.use('/api/student', studentProfileRoute);


app.use("/api/complaint-history", complainHistoryRoute);
app.use('/api/recent-complaints', recentComplaintsRouter); // Route for recent complaints


//notifications route 
app.use('/api/notifications', studentNotificationRoutes);

// Engineer Dashboard routes


// Authentication routes
 app.use('/api', authLogin); // Prefix `/api` for login routes


app.use('/api/complaints', studentAddComplaintRoute);
//feedback route
app.use('/api/feedback',feedbackRoute);





app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error stack trace
  res.status(500).send('Something broke!'); // Send generic error response
});

// Server start
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


