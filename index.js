import express from 'express';
import fs from 'fs';
import multer from 'multer';
import cors from 'cors';
import dotenv from 'dotenv';
// import { v4 as uuidv4 } from 'uuid';

const PORT = process.env.PORT || 4441

dotenv.config();

import mongoose from 'mongoose';

import { registerValidation, loginValidation, postCreateValidation } from './validations.js';

import { handleValidationErrors, checkAuth } from './utils/index.js';

import { UserController, PostController } from './controllers/index.js';

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('DB ok'))
  .catch((err) => console.log('DB error', err));

const app = express();

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads');
    }
    cb(null, 'uploads');
  },
  filename: (_, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

app.use(express.json({ limit: '10mb' }));
app.use(cors());

app.use('/uploads', express.static('uploads'));

app.post('/auth/login', loginValidation, handleValidationErrors, UserController.login);
app.post('/auth/register', registerValidation, handleValidationErrors, UserController.register);
app.get('/auth/me', checkAuth, UserController.getMe);

app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
  res.json({
    url: `/uploads/${req.file.originalName}`,
  });
});


/*app.post('/upload', checkAuth, (req, res)=>{

const imageData = req.body.image
   const fileName = uuidv4()+'.jpg'
   // Преобразуем base64-данные изображения в бинарные данные
   const imageBuffer = Buffer.from(imageData, 'base64');

// Сохраняем изображение в директорию uploads
   fs.writeFile(`uploads/${fileName}`, imageBuffer, err => {
     if (err) {
       console.error('Ошибка при сохранении изображения:', err);
       res.status(500).json({ error: 'Ошибка при сохранении изображения' });
       return;
     }
     // Возвращаем URL загруженного изображения
     res.json({
       url: `/uploads/${fileName}`
     });
   });
 })*/


app.get('/tags', PostController.getLastTags);

app.get('/posts', PostController.getAll);
app.get('/posts/tags', PostController.getLastTags);
app.get('/posts/:id', PostController.getOne);
app.post('/posts', checkAuth, postCreateValidation, handleValidationErrors, PostController.create);
app.delete('/posts/:id', checkAuth, PostController.remove);
app.patch(
  '/posts/:id',
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  PostController.update,
);

app.listen(PORT, (err) => {
  if (err) {
    return console.log(err);
  }
  console.log('Server OK');
});


/*client.connect(err => {
  if(err){ console.error(err); return false;}
  // connection to mongo is successful, listen for requests
  app.listen(PORT, () => {
    console.log("Server OK");
  })
});*/


