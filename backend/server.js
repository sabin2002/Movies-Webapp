// server.js
// This is my main backend file for the Movie App project.

// I import express to create HTTP server and routes (GET, POST, etc.)
const express = require('express');

// CORS is needed because frontend (port 3000) and backend (port 5000) are different origins
const cors = require('cors');

// This is my own db.js file (the promise-based MySQL connection)
const db = require('./db');

// path is a built-in Node.js module to work with file/folder paths
const path = require('path');

// multer is for handling file uploads (for movie poster images)
const multer = require('multer');

// Here I actually create the express app object
const app = express();

// ====== MIDDLEWARE SECTION ======

// This allows requests from other origins (like React frontend on localhost:3000)
app.use(cors());

// This allows my backend to understand JSON body coming from frontend
// e.g. JSON.parse automatically
app.use(express.json());

// ====== MULTER SETUP FOR FILE UPLOADS ======

// I tell multer where to save uploaded files and how to name them
const storage = multer.diskStorage({
  // destination tells multer which folder to store images in
  destination: (req, file, cb) => {
    // __dirname = current folder (backend folder)
    // I join it with 'uploads' so images go into backend/uploads
    cb(null, path.join(__dirname, 'uploads'));
  },

  // filename tells multer how to rename the uploaded file
  filename: (req, file, cb) => {
    // I create a unique name using current time and random number
    const uniqueSuffix =
      Date.now() + '-' + Math.round(Math.random() * 1e9);

    // path.extname(file.originalname) gives extension such as .jpg or .png
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// I create an upload object. I will use upload.single('image') in my routes.
const upload = multer({ storage });

// This line makes the "uploads" folder public.
// So when I save image as /uploads/xxx.jpg, the browser can access it by URL.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ====== SIMPLE TEST ROUTES ======

// Health check route: I can open http://localhost:5000/api/health
// to see if my backend server is running.
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is working!' });
});

// Test database connection: useful for debugging MySQL connection
app.get('/api/test-db', async (req, res) => {
  try {
    // Simple query just to see if DB responds
    const [rows] = await db.query('SELECT 1 AS test');
    res.json({ success: true, rows });
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({ success: false, error: 'Database connection failed' });
  }
});

// ====== MOVIE ROUTES ======

// Get all movies from the database
app.get('/api/movies', async (req, res) => {
  try {
    // I select everything from movies table and order by id (latest first)
    const [rows] = await db.query('SELECT * FROM movies ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching movies:', err);
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
});
//...........add............
// Add a new movie (supports image from file upload or from link)
app.post('/api/movies', upload.single('image'), async (req, res) => {
  // I tagitke these values from the formData / JSON body
  // imageUrlLink is for when user types a URL instead of uploading file
  const { name, type, rating, imageUrlLink } = req.body;

  // I will decide the final image URL to save in database
  let finalImageUrl = null;

  // If user uploaded file, multer puts it in req.file
  if (req.file) {
    // For uploaded files I store path like /uploads/filename.jpg
    finalImageUrl = `/uploads/${req.file.filename}`;
  } else if (imageUrlLink) {
    // If user didn't upload file but gave a link, I store that link
    finalImageUrl = imageUrlLink;
  }

  // Basic validation: name is required
  if (!name) {
    return res.status(400).json({ error: 'Movie name is required' });
  }

  try {
    // rating might be empty string, so I convert it to number or null
    const numericRating =
      rating === undefined || rating === '' ? null : Number(rating);

    // Insert new movie into MySQL
    const [result] = await db.query(
      'INSERT INTO movies (name, type, rating, image_url) VALUES (?, ?, ?, ?)',
      [name, type || null, numericRating, finalImageUrl || null]
    );

    // After insert, I fetch the newly created row to send back to frontend
    const [rows] = await db.query('SELECT * FROM movies WHERE id = ?', [
      result.insertId,
    ]);

    // 201 means "Created"
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error adding movie:', err);
    res.status(500).json({ error: 'Failed to add movie' });
  }
});
//..............................


//UPDATE............................
// Update a movie (also supports new image file or new link)
app.put('/api/movies/:id', upload.single('image'), async (req, res) => {
  // I get the id from URL parameter /api/movies/:id
  const { id } = req.params;

  // I get data from body (formData)
  const { name, type, rating, imageUrlLink, currentImageUrl } = req.body;

  // Again, movie name is required
  if (!name) {
    return res.status(400).json({ error: 'Movie name is required' });
  }

  // Now I decide what the final image URL will be after update:
  // 1) If user uploaded a new file now, use that.
  // 2) Else if user typed a new link, use that.
  // 3) Else keep the old image URL from DB (currentImageUrl).
  let finalImageUrl = null;

  if (req.file) {
    finalImageUrl = `/uploads/${req.file.filename}`;
  } else if (imageUrlLink) {
    finalImageUrl = imageUrlLink;
  } else {
    finalImageUrl = currentImageUrl || null;
  }

  try {
    const numericRating =
      rating === undefined || rating === '' ? null : Number(rating);

    // Update row in database
    await db.query(
      'UPDATE movies SET name=?, type=?, rating=?, image_url=? WHERE id=?',
      [name, type || null, numericRating, finalImageUrl, id]
    );

    // Get updated row and send back to frontend
    const [rows] = await db.query('SELECT * FROM movies WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error('Error updating movie:', err);
    res.status(500).json({ error: 'Failed to update movie' });
  }
});
//........................................

//DELETE..................................................
// Delete a movie by id
app.delete('/api/movies/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Simple delete query
    await db.query('DELETE FROM movies WHERE id = ?', [id]);

    res.json({ message: 'Movie deleted successfully' });
  } catch (err) {
    console.error('Error deleting movie:', err);
    res.status(500).json({ error: 'Failed to delete movie' });
  }
});
//.....................................................

// ====== START SERVER ======

// I choose port 5000 for backend.
// Frontend will usually run on 3000 (React default).
const PORT = 5000;

// Here I start the server and print message in terminal so I know it is running
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
