from routes import common_bp
from flask import request, jsonify
from web3 import Web3
from config import credential_verification
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
        pepper = os.getenv('PEPPER')
        # Connect to the db
        conn = psycopg2.connect(
            'postgresql://postgres:L8RTsfQAJ3wuh7y4@exactly-assured-sawfly.data-1.use1.tembo.io:5432/postgres'
        )   
        cursor = conn.cursor()
        # Pull the user's passhash and salt to verify password input
        cursor.execute(f'SELECT passhash, role FROM accounts WHERE username = {username};')
        userInfo = cursor.fetchall()[0]
        cursor.close()
        passhash = userInfo['passhash']
        userRole = userInfo['role']

        if not userInfo:
            raise ValueError("Nothing was found in the database")
        
        if (bcrypt.checkpw(password=password.encode('utf-8'), hashed_password=bytes.fromhex(passhash))):
            return jsonify({"message":f"you're logged in. role - {userRole}"}), 500
        else:
            return jsonify({"message":"failed login."}), 500
            
        
    except (Exception, psycopg2.DatabaseError) as e:
        print(f"There was an error during login: {e}")
        return jsonify({'error': str(e)}), 500