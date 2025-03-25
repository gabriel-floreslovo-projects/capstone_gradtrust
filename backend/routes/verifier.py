from backend.routes import verifier_bp
from flask import request, jsonify
from web3 import Web3
from backend.config import credential_verification

@verifier_bp.route('/verify-credential', methods=['GET'])
def verify_credential():
    """Verify a credential's authenticity"""
    try:
        credential_hash = request.args.get('hash')
        if not credential_hash:
            return jsonify({'error': 'Missing credential hash'}), 400

        hash_bytes = Web3.to_bytes(hexstr=credential_hash)
        
        is_valid = credential_verification.functions.verifyCredential(
            hash_bytes
        ).call()
        
        return jsonify({
            'success': True,
            'isValid': is_valid
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
