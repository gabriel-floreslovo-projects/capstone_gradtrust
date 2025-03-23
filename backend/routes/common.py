from backend.routes import common_bp
from flask import request, jsonify
from web3 import Web3
from config import credential_verification

@common_bp.route('/pull-credentials', methods=['GET'])
def pull_credentials():
    """Pull all credentials for a specific holder address"""
    try:
        holder_address = request.args.get('address')
        if not holder_address:
            return jsonify({'error': 'Missing holder address'}), 400

        holder_address = Web3.to_checksum_address(holder_address)
        
        credentials = credential_verification.functions.pullCredential(
            holder_address
        ).call()
        
        formatted_credentials = []
        for cred in credentials:
            formatted_credentials.append({
                'credentialHash': '0x' + cred[0].hex(),
                'issuer': cred[1],
                'holder': cred[2],
                'issuedAt': cred[3],
                'data': cred[4]
            })
        
        return jsonify({
            'success': True,
            'credentials': formatted_credentials
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500 