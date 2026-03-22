// require('dotenv').config();
// const express = require('express');
// const mongoose = require('mongoose');
// const session = require('express-session');
// const MongoStore = require('connect-mongo');
// const path = require('path');

// const authRoutes = require('./routes/auth');
// const studentRoutes = require('./routes/student');
// const adminRoutes = require('./routes/admin');

// const app = express();

// // ─── MongoDB Connection ───────────────────────────────────────────────────────
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log('✅ MongoDB Connected'))
//   .catch(err => console.error('❌ MongoDB Error:', err));

// // ─── Middleware ───────────────────────────────────────────────────────────────
// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());
// app.use(express.static(path.join(__dirname, 'public')));

// // ─── Session ──────────────────────────────────────────────────────────────────
// app.use(session({
//   secret: process.env.SESSION_SECRET,
//   resave: false,
//   saveUninitialized: false,
//   store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
//   cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
// }));

// // ─── View Engine ──────────────────────────────────────────────────────────────
// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views'));

// // ─── Routes ───────────────────────────────────────────────────────────────────
// app.use('/', authRoutes);
// app.use('/', studentRoutes);
// app.use('/', adminRoutes);

// // ─── Start Server ─────────────────────────────────────────────────────────────
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running at http://localhost:${PORT}`);
// });




require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');

const authRoutes    = require('./routes/auth');
const studentRoutes = require('./routes/student');
const adminRoutes   = require('./routes/admin');

const app = express();

// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/', authRoutes);
app.use('/', studentRoutes);
app.use('/', adminRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});