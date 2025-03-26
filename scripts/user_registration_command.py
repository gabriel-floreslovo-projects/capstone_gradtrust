import bcrypt
import psycopg2
import argparse
import random
import hashlib

def main():
    try:
        randint = random.randint(0, 1898989)
        address = f"bsddress{str(randint)}"
        username = f"username{str(randint)}"
        parser = argparse.ArgumentParser(prog="user_registration_command", description="generate the sql command to add a new user to db."
        " also prints out salt and passhash for general purpose use")
        parser.add_argument('password', help='the password you want to salt and hash')
        parser.add_argument('-u', help='optional username')
        parser.add_argument('-a', help='optional address')
        args = parser.parse_args()
        passwd = args.password
        username = args.u
        address = args.a
        salt = bcrypt.gensalt()
        passhash = bcrypt.hashpw(passwd.encode('utf-8'), salt)
        
        print(f"INSERT INTO accounts VALUES ('{address}', '{username}', '{salt.hex()}', '{passhash.hex()}', 'A');")

        return 0

    except Exception as e:
        print(f"Something went wrong: {e}")
        return 1

if __name__ == "__main__":
    main()