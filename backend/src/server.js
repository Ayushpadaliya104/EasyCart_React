const app = require('./app');
const env = require('./config/env');
const connectDatabase = require('./config/db');
const bootstrapAdmin = require('./utils/bootstrapAdmin');

const startServer = async () => {
  try {
    await connectDatabase();
    await bootstrapAdmin(env);
    app.listen(env.port, () => {
      console.log(`Server running on port ${env.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
