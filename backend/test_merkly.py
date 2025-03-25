from merkly.mtree import MerkleTree

tree = MerkleTree(["leaf1", "leaf2", "leaf3"])
print(dir(tree))  # Check if 'proof' is listed