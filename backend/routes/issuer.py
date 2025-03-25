from backend.routes import issuer_bp
from flask import request, jsonify
from eth_account.messages import encode_defunct
from eth_account import Account
from web3 import Web3
import psycopg2
from backend.classes.issue_verification import IssuerVerification
from backend.config import CONNECTION_STRING, w3, credential_verification, PRIVATE_KEY

@issuer_bp.route('/test', methods=['GET'])
def test():
    return jsonify({"message":"hey buddy"}),200

@issuer_bp.route('/register', methods=['POST'])
def register_issuer():
    """Register a new issuer with their signature"""
    data = request.json
    issuer_address = data.get('address')
    issuer_name = data.get('name')
    private_key = data.get('private_key')

    if not all([issuer_address, issuer_name, private_key]):
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        # Create and sign message
        message = f"{issuer_address},{issuer_name}"
        message_hash = encode_defunct(text=message)
        signed_message = Account.sign_message(message_hash, private_key=private_key)
        signature = '0x' + signed_message.signature.hex()

        # Store in database
        with psycopg2.connect(CONNECTION_STRING) as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO issuers (id, name, signature) 
                    VALUES (%s, %s, %s)
                    ON CONFLICT (id) 
                    DO UPDATE SET 
                        name = EXCLUDED.name,
                        signature = EXCLUDED.signature
                    """,
                    (issuer_address, issuer_name, signature)
                )
            conn.commit()

        return jsonify({
            'success': True,
            'address': issuer_address,
            'name': issuer_name,
            'signature': signature
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@issuer_bp.route('/issue-credential', methods=['POST'])
def issue_credential():
    """Issue a new credential to a holder"""
    try:
        # Get request data
        credential_hash = request.form.get('credentialHash')
        holder_address = request.form.get('holderAddress')
        issuer_address = request.form.get('issuerAddress')
        issuer_name = request.form.get('issuerName')
        metadata = request.form.get('metaData')

        if not all([credential_hash, holder_address, issuer_address, issuer_name, metadata]):
            return jsonify({'error': 'Missing required fields'}), 400

        # Get issuer's Merkle proof
        verifier = IssuerVerification()
        try:
            proof_data = verifier.get_issuer_proof(issuer_address, issuer_name)
            print(proof_data)

            # Prepare contract call data
            proof = []
            for p in proof_data['proof']:
                sanitized_p = p.strip()  # Remove leading/trailing whitespace
                print(f"Sanitized proof element (repr): {repr(sanitized_p)}")  # Debugging
                if not all(c in '0123456789abcdefABCDEF' for c in sanitized_p):
                    raise ValueError(f"Invalid hex string in proof: {sanitized_p}")
                proof.append(bytes.fromhex(sanitized_p))

            # Remove the '0x' prefix from the leaf before hashing
            sanitized_leaf = proof_data['leaf'][2:] if proof_data['leaf'].startswith('0x') else proof_data['leaf']
            leaf_hash = Web3.keccak(hexstr=sanitized_leaf)

            # Convert credential hash to bytes32
            credential_bytes = bytes.fromhex(credential_hash.strip())
            if len(credential_bytes) != 32:
                raise ValueError("Credential hash must be exactly 32 bytes")

            # Get account from private key
            account = w3.eth.account.from_key(PRIVATE_KEY)

            # Get the nonce and gas price
            nonce = w3.eth.get_transaction_count(account.address)
            gas_price = w3.eth.gas_price

            # Build transaction using legacy format
            tx = credential_verification.functions.storeCredential(
                credential_bytes,
                Web3.to_checksum_address(holder_address),
                w3.eth.get_block('latest').timestamp,
                issuer_name + " " + metadata,
                proof,
                proof_data['isLeft'],
                leaf_hash
            ).build_transaction({
                'from': account.address,
                'nonce': nonce,
                'gas': 300000,  # Adjust gas limit as needed
                'gasPrice': gas_price,
                'chainId': 11155111
            })

            # Sign and send transaction
            signed_tx = w3.eth.account.sign_transaction(tx, PRIVATE_KEY)
            tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)

            # Wait for transaction receipt
            receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

            return jsonify({
                'success': True,
                'transactionHash': receipt.transactionHash.hex(),
                'credentialHash': credential_hash
            })
        finally:
            verifier.close()

    except Exception as e:
        print(f"Error in issue_credential: {str(e)}")  # Add logging
        return jsonify({'error': str(e)}), 500