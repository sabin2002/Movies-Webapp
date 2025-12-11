// EditMovieForm.js
// This component is used for editing an existing movie.
// I reuse similar layout as AddMovieForm, but initial values come from props.

import { useState } from "react";
import "./App.css";

function EditMovieForm({ movie, onCancel, onSuccess }) {
  // I pre-fill the inputs with current movie values
  const [name, setName] = useState(movie.name || "");
  const [type, setType] = useState(movie.type || "");
  const [rating, setRating] = useState(movie.rating || "");
  const [imageUrl, setImageUrl] = useState(movie.image_url || "");
  const [selectedFile, setSelectedFile] = useState(null); // new file if user uploads

  // This function will run when I click Save button
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Movie name is required");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("type", type);
      formData.append("rating", rating);
      // new link typed by user
      formData.append("imageUrlLink", imageUrl);
      // old image URL so backend can keep it if user doesn't change anything
      formData.append("currentImageUrl", movie.image_url || "");

      if (selectedFile) {
        // new image file from PC if chosen
        formData.append("image", selectedFile);
      }

      // I send PUT request to backend to update this movie
      const res = await fetch(
        `http://localhost:5000/api/movies/${movie.id}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (res.ok) {
        onSuccess(); // back to list and refresh
      } else {
        alert("Failed to update movie");
      }
    } catch (err) {
      console.error("Error updating movie:", err);
      alert("Error updating movie");
    }
  };

  return (
    <div className="add-form-wrapper">
      <h1 className="text-center mb-4">Update movie</h1>

      <form onSubmit={handleSubmit}>
        {/* Row 1 - Movie name */}
        <div className="add-form-row mb-3">
          <div className="add-form-label">Movie name:</div>
          <input
            className="add-form-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Row 2 - Type */}
        <div className="add-form-row mb-3">
          <div className="add-form-label">Released Date:</div>
          <input
            className="add-form-input"
            type="text"
            value={type}
            onChange={(e) => setType(e.target.value)}
          />
        </div>

        {/* Row 3 – Upload image */}
        <div className="add-form-row mb-3">
          <div className="add-form-label">Upload image:</div>

          <div style={{ display: "flex", gap: "10px", width: "100%" }}>
            {/* Upload from PC */}
            <label className="upload-btn">
              Browse from PC
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setSelectedFile(file);
                    // I could also clear link if I want only file
                    // setImageUrl("");
                  }
                }}
              />
            </label>

            {/* Add or change link */}
            <input
              className="add-form-input"
              type="text"
              placeholder="Add or change link"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>
        </div>

        {/* Row 4 - Rating */}
        <div className="add-form-row mb-4">
          <div className="add-form-label">Rating:</div>
          <input
            className="add-form-input"
            type="number"
            step="0.1"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
          />
        </div>

        {/* Buttons */}
        <div className="d-flex gap-2">
          <button type="submit" className="add-form-button flex-grow-1">
            Save
          </button>
          <button
            type="button"
            className="add-form-button flex-grow-1"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditMovieForm;
