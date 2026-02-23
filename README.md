# 🎓 ZKBAR-V: Dual-Blockchain Academic Record Framework

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Status](https://img.shields.io/badge/status-In%20Development-orange.svg)
![Architecture](https://img.shields.io/badge/architecture-Hybrid%20Blockchain-success.svg)

## 📖 Overview
**ZKBAR-V** (Zero-Knowledge Blockchain Academic Record Verification) is an enterprise-grade, hybrid blockchain system designed to issue, manage, and verify student academic records globally. 

Educational institutions face a "blockchain trilemma": they need the privacy of internal databases, the global trust of public blockchains, and low operational costs. ZKBAR-V solves this by utilizing a **Dual-Blockchain Architecture**. It uses a private ledger for institutional operations (ensuring privacy and zero gas fees) and a public ledger to anchor cryptographic proofs (ensuring global, tamper-proof verifiability).

## ✨ Key Features
* **Dual-Ledger Design:** Combines **Hyperledger Fabric** (Private) for secure, high-throughput university operations and **Polygon zkEVM** (Public) as the ultimate trust anchor.
* **Self-Sovereign Identity (SSI):** Utilizes W3C Decentralized Identifiers (DIDs) and Verifiable Credentials (VCs), giving students true ownership of their academic data.
* **Privacy & Compliance:** Adheres to data regulations (like the Right to Erasure). Raw documents are stored securely off-chain via **IPFS** and encrypted data vaults, while only non-identifiable hashes are pushed on-chain.
* **Cost Effective:** "Zero Gas Fees" for internal registrar operations, as they run entirely on the private Fabric network.
* **Resilient:** Even if university servers go offline, the decentralized public ledger and IPFS ensure credentials remain globally verifiable.

---

## 🏗️ System Architecture

The project is divided into four distinct logical layers:

1. **Identity Layer:** Manages DIDs and VCs for students and universities.
2. **Storage Layer (Off-Chain):** IPFS and secure vaults for storing the actual PDF/JSON transcripts.
3. **Ledger Layer (Dual-Blockchain):**
   * **Private Layer:** Hyperledger Fabric (Java Chaincode) manages enrollment and initial data recording.
   * **Public Layer:** Polygon zkEVM (Solidity Smart Contracts) stores the immutable hash anchors.
4. **Backend API Layer:** An Express.js application bridging the frontend UI, IPFS, and both blockchain networks.

---

## 🛠️ Technology Stack
* **Private Blockchain:** Hyperledger Fabric, Java 17, Gradle
* **Public Blockchain:** Polygon zkEVM, Solidity, Hardhat, Viem
* **Off-Chain Storage:** IPFS (InterPlanetary File System)
* **Backend:** Node.js (v22.10.0+), Express, Axios
* **Infrastructure:** Docker, Docker Compose, Linux (Ubuntu)

---

## 📂 Repository Structure

```text
zkbar-workspace/
├── chaincode-java/        # Hyperledger Fabric smart contracts (Java)
├── smart-contracts-eth/   # Polygon/Ethereum anchor contracts (Solidity/Hardhat)
└── backend-api/           # Node.js/Express server connecting to IPFS and blockchains
```

---

## 🤝 Contributing

Currently, this repository is maintained by a core team of two developers.

* [@Lokesh](https://github.com/lokiT26) handles the Private Ledger (Fabric/Java) integrations.
* [@Dev](https://github.com/dkv204p) handles the Public Ledger (Polygon/Solidity) and Backend API (Node.js).

Please ensure all new branches follow the `feature/your-feature-name` naming convention and are submitted via Pull Request for code review before merging into `main`.

---

*Built to redefine academic trust and verifiability.*
