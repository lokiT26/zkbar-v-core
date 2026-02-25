require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { uploadToIPFS } = require('./services/ipfsService');
const { submitCredential, queryCredential } = require('./services/fabricService');

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

// 2. Upload and Issue Route (The Bridge to IPFS and Fabric)
app.post('/api/issue', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const { studentId, did, degreeName, gpa, graduationYear, originalHash, status } = req.body;

    // Validate required fields
    if (!studentId || !did || !degreeName || !gpa || !graduationYear || !originalHash || !status) {
        // Clean up file if validation fails
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: 'Missing required metadata fields in request body' });
    }

    const tempPath = req.file.path;

    try {
        console.log(`📂 Processing file: ${req.file.originalname}`);

        // 1. Upload to IPFS using the service
        console.log(`📡 Uploading to IPFS...`);
        const cid = await uploadToIPFS(tempPath);
        console.log(`✅ Uploaded to IPFS with CID: ${cid}`);

        // 2. Clean up (Delete the temp file from server)
        fs.unlinkSync(tempPath);

        // 3. Submit transaction to Fabric
        console.log(`📝 Writing record to Fabric Ledger for student: ${studentId}...`);
        const record = await submitCredential(
            studentId,
            did,
            degreeName,
            gpa,
            graduationYear,
            cid,
            originalHash,
            status
        );

        // 4. Respond to the Frontend
        res.json({
            success: true,
            message: 'Credential successfully issued to Fabric and PDF stored on IPFS',
            record: record
        });

    } catch (error) {
        // Clean up even if it fails
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);

        console.error("Issue Error:", error);
        res.status(500).json({ error: 'Failed to issue credential', details: error.message });
    }
});

// 3. Query Transcript Logic Route
app.get('/api/transcript/:id', async (req, res) => {
    const studentId = req.params.id;
    try {
        console.log(`🔍 Querying Fabric Ledger for student: ${studentId}...`);
        const recordData = await queryCredential(studentId);

        res.json({
            success: true,
            record: recordData
        });
    } catch (error) {
        console.error("Query Error:", error);
        res.status(404).json({ error: 'Transcript not found or query failed', details: error.message });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 API Server running on http://localhost:${PORT}`);
});
