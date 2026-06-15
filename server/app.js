const express = require('express') ;
const mongoose = require('mongoose') ;
require('dotenv').config() ;
const cors = require('cors') ;
const helmet = require('helmet') ;
const morgan = require('morgan') ;

const port = 5000 ;
const app = express() ;

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);


// sabse pehle helmet lagao with strict CSP
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://images.unsplash.com"], 
        connectSrc: ["'self'", ...allowedOrigins],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
// phir morgan lagao jo saare logs record karega 
app.use(morgan('dev')) ;
// fir cors laga ke usme forntend wale website ko access do with strict settings
app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);
// a middleware that binds incoming data with the req.body object 
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log(" MongoDb connection has been established !"))

// wriing the best readable format of connection error 
.catch(err => {
    console.error("❌ MongoDB Connection Failed");
    console.error("Reason:", err.message);

    if (err.code) {
        console.error("Error Code:", err.code);
    }

    if (err.name) {
        console.error("Error Name:", err.name);
    }

    // console.error("Stack (debug only):", err.stack);
});




//  ACcessing Routes 
app.use('/api/users', require('./routes/userRoutes') );


app.use('/api/auth', require('./routes/auth') );
app.use('/api/issues', require('./routes/issues') );
app.use('/api/stats', require('./routes/stats') );

// Ping route for keep-awake cron jobs (e.g. Render)
app.get('/api/ping', (req, res) => {
    res.status(200).json({ success: true, message: 'Server is awake' });
});



// only for testing the environment variables 
// const script = "checking Environmet Variables " ;
// console.log(script , process.env.MONGODB_URI) ;
// console.log(script , process.env.PORT) ;


// app.get('/' , (req,res)=> {
//     res.send('Listening on the route "/" ') ;
// })

app.listen( process.env.PORT || port , () => {
 console.log("Server is listening" ) ;
})