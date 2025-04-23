// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IssuerRegistry.sol";

contract CredentialVerification {
    // Use to access members/call functions from IssuerRegistry
    IssuerRegistry public issuerRegistry;

    // Credential data structure holds info on holder's cert
    struct Credential {
        bytes32 credentialHash;
        address issuer;
        address holder;
        uint256 issuedAt;
        string data;
    }

    // Storage mapping for credentials

    //mapping signed hash of diploma to struct
    mapping(bytes32 => Credential) public credentials;

    //address of credential holder to the signed hash of each credential
    //can we make it Credential[] instead of bytes32[]?
    mapping(address => bytes32[]) public holderCredentials;

    // Events
    event CredentialStored(
        bytes32 indexed credentialHash,
        address indexed issuer,
        address indexed holder,
        uint256 issuedAt,
        string data
    );

    // event CredentialDeleted(bytes32 indexed credentialHash);

    // WORRY ABOUT THIS LATER
    // // function to delete a credential
    // function deleteCredential(bytes32 _credentialHash) external {
    //     // Check if the credential exists
    //     require(credentials[_credentialHash].issuer != address(0), "Credential does not exist");

    //     // delete the credential
    //     delete credentials[_credentialHash];
    //     // let external world know that the credential has been deleted
    //     emit CredentialDeleted(_credentialHash);
    // }

    // Modifier to check if an issuer is valid (only verifies Merkle proof)
    modifier onlyVerifiedIssuer(
        bytes32[] memory proof,
        bool[] memory isLeft,
        bytes32 signedPairHash
    ) {
        require(
            issuerRegistry.verifyIssuer(proof, isLeft, signedPairHash),
            "Invalid issuer: Merkle proof failed"
        );
        _;
    }

    // Instantiate issuerRegsistry object to interact with IssuerRegistry contract
    constructor(address _issuerRegistry) {
        issuerRegistry = IssuerRegistry(_issuerRegistry);
    }

    // Function to store a new credential (Issuer must be verified via Merkle proof)
    function storeCredential(
        Credential calldata _credential,
        bytes32[] calldata _merkleProof,
        bool[] calldata _isLeft,
        bytes32 signedPairHash
    ) external onlyVerifiedIssuer(_merkleProof, _isLeft, signedPairHash) {
        require(
            credentials[_credential.credentialHash].issuer == address(0),
            "Credential already exists"
        );

        credentials[_credential.credentialHash] = Credential(
            _credential.credentialHash,
            _credential.issuer,
            _credential.holder,
            _credential.issuedAt,
            _credential.data
        );

        holderCredentials[_credential.holder].push(_credential.credentialHash);

        emit CredentialStored(
            _credential.credentialHash,
            _credential.issuer,
            _credential.holder,
            _credential.issuedAt,
            _credential.data
        );
    }

    // Function to pull a holder's list of credentials
    function pullCredential(
        address holderAddress
    ) external view returns (Credential[] memory) {
        bytes32[] memory holderHashes = holderCredentials[holderAddress];
        Credential[] memory userCredentials = new Credential[](
            holderHashes.length
        );
        for (uint i = 0; i < userCredentials.length; i++) {
            userCredentials[i] = credentials[holderHashes[i]];
        }

        return userCredentials;
    }

    // Function to check if a credential exists
    function verifyCredential(
        bytes32 _credentialHash
    ) public view returns (bool) {
        return credentials[_credentialHash].issuer != address(0);
    }
}
