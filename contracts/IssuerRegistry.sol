// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract IssuerRegistry {
    // On-chain Merkle root of verified issuers
    bytes32 public merkleRoot;
    address public admin;

    event MerkleRootUpdated(bytes32 newRoot);

    // Only called at posting of contract on chain - GradTrust address becomes admin
    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not authorized");
        _;
    }

    // Function to update the Merkle root (only callable by admin - assumed to be the contract owner)
    function updateMerkleRoot(bytes32 _newMerkleRoot) external onlyAdmin {
        merkleRoot = _newMerkleRoot;
        emit MerkleRootUpdated(_newMerkleRoot);
    }

    // Verifies provided merkle proof using stored merkle root
    // Modified to match how we built the tree
    function verifyIssuer(
        bytes32[] memory proof,
        bool[] memory isLeft, // Array indicating if each proof element is a left sibling
        bytes32 leaf
    ) public view returns (bool) {
        bytes32 computedHash = leaf;

        for (uint256 i = 0; i < proof.length; i++) {
            bytes32 proofElement = proof[i];
            if (isLeft[i]) {
                // Left sibling: proofElement is on left
                computedHash = keccak256(
                    abi.encodePacked(proofElement, computedHash)
                );
            } else {
                // Right sibling: computedHash is on left
                computedHash = keccak256(
                    abi.encodePacked(computedHash, proofElement)
                );
            }
        }

        return computedHash == merkleRoot;
    }
}
