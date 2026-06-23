import express from 'express';
import cors from 'cors';
import routes from './routes';
import { config } from './config';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', routes);
app.use('/uploads', express.static(config.uploadsDir));

app.listen(config.port, () => {
  console.log(`Backend listening on http://localhost:${config.port}`);
});
