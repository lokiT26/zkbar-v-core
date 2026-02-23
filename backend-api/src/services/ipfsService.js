require('dotenv').config();
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

/**
 * Uploads a file to IPFS via Pinata
 * @param {string} filePath - The local path to the file (PDF/JSON)
 * @returns {Promise<string>} - The IPFS CID (Content Identifier)
 */
async function uploadToIPFS(filePath) {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
    let data = new FormData();
    
    // Append the file from the local path
    data.append('file', fs.createReadStream(filePath));

    const config = {
        method: 'post',
        url: url,
        headers: { 
            'Authorization': `Bearer ${process.env.PINATA_JWT}`, 
            ...data.getHeaders()
        },
        data : data
    };

    try {
        const res = await axios(config);
        console.log("✅ File Uploaded to IPFS!");
        console.log("CID:", res.data.IpfsHash);
        return res.data.IpfsHash;
    } catch (error) {
        console.error("❌ IPFS Upload Failed:", error);
        throw error;
    }
}

// --- TEST AREA (Uncomment to test locally) ---
// const testFile = 'test-document.txt';
// fs.writeFileSync(testFile, "This is a test diploma for ZKBAR-V");
// uploadToIPFS(testFile);

module.exports = { uploadToIPFS };
