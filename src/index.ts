import express, { Request, Response } from 'express';
import multer from 'multer';
import { addToQueue } from './transcriber';

const app = express();
const PORT = 3000;

const upload = multer({ dest: 'uploads/' });

// Middleware to parse JSON
app.use(express.json());

// Define a simple GET endpoint
app.post('/input', upload.single('audio'), async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
        res.status(400).json({message: 'No file uploaded'});
        return;
    }

    addToQueue(req.file);

    res.status(200).json({
        title: 'File uploaded',
        short_summary: 'File uploaded',
        summary: 'The file has been uploaded and is being processed',
        tags: ['file', 'upload', 'processing'],
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
