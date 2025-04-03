from backend.routes import common_bp
from flask import request, jsonify
from web3 import Web3
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from backend.config import credential_verification, CONNECTION_STRING
import os
import bcrypt
import psycopg2  

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

@common_bp.route('/login', methods=['POST'])
def login():
    """Have user log in and access correct page based on their role"""
    try:
        username = request.form.get('username')
        password = request.form.get('password')
        with psycopg2.connect(CONNECTION_STRING) as conn:
            # Pull the user's passhash and role to verify password input
            cursor = conn.cursor()
            getPassandRole = "SELECT passhash, role FROM accounts WHERE username = %s;"
            cursor.execute(getPassandRole, (username,))
            userInfo = cursor.fetchone()
            cursor.close()
            if not userInfo:
                return jsonify({"error": "This username does not exist"}), 403
            
            print(userInfo)
            passhash = userInfo[0] # Get the passhash
            userRole = userInfo[1] # Get the role
            
            if (bcrypt.checkpw(password=password.encode('utf-8'), hashed_password=bytes.fromhex(passhash))):
                # Create JWT token for access control
                token = create_access_token(identity=sername, additional_claims={"role": userRole})
                response = jsonify({"message":f"you're logged in. role - {userRole}"})
                response.set_cookie('access_token', token, httponly=True, secure=True)
                return response, 200
            else:
                return jsonify({"message":"failed login."}), 401
            
        
    except (Exception, psycopg2.DatabaseError) as e:
        print(f"There was an error during login: {e}")
        return jsonify({'error': str(e)}), 500

@common_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    """Return details of logged in user"""
    user = get_jwt_identity()
    return jsonify(user)