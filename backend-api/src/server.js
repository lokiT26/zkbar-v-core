require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { uploadToIPFS } = require('./services/ipfsService');
const { submitCredential, queryCredential } = require('./services/fabricService');
const { anchorRecord, verifyAnchor } = require('./services/evmService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Allow frontend to access this API
app.use(express.json());

// Configure Multer (Temporary storage for uploaded files)
const upload = multer({ dest: 'uploads/' });

// --- ROUTES ---

const DID_REGISTRY_FILE = path.join(__dirname, '..', 'registered_dids.json');

// Helper to load registered DIDs
function loadDids() {
    if (fs.existsSync(DID_REGISTRY_FILE)) {
        return JSON.parse(fs.readFileSync(DID_REGISTRY_FILE, 'utf8'));
    }
    return {};
}

// Helper to save registered DIDs
function saveDids(dids) {
    fs.writeFileSync(DID_REGISTRY_FILE, JSON.stringify(dids, null, 2));
}

// 0. Register Student DID Route
app.post('/api/register-did', (req, res) => {
    const { studentId, did } = req.body;
    if (!studentId || !did) {
        return res.status(400).json({ error: 'Missing studentId or did' });
    }

    try {
        const dids = loadDids();
        dids[studentId] = did;
        saveDids(dids);

        console.log(`📝 Registered DID ${did} for Student ${studentId}`);
        res.json({ success: true, message: 'DID registered successfully' });
    } catch (error) {
        console.error("DID Registration Error:", error);
        res.status(500).json({ error: 'Failed to register DID' });
    }
});

// 0.5 Fetch registered DID (For Issuer Portal)
app.get('/api/did/:studentId', (req, res) => {
    const studentId = req.params.studentId;
    try {
        const dids = loadDids();
        if (dids[studentId]) {
            res.json({ success: true, did: dids[studentId] });
        } else {
            res.status(404).json({ error: 'DID not found for this student ID' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch DID' });
    }
});

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

        // 4. Anchor on EVM
        console.log(`⛓️ Anchoring record to EVM...`);
        const evmAnchor = await anchorRecord(did, originalHash);

        // 5. Respond to the Frontend
        res.json({
            success: true,
            message: 'Credential successfully issued to Fabric and anchored on EVM',
            record: record,
            evmAnchor
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

        // Verify anchor on EVM
        console.log(`⛓️ Verifying EVM Anchor for hash: ${recordData.originalHash}...`);
        const evmVerification = await verifyAnchor(recordData.originalHash);

        res.json({
            success: true,
            record: recordData,
            evmVerification
        });
    } catch (error) {
        console.error("Query Error:", error);
        res.status(404).json({ error: 'Transcript not found or query failed', details: error.message });
    }
});

// 4. Wallet Sync Route
app.get('/api/wallet/sync/:did', async (req, res) => {
    const did = req.params.did;

    // First find the student ID for this DID
    try {
        const dids = loadDids();
        let studentId = null;
        for (const [sId, mappedDid] of Object.entries(dids)) {
            if (mappedDid === did) {
                studentId = sId;
                break;
            }
        }

        if (!studentId) {
            return res.status(404).json({ error: 'No student registered with this DID' });
        }

        // Fetch their credential from Fabric
        console.log(`🔄 Syncing wallet for DID: ${did} (Student: ${studentId})`);
        const recordData = await queryCredential(studentId);

        // Also get EVM Verification
        const evmVerification = await verifyAnchor(recordData.originalHash);

        res.json({
            success: true,
            credential: {
                ...recordData,
                evmVerification
            }
        });

    } catch (error) {
        console.error("Wallet Sync Error:", error);
        res.status(404).json({ error: 'Credential not found or not yet issued', details: error.message });
    }
});

// Start Server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 API Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;
