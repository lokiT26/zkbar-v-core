import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";

describe("AnchorRegistry", async function () {
    const { viem } = await network.connect();
    const publicClient = await viem.getPublicClient();

    it("Should assign owner as an authorized issuer by default", async function () {
        const registry = await viem.deployContract("AnchorRegistry");
        const testClients = await viem.getWalletClients();
        const ownerAddress = testClients[0].account.address;

        const isAuthorized = await registry.read.isAuthorizedIssuer([ownerAddress]);
        assert.equal(isAuthorized, true);

        const ownerDid = await registry.read.issuerDids([ownerAddress]);
        assert.equal(ownerDid, "did:zkbar:university-node-1");
    });

    it("Should allow authorized issuer to anchor a record", async function () {
        const registry = await viem.deployContract("AnchorRegistry");
        const studentDid = "did:zkbar:student-123";
        const documentHash = "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";

        await registry.write.anchorRecord([studentDid, documentHash]);

        const verification = await registry.read.verifyRecord([documentHash]);
        assert.equal(verification[0], true);
        assert.equal(verification[1], "did:zkbar:university-node-1");
    });

    it("Should allow owner to set a new issuer", async function () {
        const registry = await viem.deployContract("AnchorRegistry");
        const testClients = await viem.getWalletClients();
        const newIssuer = testClients[1].account.address;
        const newIssuerDid = "did:zkbar:university-node-2";

        await registry.write.addIssuer([newIssuer, newIssuerDid]);

        const isAuthorized = await registry.read.isAuthorizedIssuer([newIssuer]);
        assert.equal(isAuthorized, true);

        const issuerDid = await registry.read.issuerDids([newIssuer]);
        assert.equal(issuerDid, newIssuerDid);
    });

    it("Should not allow unauthorized addresses to anchor records", async function () {
        const registry = await viem.deployContract("AnchorRegistry");
        const testClients = await viem.getWalletClients();
        const unauthorizedClient = testClients[1];
        const studentDid = "did:zkbar:student-999";
        const documentHash = "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef";

        const registryAsUnauthorized = await viem.getContractAt(
            "AnchorRegistry",
            registry.address,
            { client: { wallet: unauthorizedClient } }
        );

        await assert.rejects(
            registryAsUnauthorized.write.anchorRecord([studentDid, documentHash]),
            (err: any) => err.message.includes("Not an authorized issuer")
        );
    });
});
