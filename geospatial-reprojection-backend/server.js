require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const { spawn } = require('child_process');
const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { Readable } = require('stream');

const app = express();

// Configure AWS S3
const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Configure multer to use memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Allow multiple origins
const allowedOrigins = [
    'http://localhost:5173',
    'https://nyc-dot-open-data-coordinate-reprojector.onrender.com', 
    'https://nyc-dot-open-data-coordinate-reprojector.vercel.app',
  //  'https://nyc-dot-open-data-coordinate-reprojector.vercel.app/'
];

app.use(cors({
    origin: function (origin, callback) {
        console.log('Request origin:', origin);  // Add this line to log the origin
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    }
}));
//heyyy

app.use(express.static(path.join(__dirname, 'client', 'dist')));

app.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const originalName = req.file.originalname;
    const fileBuffer = req.file.buffer;

    try {
        // Upload file to S3
        const uploadResult = await s3Client.send(new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: `uploads/${originalName}`,
            Body: fileBuffer
        }));

        console.log(`File uploaded to S3: ${uploadResult.Location}`);

        // Process the file using Python script
        const pythonProcess = spawn('python', ['process_file.py', `s3://${process.env.AWS_S3_BUCKET}/uploads/${originalName}`]);

        pythonProcess.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });

        pythonProcess.on('close', async (code) => {
            if (code !== 0) {
                return res.status(500).send('Error processing file');
            }

            const processedFileName = `${originalName.split('.')[0]}_reprojected${path.extname(originalName)}`;
            const processedFileKey = `processed/${processedFileName}`;

            try {
                // Get the processed file from S3
                const processedFile = await s3Client.send(new GetObjectCommand({
                    Bucket: process.env.AWS_S3_BUCKET,
                    Key: processedFileKey
                }));

                // Set headers for file download
                res.setHeader('Content-Type', processedFile.ContentType);
                res.setHeader('Content-Disposition', `attachment; filename=${processedFileName}`);

                // Stream the file to the response
                const stream = Readable.from(processedFile.Body);
                stream.pipe(res);

                // Clean up the original file from S3 after streaming is complete
                stream.on('end', async () => {
                    try {
                        await s3Client.send(new DeleteObjectCommand({
                            Bucket: process.env.AWS_S3_BUCKET,
                            Key: `uploads/${originalName}`
                        }));
                    } catch (error) {
                        console.error('Error deleting original file:', error);
                    }
                });
            } catch (error) {
                console.error('Error retrieving processed file:', error);
                res.status(500).send('Error retrieving processed file');
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error processing file');
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});