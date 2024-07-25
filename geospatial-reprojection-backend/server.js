const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const { exec } = require('child_process');
const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());  // Use cors middleware

app.use(express.static(path.join(__dirname, 'client', 'dist')));

app.post('/upload', upload.single('file'), (req, res) => {
    const filePath = path.join(__dirname, req.file.path);
    exec(`python process_file.py "${filePath}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            console.error(`stderr: ${stderr}`);
            return res.status(500).send(`Error processing file: ${stderr}`);
        }
        res.download(stdout.trim(), 'reprojected_data.xlsx');
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
