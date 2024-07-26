const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { spawn } = require('child_process');
const os = require('os');
const app = express();

// Configure multer to save files with original names
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

// Allow multiple origins
const allowedOrigins = ['http://localhost:5173','https://nyc-dot-open-data-coordinate-reprojector.onrender.com', 'https://nyc-dot-open-data-coordinate-reprojector.vercel.app'];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin like mobile apps or curl requests
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    }
}));

app.use(express.static(path.join(__dirname, 'client', 'dist')));

app.post('/upload', upload.single('file'), (req, res) => {
    const originalName = req.file.originalname;
    const filePath = path.join(__dirname, req.file.path);

    const extension = path.extname(originalName);
    const baseName = path.basename(originalName, extension);

    const pythonProcess = spawn('python', ['process_file.py', filePath]);

    pythonProcess.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            res.status(500).send('Error processing file');
        } else {
            const outputFileName = `${baseName}_reprojected${extension}`;
            const tempOutputFile = filePath; // Using the same file path as output
            const downloadsPath = path.join(os.homedir(), 'Downloads', outputFileName);

            fs.copyFile(tempOutputFile, downloadsPath, (err) => {
                if (err) {
                    console.error(`File copy error: ${err}`);
                    return res.status(500).send('Error processing file');
                }

                res.download(downloadsPath, outputFileName, (err) => {
                    if (err) {
                        console.error(`File download error: ${err}`);
                        res.status(500).send('Error downloading file');
                    } else {
                        // Clean up temporary files
                        fs.unlink(tempOutputFile, (err) => {
                            if (err) {
                                console.error(`File delete error: ${err}`);
                            }
                        });

                        // Clear uploads folder
                        fs.readdir('uploads', (err, files) => {
                            if (err) console.error(`Error reading uploads folder: ${err}`);
                            files.forEach(file => {
                                fs.unlink(path.join('uploads', file), err => {
                                    if (err) console.error(`Error deleting file: ${err}`);
                                });
                            });
                        });
                    }
                });
            });
        }
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
