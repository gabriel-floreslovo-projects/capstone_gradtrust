from . import issuer_bp
from flask import request, jsonify
from eth_account.messages import encode_defunct
from eth_account import Account
from web3 import Web3
import psycopg2
from classes.issue_verification import IssuerVerification
from config import CONNECTION_STRING, w3, credential_verification

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

        # Get issuer's Merkle proof
        verifier = IssuerVerification()
        try:
            proof_data = verifier.get_issuer_proof(issuer_address, issuer_name)
            
            # Prepare contract call data
            proof = [Web3.to_bytes(hexstr=p) for p in proof_data['proof']]
            leaf_hash = Web3.keccak(text=proof_data['leaf'])
            
            # Store credential on chain
            tx = credential_verification.functions.storeCredential(
                Web3.to_bytes(hexstr=credential_hash),
                Web3.to_checksum_address(holder_address),
                w3.eth.get_block('latest').timestamp,
                issuer_name+" "+metadata,
                proof,
                proof_data['isLeft'],
                leaf_hash
            ).transact({'from': issuer_address})
            
            receipt = w3.eth.wait_for_transaction_receipt(tx)
            
            return jsonify({
                'success': True,
                'transactionHash': receipt.transactionHash.hex(),
                'credentialHash': credential_hash
            })
        finally:
            verifier.close()
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500