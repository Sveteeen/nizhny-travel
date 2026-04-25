require('dotenv').config();
const { sequelize } = require('./db/models');
const app = require('./app');

const PORT = process.env.PORT || 5000;

(async function start() {
    try {
      await sequelize.authenticate();
      console.log('Sequelize: соединение с PostgreSQL установлено.');
    } catch (err) {
      console.error('Sequelize: не удалось подключиться к БД:', err.message);
      process.exit(1);
    }
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Swagger docs: http://localhost:${PORT}/api-docs`);
    }).on('error', (err) => {
      console.error('Server failed to start:', err.message);
    });
})();