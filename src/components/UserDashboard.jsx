import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [balance, setBalance] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [amount, setAmount] = useState('');
  const [modalError, setModalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Fetch transactions
        const transactionsResponse = await fetch('http://localhost:5000/api/user/transactions', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!transactionsResponse.ok) {
          throw new Error('Failed to fetch transactions');
        }

        const transactionsData = await transactionsResponse.json();
        console.log(transactions)
        setTransactions(transactionsData.transactions);

        // Fetch balance
        const balanceResponse = await fetch('http://localhost:5000/api/user/balance', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!balanceResponse.ok) {
          throw new Error('Failed to fetch balance');
        }
        const balanceData = await balanceResponse.json();
        setBalance(balanceData.balance.amount);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, transactions]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    navigate('/login');
  };

  const openModal = (type) => {
    setModalType(type);
    setAmount('');
    setModalError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalError('');
  };

  const handleAmountChange = (e) => {
    // Allow only numbers and decimal point
    const value = e.target.value;
    if (!value || value.match(/^\d*\.?\d{0,2}$/)) {
      setAmount(value);
    }
  };

  const handleTransaction = async () => {
    try {
      setModalError('');
      
      // Validate amount
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        setModalError('Please enter a valid amount greater than zero');
        return;
      }
      
      // Check for insufficient funds for withdrawals
      if (modalType === 'withdraw' && numAmount > balance) {
        setModalError('Insufficient Funds');
        return;
      }
      
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/user/${modalType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount: numAmount })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${modalType}`);
      }
      
      const data = await response.json();
      
      // Update balance
      setBalance(data.newBalance);
      console.log(data.newBalance, "new balance");
      
      // Add new transaction to the list
      const newTransaction = {
        id: data.transactionId,
        date: new Date().toISOString(),
        amount: numAmount,
        type: modalType,
        description: modalType === 'deposit' ? 'Deposit' : 'Withdrawal'
      };
      
      setTransactions([newTransaction, ...transactions]);
      
      // Show success message
      setSuccessMessage(`${modalType === 'deposit' ? 'Deposit' : 'Withdrawal'} successful!`);
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Close modal
      closeModal();
    } catch (err) {
      setModalError(err.message);
    }
  };

  if (loading) return <div className="text-center p-8">Loading...</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <button 
          onClick={handleLogout}
          className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
      
      {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>}
      {successMessage && <div className="bg-green-100 text-green-700 p-4 rounded mb-4">{successMessage}</div>}
      
      <div className="bg-white rounded shadow-md p-6 mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Current Balance: <span className="text-green-600">₹{balance}</span></h2>
          <div className="space-x-4">
            <button 
              onClick={() => openModal('deposit')}
              className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
            >
              Deposit
            </button>
            <button 
              onClick={() => openModal('withdraw')}
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
              Withdraw
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Your Transactions</h2>
        
        {transactions.length === 0 ? (
          <p>No transactions found.</p>
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
                    <td className="py-2 px-4 border-b">₹{parseFloat(transaction.amount).toFixed(2)}</td>
                    <td className="py-2 px-4 border-b">
                      <span className={`px-2 py-1 rounded text-white ${transaction.type === 'deposit' ? 'bg-green-500' : 'bg-blue-500'}`}>
                        {transaction.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b">{transaction.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">
              {modalType === 'deposit' ? 'Make a Deposit' : 'Make a Withdrawal'}
            </h3>
            
            <div className="mb-4">
              <p className="text-gray-600 mb-2">Available Balance: <span className="font-semibold">₹{balance}</span></p>
            </div>
            
            {modalError && (
              <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
                {modalError}
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Amount:</label>
              <div className="relative">
                <span className="absolute left-3 top-2">₹</span>
                <input
                  type="text"
                  value={amount}
                  onChange={handleAmountChange}
                  className="w-full p-2 pl-6 border rounded"
                  placeholder="0.00"
                  autoFocus
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleTransaction}
                className={`px-4 py-2 rounded text-white ${
                  modalType === 'deposit' ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {modalType === 'deposit' ? 'Deposit' : 'Withdraw'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;