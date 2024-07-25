const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { spawn } = require('child_process');
const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors({
    origin: 'http://localhost:5173' // Allow requests from the frontend
}));

app.use(express.static(path.join(__dirname, 'client', 'dist')));

app.post('/upload', upload.single('file'), (req, res) => {
    const originalName = req.file.originalname;
    const filePath = path.join(__dirname, req.file.path);

    // Determine the file extension and rename the file accordingly
    const extension = path.extname(originalName);
    const newFilePath = `${filePath}${extension}`;

    fs.rename(filePath, newFilePath, (err) => {
        if (err) {
            console.error(`File rename error: ${err}`);
            return res.status(500).send('Error processing file');
        }

        const pythonProcess = spawn('python', ['process_file.py', newFilePath]);

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
                // Determine the output file extension based on the input file extension
                const outputExtension = path.extname(newFilePath);
                const outputFile = `${newFilePath}${outputExtension}`;
                res.download(outputFile, `reprojected_data${outputExtension}`);
            }
        });
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
