// App.js
// main page

import { useEffect, useState } from 'react';
import './App.css';

//importing two components to make buttons
import AddMovieForm from './AddMovieForm';    // for adding new movie
import EditMovieForm from './EditMovieForm';  // for editing existing movie


// FUNCTION PART
function App() {
  // array to store all movies coming from backend
  const [movies, setMovies] = useState([]);

  // showAddForm = when true, this shows AddMovieForm component instead of list
  const [showAddForm, setShowAddForm] = useState(false);

  // editingMovie = if not null, I show EditMovieForm for that movie
  const [editingMovie, setEditingMovie] = useState(null);

  // helper function: decide the correct image URL for each movie
  // sometimes image_url comes from uploads folder, sometimes it is a full link
  const getImageSrc = (movie) => {
    // if there is no image_url, I return null
    if (!movie.image_url) return null;

    // if path starts with "/uploads", it is a local file from backend
    // so we use backend port 5000---it is must to use
    if (movie.image_url.startsWith('/uploads')) {
      return `http://localhost:5000${movie.image_url}`;
    }

    // if not uploads, then I assume it is already a full external URL
    return movie.image_url;
  };

  // This function will load all movies from my Node.js backend/database
  const fetchMovies = async () => {
    try {
      //  GET request to my backend API
      const res = await fetch('http://localhost:5000/api/movies');

      //  response will convert  to JSON
      const data = await res.json();

      // I save the result inside movies state variable
      setMovies(data);
    } catch (err) {
      console.error('Error fetching movies:', err);
    }
  };

  // useEffect with empty [] means this code runs only one time
  // when the component mounts (page first loads)
  useEffect(() => {
    fetchMovies();
  }, []);

  //function to delete movie
  const deleteMovie = async (id) => {
    // First I show a confirmation popup so the user can cancel by mistake
    const confirmDelete = window.confirm("Are you sure you want to delete this movie?");

    // If user clicks Cancel, I just return and do nothing
    if (!confirmDelete) return;

    try {
      // I send DELETE request to backend for that movie id
      const res = await fetch(`http://localhost:5000/api/movies/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // If delete is successful, I reload the list of movies
        fetchMovies();
      } else {
        console.error("Failed to delete movie");
      }
    } catch (err) {
      console.error("Error deleting movie:", err);
    }
  };

  // FUNCTION PART END

  // If showAddForm is true, I only show the AddMovieForm component
  // instead of the main list page.
  if (showAddForm) {
    return (
      <div className="container py-4">
        <AddMovieForm
          // If user clicks Cancel button inside AddMovieForm
          onCancel={() => setShowAddForm(false)}
          // If adding is successful, I go back to list and refresh data
          onSuccess={() => {
            setShowAddForm(false);
            fetchMovies();
          }}
        />
      </div>
    );
  }

  // If editingMovie is not null, I show EditMovieForm for that movie
  if (editingMovie) {
    return (
      <div className="container py-4">
        <EditMovieForm
          movie={editingMovie}
          // Cancel will clear editingMovie and go back to list
          onCancel={() => setEditingMovie(null)}
          // On success I also clear editingMovie and reload movies
          onSuccess={() => {
            setEditingMovie(null);
            fetchMovies();
          }}
        />
      </div>
    );
  }

  // HTML part (main list page)
  return (
    <div className="container py-4">
      {/* Top image and title */}
      {/* NOTE: this path is from my local PC, so it might not show in real browser,
          but I keep it here for my own project image. */}
    

      <h1 className="text-center mb-4">List of movies</h1>

      {/* Add button: this opens AddMovieForm when clicked */}
      <div className="mb-4">
        <button
          className="btn btn-light border px-4 py-2 fs-4"
          onClick={() => setShowAddForm(true)}
        >
          Add
        </button>
      </div>

      {/* Movie cards */}
      <div className="row">
        {movies.map((movie) => (
          <div className="col-md-3 mb-4" key={movie.id}>
            <div className="card shadow-sm movie-card">
              {/* Image area */}
              <div className="movie-image d-flex align-items-center justify-content-center">
                {movie.image_url ? (
                  <img
                    src={getImageSrc(movie)}
                    alt={movie.name}
                    className="imgtt"
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <span className="text-white fs-4">IMAGE</span>
                )}
              </div>

              {/* Info area */}
              <div className="p-3 movie-info">
                {/* I used text-blacksmall as my own class name style */}
                <p className="mb-1 text-blacksmall">Name: {movie.name}</p>
                <p className="mb-1 text-blacksmall">Release Date: {movie.type}</p>
                <p className="mb-2 text-blacksmall">Ratings: {movie.rating}/10</p>

                <div className="d-flex justify-content-between">
                  {/* When I click Edit, I set editingMovie to this movie object */}
                  <button
                    className="btn btn-sm btn-primary px-3"
                    onClick={() => setEditingMovie(movie)}
                  >
                    Edit
                  </button>

                  {/* Delete button */}
                  <button
                    className="btn btn-sm btn-danger px-3"
                    onClick={() => deleteMovie(movie.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* If there are no movies, I show this message */}
        {movies.length === 0 && (
          <p>No movies found. Add some using the API or phpMyAdmin.</p>
        )}
      </div>
    </div>
  );
}

export default App;
