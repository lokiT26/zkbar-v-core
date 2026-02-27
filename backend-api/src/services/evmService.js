const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Contract configuration
const RPC_URL = process.env.RPC_URL || 'http://127.0.0.1:8545';
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.ANCHOR_REGISTRY_ADDRESS;

// Resolve ABI
const contractPath = path.resolve(__dirname, '../../..', 'smart-contracts-eth/artifacts/contracts/AnchorRegistry.sol/AnchorRegistry.json');
let contractABI = [];
try {
    if (fs.existsSync(contractPath)) {
        const artifact = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
        contractABI = artifact.abi;
    }
} catch (error) {
    console.error('Error loading contract ABI:', error);
}

// Fallback ABI
const fallbackABI = [
    "function anchorRecord(string _studentDid, string _documentHash) public",
    "function verifyRecord(string _documentHash) public view returns (bool valid, string issuerDid)"
];

const abiFragment = contractABI.length > 0 ? contractABI : fallbackABI;

/**
 * Anchor a record on the EVM (Polygon zkEVM or Local Hardhat network)
 */
async function anchorRecord(studentDid, documentHash) {
    if (!PRIVATE_KEY || !CONTRACT_ADDRESS) {
        console.warn('⚠️ Skipping EVM anchor: PRIVATE_KEY or ANCHOR_REGISTRY_ADDRESS missing in .env');
        return { txnHash: null, skipped: true };
    }

    try {
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, abiFragment, wallet);

        console.log(`⛓️ Anchoring record to EVM for ${studentDid}...`);
        const tx = await contract.anchorRecord(studentDid, documentHash);

        console.log(`⏳ Waiting for EVM confirmation (Hash: ${tx.hash})...`);
        const receipt = await tx.wait();

        console.log(`✅ EVM Anchoring Confirmed in block ${receipt.blockNumber}`);
        return { txnHash: receipt.hash, blockNumber: receipt.blockNumber, skipped: false };
    } catch (error) {
        console.error('❌ Failed to anchor record on EVM:', error);
        throw error;
    }
}

/**
 * Verify a record on the EVM
 */
async function verifyAnchor(documentHash) {
    if (!CONTRACT_ADDRESS) {
        return { valid: false, error: 'ANCHOR_REGISTRY_ADDRESS missing in .env' };
    }

    try {
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, abiFragment, provider);

        const [valid, issuerDid] = await contract.verifyRecord(documentHash);
        return { valid, issuerDid };
    } catch (error) {
        console.error('❌ Failed to verify anchor on EVM:', error);
        return { valid: false, error: error.message };
    }
}

module.exports = {
    anchorRecord,
    verifyAnchor
};
