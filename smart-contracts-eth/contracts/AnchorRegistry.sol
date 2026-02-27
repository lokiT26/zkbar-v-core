// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ZKBAR-V Anchor Registry
 * @dev Stores SHA-256 hashes of academic records on the Polygon zkEVM.
 * This allows public verification without revealing student privacy.
 */
contract AnchorRegistry {
    // Event emitted when a new record is anchored
    // Indexing the 'hash' allows external apps to search for it easily
    event RecordAnchored(
        string indexed studentDid,
        string documentHash,
        uint256 timestamp
    );

    // State Variable: Maps a Document Hash -> Boolean (Exists?)
    // We use a mapping for O(1) constant time lookup (cheap gas)
    mapping(string => bool) private anchors;

    // State Variable: Maps a Document Hash -> Issuer DID (The University)
    mapping(string => string) public issuers;

    // Access Control: Owner can manage authorized issuers
    address public owner;

    // Authorized Issuers Mapping: Address -> isAuthorized
    mapping(address => bool) public isAuthorizedIssuer;

    // Issuer DIDs Mapping: Address -> DID string
    mapping(address => string) public issuerDids;

    constructor() {
        owner = msg.sender;
        // The owner is the first authorized issuer by default
        isAuthorizedIssuer[msg.sender] = true;
        issuerDids[msg.sender] = "did:zkbar:university-node-1";
    }

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "Only the Contract Owner can perform this action"
        );
        _;
    }

    modifier onlyAuthorizedIssuer() {
        require(isAuthorizedIssuer[msg.sender], "Not an authorized issuer");
        _;
    }

    /**
     * @dev Authorize a new issuer node
     */
    function addIssuer(address _issuer, string memory _did) public onlyOwner {
        isAuthorizedIssuer[_issuer] = true;
        issuerDids[_issuer] = _did;
    }

    /**
     * @dev Remove an issuer node
     */
    function removeIssuer(address _issuer) public onlyOwner {
        isAuthorizedIssuer[_issuer] = false;
        issuerDids[_issuer] = "";
    }

    /**
     * @dev Anchors a new document hash to the blockchain.
     * @param _studentDid The DID of the student (e.g., "did:zkbar:123")
     * @param _documentHash The SHA-256 hash of the JSON/PDF stored in Fabric
     */
    function anchorRecord(
        string memory _studentDid,
        string memory _documentHash
    ) public onlyAuthorizedIssuer {
        require(!anchors[_documentHash], "Record already anchored");

        anchors[_documentHash] = true;
        issuers[_documentHash] = issuerDids[msg.sender];

        emit RecordAnchored(_studentDid, _documentHash, block.timestamp);
    }

    /**
     * @dev Verifies if a document hash exists on-chain.
     * @param _documentHash The hash presented by the student
     * @return valid True if the hash exists
     * @return issuerDid The DID of the university that issued it
     */
    function verifyRecord(
        string memory _documentHash
    ) public view returns (bool valid, string memory issuerDid) {
        return (anchors[_documentHash], issuers[_documentHash]);
    }
}
