from backend.routes import admin_bp
from flask import jsonify, request
from web3 import Web3
from backend.classes.issue_verification import IssuerVerification
from backend.config import w3, issuer_registry, PRIVATE_KEY, CONNECTION_STRING
import os
import psycopg2
import bcrypt
import json

@admin_bp.route('/update-merkle-root', methods=['POST'])
def update_merkle_root():
    """Update the Merkle root in the smart contract (Admin only)"""
    try:
        verifier = IssuerVerification()
        try:
            #causing the error
            new_root = verifier.get_merkle_root()
            # Convert hex string to bytes32
            root_bytes = Web3.to_bytes(hexstr=new_root)
            #print root_bytes
            print(f'root_bytes: {root_bytes}')
            print(f'type of root_bytes: {type(root_bytes)}')
            if len(root_bytes) != 32:
                print(len(root_bytes))
                raise ValueError("Merkle root must be exactly 32 bytes")
            print(f'root_bytes: {root_bytes}')
            print(f'type of root_bytes: {type(root_bytes)}')

            
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

@admin_bp.route('/create-account', methods=['POST'])
def create_account():
    """Create user account and insert into the database"""
    try: 
        username = request.form.get('username')
        passwd = request.form.get('password')
        address = request.form.get('address')
        role = request.form.get('role')
        with psycopg2.connect(CONNECTION_STRING) as conn:
            # If the username does not already exist, create the new account
            cursor = conn.cursor()
            isNewUserUniqueQuery = "SELECT NOT EXISTS(SELECT 1 FROM accounts WHERE username=%s)"
            cursor.execute(isNewUserUniqueQuery, (username,))
            newUserIsUnique = cursor.fetchone()[0]
            if (newUserIsUnique):
                salt = bcrypt.gensalt()
                pepper = os.getenv('PEPPER')
                passhash = bcrypt.hashpw(passwd.encode('utf-8'), salt+pepper.encode('utf-8'))
                insertAccount = "INSERT INTO accounts VALUES (%s, %s, %s, %s);"
                cursor.execute(insertAccount, (address, username, passhash.hex(), role))
                cursor.close()
                conn.commit()
                return jsonify({"message": f"Successfully added account for {username} with address {address}"}), 200
            else:
                return jsonify({"message": "This username already exists"}), 409

    except (Exception, psycopg2.DatabaseError) as e:
        print(f"There was an error during creating an account: {e}")
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    
@admin_bp.route('/delete-account', methods=['DELETE'])
def delete_account():
    """Remove user account from the database"""
    try: 
        with psycopg2.connect(CONNECTION_STRING) as conn:   
            cursor = conn.cursor()
            username = request.form.get('username')
            getUserInfo = "SELECT * FROM accounts where username=%s"
            cursor.execute(getUserInfo, (username,))
            userInfo = cursor.fetchone()
            address = userInfo[0]
            passhash = userInfo[1]
            role = userInfo[2]
            if (role == "H" or role == "V"):
                removeUser = "DELETE FROM accounts WHERE username=%s"
                cursor.execute(removeUser, (username,))
                conn.commit()
            else:
                # Do logic to ask for multi-admin signature
                removeUser = "DELETE FROM accounts WHERE username=%s"
                cursor.execute(removeUser, (username,))
                conn.commit()

            cursor.close()
            return jsonify({"message":f"Account {username} with address {address} successfully removed."}), 200
    
    except (Exception, psycopg2.DatabaseError) as e:
        print(f"There was an error while deleting an account: {e}")
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    
@admin_bp.route('/get-accounts', methods=['GET'])
def get_accounts():
     """Get all user accounts from the database"""
     try:
         with psycopg2.connect(CONNECTION_STRING) as conn:
             cursor = conn.cursor()
             getAllAccounts = "SELECT * FROM accounts"
             cursor.execute(getAllAccounts)
             accounts = cursor.fetchall()
             cursor.close()
             return jsonify(accounts), 200
     except (Exception, psycopg2.DatabaseError) as e:
         print(f"There was an error while getting all accounts: {e}")
         return jsonify({"error": str(e)}), 500
 
@admin_bp.route('/update-account', methods=['PUT'])
def update_account():
     """Update user account in the database"""
     #only want to update the user's role
     #find the user by their address (guaranteed to be unique)
     try:
         with psycopg2.connect(CONNECTION_STRING) as conn:
             cursor = conn.cursor()
             address = request.form.get('address')
             role = request.form.get('role')
             if (role == "H" or role == "V" or role == "A" or role == "I"):
                 updateAccount = "UPDATE accounts SET role=%s WHERE address=%s"
                 cursor.execute(updateAccount, (role, address))
                 conn.commit()
                 cursor.close()
                 return jsonify({"message":f"Account {address} successfully updated."}), 200
             else:
                 return jsonify({"message": "This role is not allowed"}), 409
     except (Exception, psycopg2.DatabaseError) as e:
         print(f"There was an error while updating an account: {e}")
         conn.rollback()
         return jsonify({"error": str(e)}), 500
    
@admin_bp.route('/create-issuer', methods=['POST'])
def create_issuer():
    """Create issuer and insert into the database"""
    try:
        data = request.json
        issuer_address = data.get('address')
        issuer_name = data.get('name')
        signature = data.get('signature')

        if not all([issuer_address, issuer_name, signature]):
            return jsonify({'error': 'Missing required fields'}), 400

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