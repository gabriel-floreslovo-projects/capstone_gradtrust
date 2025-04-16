from backend.routes import common_bp
from flask import request, jsonify
from web3 import Web3
from flask_jwt_extended import create_access_token, jwt_required, get_jwt
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
        reqData = request.get_json()
        username = reqData.get('username')
        password = reqData.get('password')
        with psycopg2.connect(CONNECTION_STRING) as conn:
            # Pull the user's passhash and role to verify password input
            cursor = conn.cursor()
            getPassandRole = "SELECT passhash, role FROM accounts WHERE username = %s;"
            cursor.execute(getPassandRole, (username,))
            userInfo = cursor.fetchone()

            passhash = userInfo[0] # Get the passhash
            userRole = userInfo[1] # Get the role

            #getting the wallet address via the username
            getAddress = "SELECT address FROM accounts WHERE username = %s;"
            cursor.execute(getAddress, (username,))
            address = cursor.fetchone()[0]

            cursor.close()

            if not userInfo:
                return jsonify({"error": "This username does not exist"}), 403

            if not address:
                # If the username does not exist, return error
                return jsonify({"error": "This username does not exist"}), 403
            
            
            if (bcrypt.checkpw(password=password.encode('utf-8'), hashed_password=bytes.fromhex(passhash))):
                # Create JWT token for access control
                token = create_access_token(identity=username, additional_claims={"role": userRole, "address": address})
                response = jsonify({"message":f"you're logged in", "role": userRole})
                response.set_cookie('access_token', token, httponly=True, secure=True, samesite="None", domain="gradtrust-459152f15ccf.herokuapp.com")
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
    print("getting the user via the jwt")
    user = get_jwt()
    print("returned from getting the user, hopefully printing the user now:")
    print(user)
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    return jsonify(user), 200

@common_bp.route('/create-account', methods=['POST'])
def create():
    try:
        """Let users create an account"""
        username = request.form.get('username')
        password = request.form.get('password')
        address = request.form.get('address')
        role = 'H' #new accounts will default to holder
        with psycopg2.connect(CONNECTION_STRING) as conn:
                # If the username does not already exist, create the new account
                cursor = conn.cursor()
                isNewUserUniqueQuery = "SELECT NOT EXISTS(SELECT 1 FROM accounts WHERE username=%s)"
                cursor.execute(isNewUserUniqueQuery, (username,))
                newUserIsUnique = cursor.fetchone()[0]
                if (newUserIsUnique):
                    salt = bcrypt.gensalt()
                    pepper = os.getenv('PEPPER')
                    passhash = bcrypt.hashpw(password.encode('utf-8'), salt+pepper.encode('utf-8'))
                    insertAccount = "INSERT INTO accounts VALUES (%s, %s, %s, %s);"
                    cursor.execute(insertAccount, (address, username, passhash.hex(), role))
                    cursor.close()
                    conn.commit()
                    return jsonify({"success": True, "message": f"Successfully added account for {username} with address {address}"}), 200
                else:
                    return jsonify({"sucess": True, "message": "This username already exists"}), 409

    except (Exception, psycopg2.DatabaseError) as e:
        print(f"There was an error during creating an account: {e}")
        conn.rollback()
        return jsonify({"success": True, "error": str(e)}), 500