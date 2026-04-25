const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./docs/swagger');
const placeRoutes = require('./routes/placeRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const { uploadsRoot } = require('./services/uploadService');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsRoot));

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.use('/api', placeRoutes);
app.use('/api', favoriteRoutes);
app.use('/api', uploadRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use((err, req, res, next) => {
    console.error(err.stack);
    if (err.name === 'MulterError') {
      return res.status(400).json({ error: err.message });
    }

    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }

    return res.status(500).json({ error: 'Something went wrong' });
});

module.exports = app;