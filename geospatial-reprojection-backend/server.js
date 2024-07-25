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

app.use(cors({
    origin: 'http://localhost:5173' // Allow requests from the frontend
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
