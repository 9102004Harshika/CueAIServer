import multer from 'multer';
import path from 'path';

// Set up multer for file uploads
const storage = multer.memoryStorage(); // Store file in memory
const upload = multer({ storage });

export default upload;
