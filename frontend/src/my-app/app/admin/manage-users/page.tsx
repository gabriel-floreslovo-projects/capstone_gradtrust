"use client";

import { useState, useEffect } from "react";
import Navbar from "../../../components/navbar";
import Footer from "../../../components/footer";

interface Account {
  address: string;
  username: string;
  role: string;
}

export default function ManageUsersPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<Account[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [pendingRoleUpdates, setPendingRoleUpdates] = useState<{
    [address: string]: string;
  }>({});
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    // Filter accounts based on the search query
    const filtered = accounts.filter(
      (account) =>
        account.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        account.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredAccounts(filtered);
  }, [searchQuery, accounts]);

  const fetchAccounts = async () => {
    try {
      const response = await fetch(
        "https://gradtrust-459152f15ccf.herokuapp.com/api/admin/get-accounts"
      );
      if (!response.ok) {
        throw new Error("Failed to fetch accounts");
      }
      const data = await response.json();
      const formattedAccounts = data.map((account: any) => ({
        address: account[0],
        username: account[1],
        role: account[2],
      }));
      setAccounts(formattedAccounts);
      setFilteredAccounts(formattedAccounts); // Initialize filtered accounts
    } catch (error) {
      setError("Error fetching accounts");
    }
  };

  const updateRole = async (address: string, newRole: string) => {
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await fetch(
        "https://gradtrust-459152f15ccf.herokuapp.com/api/admin/update-account",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ address, role: newRole }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to update role");
      }
      const data = await response.json();
      setSuccessMessage(data.message);
      setPendingRoleUpdates((prev) => {
        const updated = { ...prev };
        delete updated[address];
        return updated;
      });
      fetchAccounts(); // Refresh the accounts list
    } catch (error) {
      setError("Error updating role");
    }
  };

  const deleteAccount = async (username: string) => {
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await fetch(
        "https://gradtrust-459152f15ccf.herokuapp.com/api/admin/delete-account",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to delete account");
      }
      const data = await response.json();
      setSuccessMessage(data.message);
      setPendingDelete(null);
      fetchAccounts(); // Refresh the accounts list
    } catch (error) {
      setError("Error deleting account");
    }
  };

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
        <div className="absolute right-0 top-0 h-[500px] w-[500px] bg-blue-500/10 blur-[100px]" />
        <div className="absolute bottom-0 left-0 h-[500px] w-[500px] bg-purple-500/10 blur-[100px]" />
      </div>

      <div className="relative z-10">
        <Navbar />
        <main className="flex flex-col items-center p-8 md:p-24 text-white">
          <section className="w-full max-w-5xl mb-16 text-center bg-gray-800/60 p-8 rounded-xl shadow-lg">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Manage Users
            </h1>
            <p className="text-lg text-gray-300 mb-10">
              View, update roles, and delete user accounts.
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-600/20 border border-red-500 text-red-300 rounded-lg shadow-md">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="mb-6 p-4 bg-green-600/20 border border-green-500 text-green-300 rounded-lg shadow-md">
                {successMessage}
              </div>
            )}

            {/* Search Input */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search by address or username"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400"
              />
            </div>

            <table className="w-full text-left text-gray-300">
              <thead>
                <tr>
                  <th className="py-2 px-4">Address</th>
                  <th className="py-2 px-4">Username</th>
                  <th className="py-2 px-4">Role</th>
                  <th className="py-2 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.map((account) => (
                  <tr key={account.address} className="border-t border-gray-700">
                    <td className="py-2 px-4">{account.address}</td>
                    <td className="py-2 px-4">{account.username}</td>
                    <td className="py-2 px-4">
                      <select
                        value={pendingRoleUpdates[account.address] ?? account.role}
                        onChange={(e) =>
                          setPendingRoleUpdates((prev) => ({
                            ...prev,
                            [account.address]: e.target.value,
                          }))
                        }
                        className="bg-gray-700 text-white p-2 rounded-lg"
                      >
                        <option value="H" disabled={account.role === "H"}>
                          H
                        </option>
                        <option value="V" disabled={account.role === "V"}>
                          V
                        </option>
                        <option value="A" disabled={account.role === "A"}>
                          A
                        </option>
                        <option value="I" disabled={account.role === "I"}>
                          I
                        </option>
                      </select>
                      {pendingRoleUpdates[account.address] && (
                        <button
                          onClick={() =>
                            updateRole(account.address, pendingRoleUpdates[account.address])
                          }
                          className="ml-2 bg-teal-500 hover:bg-teal-600 text-white font-medium py-1 px-3 rounded-lg transition-colors"
                        >
                          Confirm
                        </button>
                      )}
                    </td>
                    <td className="py-2 px-4">
                      {pendingDelete === account.username ? (
                        <>
                          <button
                            onClick={() => deleteAccount(account.username)}
                            className="bg-red-500 hover:bg-red-600 text-white font-medium py-1 px-3 rounded-lg transition-colors"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setPendingDelete(null)}
                            className="ml-2 bg-gray-500 hover:bg-gray-600 text-white font-medium py-1 px-3 rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setPendingDelete(account.username)}
                          className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </main>
        <Footer />
      </div>
    </div>
  );
}