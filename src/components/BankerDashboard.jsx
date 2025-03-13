// src/components/BankerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BankerDashboard = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch('https://enpointe-backend.onrender.com/api/banker/users', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }

        const data = await response.json();
        setUsers(data.users);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate]);

  const handleUserClick = async (userId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`https://enpointe-backend.onrender.com/api/banker/users/${userId}/transactions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user transactions');
      }

      const data = await response.json();
      setTransactions(data.transactions);
      setSelectedUser(users.find(user => user.id === userId));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    navigate('/login');
  };

  if (loading && !selectedUser) return <div className="text-center p-8">Loading...</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Banker Dashboard</h1>
        <button 
          onClick={handleLogout}
          className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
      
      {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-white rounded shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Users</h2>
          
          {users.length === 0 ? (
            <p>No users found.</p>
          ) : (
            <ul className="divide-y">
              {users.map(user => (
                <li key={user.id}>
                  <button
                    onClick={() => handleUserClick(user.id)}
                    className={`w-full py-3 px-2 text-left hover:bg-gray-100 ${selectedUser?.id === user.id ? 'bg-gray-100 font-medium' : ''}`}
                  >
                    {user.name} ({user.email})
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="md:col-span-2 bg-white rounded shadow-md p-6">
          {selectedUser ? (
            <>
              <h2 className="text-xl font-semibold mb-4">
                Transactions for {selectedUser.name}
              </h2>
              
              {loading ? (
                <p>Loading transactions...</p>
              ) : transactions.length === 0 ? (
                <p>No transactions found for this user.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr>
                        <th className="py-2 px-4 border-b text-left">ID</th>
                        <th className="py-2 px-4 border-b text-left">Date</th>
                        <th className="py-2 px-4 border-b text-left">Amount</th>
                        <th className="py-2 px-4 border-b text-left">Type</th>
                        <th className="py-2 px-4 border-b text-left">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map(transaction => (
                        <tr key={transaction.id}>
                          <td className="py-2 px-4 border-b">{transaction.id}</td>
                          <td className="py-2 px-4 border-b">{new Date(transaction.created_at).toLocaleDateString()}</td>
                          <td className="py-2 px-4 border-b">${transaction.amount}</td>
                          <td className="py-2 px-4 border-b">{transaction.type}</td>
                          <td className="py-2 px-4 border-b">{transaction.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-500">Select a user to view their transactions</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BankerDashboard;