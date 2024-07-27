// // import React, { useState } from 'react';
// // import './App.css';
// // import nycDotLogo from './assets/nyc_dot_logo.png';

// // const App: React.FC = () => {
// //   const [file, setFile] = useState<File | null>(null);
// //   const [uploadProgress, setUploadProgress] = useState<number>(0);
// //   const [uploading, setUploading] = useState<boolean>(false);
// //   const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
// //   const [uploadError, setUploadError] = useState<boolean>(false);

// //   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// //     if (e.target.files) {
// //       setFile(e.target.files[0]);
// //     }
// //   };

// //   const handleSubmit = async (e: React.FormEvent) => {
// //     e.preventDefault();
// //     if (!file) return;

// //     const formData = new FormData();
// //     formData.append('file', file);

// //     setUploading(true);
// //     setUploadProgress(0);
// //     setUploadSuccess(false);
// //     setUploadError(false);

// //     const xhr = new XMLHttpRequest();
// //     xhr.open('POST', 'http://localhost:3000/upload', true);
// //     //xhr.open('POST', 'https://nyc-dot-opendata-coordinate-reprojector.onrender.com/upload', true);

// //     xhr.upload.onprogress = (event) => {
// //       if (event.lengthComputable) {
// //         const percentComplete = (event.loaded / event.total) * 100;
// //         setUploadProgress(percentComplete);
// //       }
// //     };

// //     xhr.onload = () => {
// //       if (xhr.status === 200) {
// //         const blob = new Blob([xhr.response], { type: 'application/octet-stream' });
// //         const url = window.URL.createObjectURL(blob);
// //         const a = document.createElement('a');
// //         a.href = url;
// //         a.download = file.name.replace(/(\.[\w\d_-]+)$/i, '_reprojected$1');
// //         document.body.appendChild(a);
// //         a.click();
// //         a.remove();
// //         setUploadSuccess(true);
// //       } else {
// //         setUploadError(true);
// //         alert('Error processing file');
// //       }
// //       setUploading(false);
// //       setUploadProgress(100);
// //     };

// //     xhr.onerror = () => {
// //       setUploadError(true);
// //       alert('Error processing file');
// //       setUploading(false);
// //     };

// //     xhr.responseType = 'blob';
// //     xhr.send(formData);
// //   };

// //   return (
// //     <div className="app">
// //       <nav className="navbar">
// //         <img src={nycDotLogo} alt="NYC DOT Logo" className="logo" />
// //         <h1>Geospatial Reprojection</h1>
// //       </nav>
// //       <main className="main">
// //         <section className="instructions">
// //           <h2>Instructions</h2>
// //           <ol>
// //             <li>Click on the "Choose File" button to select your geospatial data file (.xlsx, .doc, .geojson, or .csv).</li>
// //             <li>Ensure your file contains columns named <b>latitude</b> and <b>longitude</b> with valid coordinates, or geometry data in WKT format.</li>
// //             <li>Once you have selected the file, click on the "Upload" button to upload and process the file.</li>
// //             <li>Wait for the file to be processed. The processed file with updated coordinates will be downloaded automatically.</li>
// //           </ol>
// //         </section>
// //         <form onSubmit={handleSubmit} className="upload-form">
// //           <input type="file" onChange={handleFileChange} accept=".xlsx,.doc,.geojson,.csv" className="file-input" />
// //           <button type="submit" className="upload-button">Upload</button>
// //         </form>
// //         {uploading && (
// //           <div className="progress-bar">
// //             <div className="progress" style={{ width: `${uploadProgress}%` }}></div>
// //           </div>
// //         )}
// //         {uploadSuccess && (
// //           <div className="checkmark">
// //             ✓
// //           </div>
// //         )}
// //         {uploadError && (
// //           <div className="error-mark">
// //             ✗
// //           </div>
// //         )}
// //       </main>
// //     </div>
// //   );
// // };

// // export default App;
// import React, { useState } from 'react';
// import './App.css';
// import nycDotLogo from './assets/nyc_dot_logo.png';

// const App: React.FC = () => {
//   const [file, setFile] = useState<File | null>(null);
//   const [uploadProgress, setUploadProgress] = useState<number>(0);
//   const [uploading, setUploading] = useState<boolean>(false);
//   const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
//   const [uploadError, setUploadError] = useState<boolean>(false);

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files) {
//       setFile(e.target.files[0]);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!file) return;

//     const formData = new FormData();
//     formData.append('file', file);

//     setUploading(true);
//     setUploadProgress(0);
//     setUploadSuccess(false);
//     setUploadError(false);

//     const xhr = new XMLHttpRequest();
//     //xhr.open('POST', 'http://localhost:3000/upload', true);
//     xhr.open('POST', 'https://nyc-dot-opendata-coordinate-reprojector.onrender.com/upload', true);

//     xhr.upload.onprogress = (event) => {
//       if (event.lengthComputable) {
//         const percentComplete = (event.loaded / event.total) * 100;
//         setUploadProgress(percentComplete);
//       }
//     };

//     xhr.onload = () => {
//       if (xhr.status === 200) {
//         const blob = new Blob([xhr.response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
//         const url = window.URL.createObjectURL(blob);
//         const a = document.createElement('a');
//         a.href = url;
//         a.download = file.name.replace(/(\.[\w\d_-]+)$/i, '_reprojected.xlsx');
//         document.body.appendChild(a);
//         a.click();
//         a.remove();
//         setUploadSuccess(true);
//       } else {
//         setUploadError(true);
//         alert('Error processing file');
//       }
//       setUploading(false);
//       setUploadProgress(100);
//     };

//     xhr.onerror = () => {
//       setUploadError(true);
//       alert('Error processing file');
//       setUploading(false);
//     };

//     xhr.responseType = 'blob';
//     xhr.send(formData);
//   };

//   return (
//     <div className="app">
//       <nav className="navbar">
//         <img src={nycDotLogo} alt="NYC DOT Logo" className="logo" />
//         <h1>Geospatial Reprojection</h1>
//       </nav>
//       <main className="main">
//         <section className="instructions">
//           <h2>Instructions</h2>
//           <ol>
//             <li>Click on the "Choose File" button to select your geospatial data file (.xlsx, .doc, .geojson, or .csv).</li>
//             <li>Ensure your file contains columns named <b>latitude</b> and <b>longitude</b> with valid coordinates, or geometry data in WKT format.</li>
//             <li>Once you have selected the file, click on the "Upload" button to upload and process the file.</li>
//             <li>Wait for the file to be processed. The processed file with updated coordinates will be downloaded automatically as an Excel file.</li>
//           </ol>
//         </section>
//         <form onSubmit={handleSubmit} className="upload-form">
//           <input type="file" onChange={handleFileChange} accept=".xlsx,.doc,.geojson,.csv" className="file-input" />
//           <button type="submit" className="upload-button">Upload</button>
//         </form>
//         {uploading && (
//           <div className="progress-bar">
//             <div className="progress" style={{ width: `${uploadProgress}%` }}></div>
//           </div>
//         )}
//         {uploadSuccess && (
//           <div className="checkmark">
//             ✓
//           </div>
//         )}
//         {uploadError && (
//           <div className="error-mark">
//             ✗
//           </div>
//         )}
//       </main>
//     </div>
//   );
// };

// export default App;
import React, { useState } from 'react';
import './App.css';
import nycDotLogo from './assets/nyc_dot_logo.png';

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<boolean>(false);

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

    setUploading(true);
    setUploadProgress(0);
    setUploadSuccess(false);
    setUploadError(false);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://nyc-dot-opendata-coordinate-reprojector.onrender.com/upload', true);
//xhr.open('POST', 'http://localhost:3000/upload', true);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100;
        setUploadProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const contentType = xhr.getResponseHeader('Content-Type') || 'application/octet-stream';
        const blob = new Blob([xhr.response], { type: contentType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name.replace(/(\.[\w\d_-]+)$/i, '_reprojected$1');
        document.body.appendChild(a);
        a.click();
        a.remove();
        setUploadSuccess(true);
      } else {
        setUploadError(true);
        alert('Error processing file');
      }
      setUploading(false);
      setUploadProgress(100);
    };

    xhr.onerror = () => {
      setUploadError(true);
      alert('Error processing file');
      setUploading(false);
    };

    xhr.responseType = 'blob';
    xhr.send(formData);
  };

  return (
    <div className="app">
      <nav className="navbar">
        <img src={nycDotLogo} alt="NYC DOT Logo" className="logo" />
        <h1>Geospatial Reprojection</h1>
      </nav>
      <main className="main">
        <section className="instructions">
          <h2>Instructions</h2>
          <ol>
            <li>Click on the "Choose File" button to select your geospatial data file (.xlsx, .doc, .geojson, or .csv).</li>
            <li>Ensure your file contains columns named <b>latitude</b> and <b>longitude</b> with valid coordinates, or geometry data in WKT format.</li>
            <li>Once you have selected the file, click on the "Upload" button to upload and process the file.</li>
            <li>Wait for the file to be processed. The processed file with updated coordinates will be downloaded automatically in the same format as the input file.</li>
          </ol>
        </section>
        <form onSubmit={handleSubmit} className="upload-form">
          <input type="file" onChange={handleFileChange} accept=".xlsx,.doc,.geojson,.csv" className="file-input" />
          <button type="submit" className="upload-button">Upload</button>
        </form>
        {uploading && (
          <div className="progress-bar">
            <div className="progress" style={{ width: `${uploadProgress}%` }}></div>
          </div>
        )}
        {uploadSuccess && (
          <div className="checkmark">
            ✓
          </div>
        )}
        {uploadError && (
          <div className="error-mark">
            ✗
          </div>
        )}
      </main>
    </div>
  );
};

export default App;