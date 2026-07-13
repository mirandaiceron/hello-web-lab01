import express from 'express';
import pagesRouter from './routes/pages.js';
import apiRouter from './routes/api.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use('/', pagesRouter); //From routes that start with / use the routes defined in pages.js 
//express looks in pages.js and finds router.get('/', ...)

app.use('/api', apiRouter); //From routes that start with / use the routes in api.js

app.use((req, res) => {
  res.status(404).send('Page not found.');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});