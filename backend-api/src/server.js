require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { uploadToIPFS } = require('./services/ipfsService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Allow frontend to access this API
app.use(express.json());

// Configure Multer (Temporary storage for uploaded files)
const upload = multer({ dest: 'uploads/' });

// --- ROUTES ---

// 1. Health Check (To see if server is running)
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});

// 2. Upload Route (The Bridge to IPFS)
app.post('/api/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const tempPath = req.file.path;

    try {
        console.log(`📂 Processing file: ${req.file.originalname}`);
        
        // 1. Upload to IPFS using your service
        const cid = await uploadToIPFS(tempPath);

        // 2. Clean up (Delete the temp file from server)
        fs.unlinkSync(tempPath);

        // 3. Respond to the Frontend
        res.json({ 
            success: true, 
            cid: cid, 
            filename: req.file.originalname 
        });

    } catch (error) {
        // Clean up even if it fails
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        
        console.error("Upload Error:", error);
        res.status(500).json({ error: 'Failed to upload to IPFS' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 API Server running on http://localhost:${PORT}`);
});
