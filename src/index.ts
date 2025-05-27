import 'dotenv/config';
import express from 'express';
import userRouter from './routes/userRoutes';

const app = express();
const port = process.env.PORT ;
console.log('server port:', port);
app.use(express.json());

app.use('/user', userRouter);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});