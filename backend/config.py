import os
from web3 import Web3
import json
import dotenv
from .abis.issuer_registry import ABI as ISSUER_REGISTRY_ABI
from .abis.credential_verification import ABI as CREDENTIAL_VERIFICATION_ABI

dotenv.load_dotenv()

API_URL = os.getenv('API_URL')
PRIVATE_KEY = os.getenv('PRIVATE_KEY')

# Network configurations
NETWORKS = {
    'local': {
        'url': 'http://127.0.0.1:8545',
        'issuer_registry': '0x5fbdb2315678afecb367f032d93f642f64180aa3',
        'credential_verification': '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
    },
    'sepolia': {
        'url': os.getenv('API_URL'),  # Get Alchemy URL from .env
        'issuer_registry': os.getenv('ISSUER_REGISTRY_ADDRESS'),  # Get deployed address from .env
        'credential_verification': os.getenv('CREDENTIAL_VERIFICATION_ADDRESS')  # Get deployed address from .env
    }
}

# Set which network to use
NETWORK = os.getenv('NETWORK', 'sepolia')  # Default to sepolia

CONNECTION_STRING = os.getenv('CONNECTION_STRING')

# Web3 setup
network_config = NETWORKS[NETWORK]
w3 = Web3(Web3.HTTPProvider(network_config['url']))

# Contract addresses
ISSUER_REGISTRY_ADDRESS = Web3.to_checksum_address(network_config['issuer_registry'])
CREDENTIAL_VERIFICATION_ADDRESS = Web3.to_checksum_address(network_config['credential_verification'])


# Load contract ABI
def load_contract_abi(contract_name):
    artifact_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        'artifacts',
        'contracts',
        f'{contract_name}.sol',
        f'{contract_name}.json'
    )
    with open(artifact_path) as f:
        return json.load(f)['abi']

# Initialize contracts
issuer_registry = w3.eth.contract(
    address=ISSUER_REGISTRY_ADDRESS,
    abi=ISSUER_REGISTRY_ABI
)

credential_verification = w3.eth.contract(
    address=CREDENTIAL_VERIFICATION_ADDRESS,
    abi=CREDENTIAL_VERIFICATION_ABI
) 