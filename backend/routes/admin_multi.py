from backend.routes import admin_bp
from flask import jsonify, request
from web3 import Web3
from eth_account.messages import encode_defunct
from eth_account import Account
from backend.classes.issue_verification import IssuerVerification
from backend.config import w3, issuer_registry, PRIVATE_KEY

# Store temporary signatures in memory
pending_root_updates = {}

ADMIN_ADDRESSES = [
    "0x9dbe33e61ca2f65118fbcaf182ac2cdd2cab4a42".lower(),  # First admin
    "0x031A433BcB6c45Fa1afa9E33D9Ad60838b0970F7".lower()   # Second admin
]

@admin_bp.route('/get-new-root', methods=['GET'])
def get_new_root():
    """Get the new Merkle root that needs to be signed"""
    try:
        verifier = IssuerVerification()
        try:
            new_root = verifier.get_merkle_root()
            return jsonify({
                'success': True,
                'merkleRoot': new_root
            })
        finally:
            verifier.close()
    except Exception as e:
        print(f"Error in get_new_root: {str(e)}")
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/multi-sig/update-merkle-root', methods=['POST'])
def update_merkle_root_multi():
    """Update the Merkle root with multi-signature verification"""
    try:
        data = request.json
        admin_address = data.get('adminAddress')
        signature = data.get('signature')
        merkle_root = data.get('merkleRoot')  # Get the root from the request

        if not all([admin_address, signature, merkle_root]):
            return jsonify({'error': 'Missing required fields'}), 400

        # Verify admin address
        if admin_address.lower() not in ADMIN_ADDRESSES:
            return jsonify({'error': 'Unauthorized admin address'}), 403

        # Verify signature with the same message format
        message = f"Update Merkle Root: {merkle_root}"
        message_hash = encode_defunct(text=message)
        recovered_address = Account.recover_message(message_hash, signature=signature)

        if recovered_address.lower() != admin_address.lower():
            return jsonify({'error': 'Invalid signature'}), 400

        verifier = IssuerVerification()
        try:
            new_root = verifier.get_merkle_root()
            root_bytes = Web3.to_bytes(hexstr=new_root)

            if len(root_bytes) != 32:
                raise ValueError("Merkle root must be exactly 32 bytes")

            # Check if this is the first or second signature
            if new_root not in pending_root_updates:
                # First signature
                pending_root_updates[new_root] = {
                    'first_admin': admin_address.lower(),
                    'first_signature': signature,
                    'root_bytes': root_bytes
                }
                return jsonify({
                    'success': True,
                    'message': 'First signature recorded. Waiting for second admin signature.',
                    'needsSecondSignature': True,
                    'merkleRoot': new_root
                })
            else:
                # Verify it's a different admin
                first_admin = pending_root_updates[new_root]['first_admin']
                if admin_address.lower() == first_admin:
                    return jsonify({'error': 'Same admin cannot sign twice'}), 400

                # We have both signatures, proceed with the update
                root_bytes = pending_root_updates[new_root]['root_bytes']

                # Get account from private key
                account = w3.eth.account.from_key(PRIVATE_KEY)

                # Get the nonce and gas price
                nonce = w3.eth.get_transaction_count(account.address)
                gas_price = w3.eth.gas_price

                # Build transaction using legacy format
                tx = issuer_registry.functions.updateMerkleRoot(
                    root_bytes
                ).build_transaction({
                    'from': account.address,
                    'nonce': nonce,
                    'gas': 200000,
                    'gasPrice': gas_price,
                    'chainId': 11155111
                })

                # Sign and send transaction
                signed_tx = w3.eth.account.sign_transaction(tx, PRIVATE_KEY)
                tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
                
                # Wait for transaction receipt
                receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

                # Clear the pending update after successful transaction
                del pending_root_updates[new_root]

                return jsonify({
                    'success': True,
                    'message': 'Merkle root updated successfully',
                    'merkleRoot': new_root,
                    'transactionHash': receipt.transactionHash.hex()
                })

        finally:
            verifier.close()

    except Exception as e:
        print(f"Error in update_merkle_root_multi: {str(e)}")
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/multi-sig/pending-updates', methods=['GET'])
def get_pending_updates():
    """Get list of pending Merkle root updates"""
    try:
        return jsonify({
            'success': True,
            'pending': [
                {
                    'merkleRoot': root,
                    'firstAdmin': data['first_admin']
                }
                for root, data in pending_root_updates.items()
            ]
        })
    except Exception as e:
        print(f"Error in get_pending_updates: {str(e)}")
        return jsonify({'error': str(e)}), 500