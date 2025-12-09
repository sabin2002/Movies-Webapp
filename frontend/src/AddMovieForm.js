// AddMovieForm.js
// This component is used to add a new movie.
// It supports both uploading image from PC and adding image link.

import { useState } from "react";
import "./App.css";

function AddMovieForm({ onCancel, onSuccess }) {
  // These are my input states for the form
  const [name, setName] = useState("");          // movie name
  const [type, setType] = useState("");          // release date / type
  const [rating, setRating] = useState("");      // rating out of 10
  const [imageUrl, setImageUrl] = useState("");  // image link
  const [selectedFile, setSelectedFile] = useState(null); // file from PC

  // This function will run when I submit the form
  const handleSubmit = async (e) => {
    e.preventDefault(); // stop page refresh

    // Simple validation: movie name is required
    if (!name.trim()) {
      alert("Movie name is required");
      return;
    }

    try {
      // I use FormData because I want to send both text fields and file
      const formData = new FormData();
      formData.append("name", name);
      formData.append("type", type);
      formData.append("rating", rating);           // send as text, backend converts
      formData.append("imageUrlLink", imageUrl);   // optional link

      // If user selected a file from PC, I also append it
      if (selectedFile) {
        formData.append("image", selectedFile);    // 'image' field is used in multer
      }

      // I send POST request to my backend
      const res = await fetch("http://localhost:5000/api/movies", {
        method: "POST",
        body: formData, // no Content-Type header, browser sets it automatically
      });

      if (res.ok) {
        // If add is successful, I call onSuccess to go back to list and refresh
        onSuccess();
      } else {
        alert("Failed to add movie");
      }
    } catch (err) {
      console.error("Error adding movie:", err);
      alert("Error adding movie");
    }
  };

  return (
    <div className="add-form-wrapper">
      <h1 className="text-center mb-4">Add movies</h1>

      <form onSubmit={handleSubmit}>
        {/* Row 1 - movie name input */}
        <div className="add-form-row mb-3">
          <div className="add-form-label">Movie name:</div>
          <input
            className="add-form-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Row 2 - type or release date input */}
        <div className="add-form-row mb-3">
          <div className="add-form-label">Type:</div>
          <input
            className="add-form-input"
            type="text"
            value={type}
            onChange={(e) => setType(e.target.value)}
          />
        </div>

        {/* Row 3 – Upload image part */}
        <div className="add-form-row mb-3">
          <div className="add-form-label">Upload image:</div>

          <div style={{ display: "flex", gap: "10px", width: "100%" }}>
            {/* Button style label to upload image from PC */}
            <label className="upload-btn">
              Upload from pc
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setSelectedFile(file);
                    // If I want, I could also clear link when file is selected
                    // setImageUrl("");
                  }
                }}
              />
            </label>

            {/* Input for adding direct image link */}
            <input
              className="add-form-input"
              type="text"
              placeholder="Add link"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>
        </div>

        {/* Row 4 - rating input */}
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

        {/* Buttons row */}
        <div className="d-flex gap-2">
          <button type="submit" className="add-form-button flex-grow-1">
            Add
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

export default AddMovieForm;
