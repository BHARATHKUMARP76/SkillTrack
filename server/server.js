const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB Database
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`SkillTrack Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
});
