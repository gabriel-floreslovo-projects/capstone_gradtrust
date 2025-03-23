from . import admin_bp
from flask import jsonify
from web3 import Web3
from ..classes.issue_verification import IssuerVerification
from ..config import w3, issuer_registry, PRIVATE_KEY
import os
import json

@admin_bp.route('/update-merkle-root', methods=['POST'])
def update_merkle_root():
    """Update the Merkle root in the smart contract (Admin only)"""
    try:
        verifier = IssuerVerification()
        try:
            new_root = verifier.get_merkle_root()
            root_bytes = Web3.to_bytes(hexstr=new_root)

            
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

            tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
            
            # Wait for transaction receipt
            receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
            
            return jsonify({
                'success': True,
                'merkleRoot': new_root,
                'transactionHash': receipt.transactionHash.hex()
            })
        finally:
            verifier.close()
            
    except Exception as e:
        print(f"Error in update_merkle_root: {str(e)}")  # Add logging
        return jsonify({'error': str(e)}), 500
