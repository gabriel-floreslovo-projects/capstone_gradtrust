ABI = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_issuerRegistry",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": False,
      "inputs": [
        {
          "indexed": True,
          "internalType": "bytes32",
          "name": "credentialHash",
          "type": "bytes32"
        },
        {
          "indexed": True,
          "internalType": "address",
          "name": "issuer",
          "type": "address"
        },
        {
          "indexed": True,
          "internalType": "address",
          "name": "holder",
          "type": "address"
        },
        {
          "indexed": False,
          "internalType": "uint256",
          "name": "issuedAt",
          "type": "uint256"
        },
        {
          "indexed": False,
          "internalType": "string",
          "name": "data",
          "type": "string"
        }
      ],
      "name": "CredentialStored",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "name": "credentials",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "credentialHash",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "issuer",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "holder",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "issuedAt",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "data",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "holderCredentials",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "issuerRegistry",
      "outputs": [
        {
          "internalType": "contract IssuerRegistry",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "holderAddress",
          "type": "address"
        }
      ],
      "name": "pullCredential",
      "outputs": [
        {
          "components": [
            {
              "internalType": "bytes32",
              "name": "credentialHash",
              "type": "bytes32"
            },
            {
              "internalType": "address",
              "name": "issuer",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "holder",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "issuedAt",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "data",
              "type": "string"
            }
          ],
          "internalType": "struct CredentialVerification.Credential[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "bytes32",
              "name": "credentialHash",
              "type": "bytes32"
            },
            {
              "internalType": "address",
              "name": "issuer",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "holder",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "issuedAt",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "data",
              "type": "string"
            }
          ],
          "internalType": "struct CredentialVerification.Credential",
          "name": "_credential",
          "type": "tuple"
        },
        {
          "internalType": "bytes32[]",
          "name": "_merkleProof",
          "type": "bytes32[]"
        },
        {
          "internalType": "bool[]",
          "name": "_isLeft",
          "type": "bool[]"
        },
        {
          "internalType": "bytes32",
          "name": "signedPairHash",
          "type": "bytes32"
        }
      ],
      "name": "storeCredential",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "_credentialHash",
          "type": "bytes32"
        }
      ],
      "name": "verifyCredential",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
]