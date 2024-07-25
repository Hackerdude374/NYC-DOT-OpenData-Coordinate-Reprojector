import React, { useState } from 'react';
import './App.css';
import nycDotLogo from './assets/NYC DOT.png';

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('http://localhost:3000/upload', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'reprojected_data.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } else {
      alert('Error processing file');
    }
  };

  return (
    <div className="app">
      <nav className="navbar">
        <img src={nycDotLogo} alt="NYC DOT Logo" className="logo" />
        <h1>Geospatial Reprojection</h1>
      </nav>
      <main>
        <section className="instructions">
          <h2>Instructions</h2>
          <ol>
            <li>Click on the "Choose File" button to select your geospatial data file (.xlsx, .doc, .geojson, or .csv).</li>
            <li>Ensure your file contains columns named <b>latitude</b> and <b>longitude</b> with valid coordinates, or geometry data in WKT format.</li>
            <li>Once you have selected the file, click on the "Upload" button to upload and process the file.</li>
            <li>Wait for the file to be processed. The processed file with updated coordinates will be downloaded automatically.</li>
          </ol>
        </section>
        <form onSubmit={handleSubmit} className="upload-form">
          <input type="file" onChange={handleFileChange} accept=".xlsx,.doc,.geojson,.csv" className="file-input" />
          <button type="submit" className="upload-button">Upload</button>
        </form>
      </main>
    </div>
  );
};

export default App;
