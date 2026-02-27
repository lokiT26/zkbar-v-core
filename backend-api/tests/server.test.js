const request = require('supertest');
const app = require('../src/server');

// Mock the services so we don't hit external APIs or blockchains during unit tests
jest.mock('../src/services/ipfsService', () => ({
    uploadToIPFS: jest.fn().mockResolvedValue('QmTest1234567890')
}));

jest.mock('../src/services/fabricService', () => ({
    submitCredential: jest.fn().mockResolvedValue({
        txId: 'tx-123',
        status: 'SUCCESS'
    }),
    queryCredential: jest.fn().mockResolvedValue({
        studentId: '12345',
        degreeName: 'B.Sc Computer Science',
        originalHash: 'test-hash-123'
    })
}));

jest.mock('../src/services/evmService', () => ({
    anchorRecord: jest.fn().mockResolvedValue({
        txHash: '0xabc123',
        status: 'ANCHORED'
    }),
    verifyAnchor: jest.fn().mockResolvedValue({
        valid: true,
        issuerDid: 'did:zkbar:university-1'
    })
}));

describe('Backend API Routes', () => {

    it('GET /health should return 200 OK', async () => {
        const res = await request(app).get('/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('status', 'OK');
    });

    it('POST /api/issue should validate missing fields and return 400', async () => {
        // Not attaching a file, should fail early
        const res = await request(app).post('/api/issue').send({
            studentId: '123'
        });
        expect(res.statusCode).toEqual(400);
        expect(res.body.error).toBe('No PDF file uploaded');
    });

    it('POST /api/issue should trigger services and return success when complete', async () => {
        // Send a dummy file with all required fields
        const res = await request(app)
            .post('/api/issue')
            .attach('file', Buffer.from('dummy pdf content'), 'test.pdf')
            .field('studentId', '12345')
            .field('did', 'did:zkbar:student-123')
            .field('degreeName', 'B.Sc Test')
            .field('gpa', '3.9')
            .field('graduationYear', '2024')
            .field('originalHash', 'test-hash-123')
            .field('status', 'ISSUED');

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toContain('successfully issued');
        expect(res.body.evmAnchor.txHash).toBe('0xabc123');
    });

    it('GET /api/transcript/:id should return combined fabric and evm validation', async () => {
        const res = await request(app).get('/api/transcript/12345');
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.record.studentId).toBe('12345');
        expect(res.body.evmVerification.valid).toBe(true);
    });
});
