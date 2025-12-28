import express from 'express';
import "dotenv/config";
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/user';


const app = express();
app.use(express.json());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/test', (req, res) => {
  res.send('API is working');
});

app.use('/api/auth', userRoutes);


app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
})