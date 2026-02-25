'use strict';

const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

const CHANNEL_NAME = 'academicchannel';
const CHAINCODE_NAME = 'zkbar';

async function getContract() {
    try {
        // Load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'config', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        // Check to see if we've already enrolled the user
        const identity = await wallet.get('appUser');
        if (!identity) {
            throw new Error('An identity for the user "appUser" does not exist in the wallet. Run registerUser.js first.');
        }

        // Create a new gateway for connecting to our peer node
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to
        const network = await gateway.getNetwork(CHANNEL_NAME);

        // Get the contract from the network
        const contract = network.getContract(CHAINCODE_NAME);

        return { contract, gateway };
    } catch (error) {
        console.error(`Failed to connect to gateway: ${error}`);
        throw error;
    }
}

/**
 * Submit a new credential to the Fabric ledger
 */
async function submitCredential(studentId, did, degreeName, gpa, graduationYear, ipfsCid, originalHash, status) {
    let gateway;
    try {
        const connection = await getContract();
        gateway = connection.gateway;
        const contract = connection.contract;

        // Submit the specified transaction
        // createTranscript(studentId, did, degreeName, gpa, graduationYear, ipfsCid, originalHash, status)
        console.log(`Submitting createTranscript transaction for ${studentId}...`);
        const result = await contract.submitTransaction(
            'createTranscript',
            studentId,
            did,
            degreeName,
            String(gpa),
            graduationYear,
            ipfsCid,
            originalHash,
            status
        );
        console.log('Transaction has been submitted successfully');

        return JSON.parse(result.toString() || '{}');
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        throw error; // Let the caller handle it
    } finally {
        if (gateway) {
            gateway.disconnect();
        }
    }
}

/**
 * Query a credential from the Fabric ledger
 */
async function queryCredential(studentId) {
    let gateway;
    try {
        const connection = await getContract();
        gateway = connection.gateway;
        const contract = connection.contract;

        // Evaluate the specified transaction
        console.log(`Evaluating queryTranscript transaction for ${studentId}...`);
        const result = await contract.evaluateTransaction('queryTranscript', studentId);
        console.log('Transaction has been evaluated successfully');

        return JSON.parse(result.toString());
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        throw error;
    } finally {
        if (gateway) {
            gateway.disconnect();
        }
    }
}

module.exports = {
    submitCredential,
    queryCredential
};
