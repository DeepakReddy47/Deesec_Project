import React, { useState, useEffect } from 'react';
import Web3 from 'web3';

const contractABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "requester",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "recordId",
        "type": "uint256"
      }
    ],
    "name": "PermissionGranted",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_dataHash",
        "type": "string"
      }
    ],
    "name": "createRecord",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_recordId",
        "type": "uint256"
      }
    ],
    "name": "grantPermission",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "recordCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "records",
    "outputs": [
      {
        "internalType": "string",
        "name": "dataHash",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const contractAddress = '0x70FdAE7f5D189B1208C25e3bE87D24cB6Ff9a8a5';

function App() {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [dataHash, setDataHash] = useState('');
  const [recordId, setRecordId] = useState('');
  const [grantAddress, setGrantAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [recordCount, setRecordCount] = useState(0);

  useEffect(() => {
    const loadBlockchainData = async () => {
      try {
        if (window.ethereum) {
          const web3 = new Web3(window.ethereum);

          await requestAccountAccess();  // Ensure user account access
          const accounts = await web3.eth.getAccounts();
          setAccount(accounts[0]);

          const medicalDataContract = new web3.eth.Contract(contractABI, contractAddress);
          setContract(medicalDataContract);

          // Load the initial record count
          const initialCount = await medicalDataContract.methods.recordCount().call();
          setRecordCount(initialCount);

        } else {
          alert('Please install MetaMask to use this DApp.');
        }
      } catch (error) {
        console.error('Error initializing Web3 or loading blockchain data:', error);
      }
    };

    loadBlockchainData();
  }, []);

  // Request account access for MetaMask if not already granted
  const requestAccountAccess = async () => {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
    } catch (error) {
      if (error.code === 4001) {
        alert("Permission denied. Please authorize MetaMask to use this application.");
      } else {
        console.error("MetaMask error:", error);
      }
    }
  };

  // Function to create a medical record
  const createRecord = async () => {
    if (contract && account) {
      if (!dataHash || typeof dataHash !== 'string' || dataHash.trim() === "") {
        alert("Please enter a valid data hash.");
        return;
      }

      setLoading(true);

      try {
        await contract.methods.createRecord(dataHash).send({ from: account, gas: 500000 });
        alert('Record created successfully!');

        // Update record count immediately after successful creation
        setRecordCount(prevCount => prevCount + 1);

      } catch (error) {
        console.error('Error creating record:', error.message || error);
        alert('Failed to create record. See console for details.');
      }

      setLoading(false);
    }
  };

  // Function to grant permission for a record to a specific address
  const grantPermission = async () => {
    if (contract && recordId && grantAddress) {
      setLoading(true);

      try {
        // Fetch the active MetaMask account
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length === 0) {
          alert('Please connect to MetaMask.');
          setLoading(false);
          return;
        }
        const currentAccount = accounts[0];

        // Ensure the current account matches the one set in the state
        if (currentAccount !== account) {
          setAccount(currentAccount);  // Update the account state
        }

        // Send transaction from the active MetaMask account
        await contract.methods.grantPermission(recordId).send({ from: currentAccount, gas: 500000 });
        alert('Permission granted successfully!');
      } catch (error) {
        if (error.code === 4100) {
          // MetaMask authorization error
          alert("MetaMask authorization denied. Please authorize the request in MetaMask and try again.");
        } else {
          console.error('Error granting permission:', error.message || error);
          alert('Failed to grant permission');
        }
      } finally {
        setLoading(false);
      }
    } else {
      alert('Please enter a valid record ID and address.');
    }
  };

  return (
    <div>
      <h1>DeeSec Project - Medical Data Management</h1>
      <p>Your Account: {account}</p>
      <p>Total Records Uploaded: {recordCount}</p>

      <div>
        <h2>Create Medical Record</h2>
        <input
          type="text"
          value={dataHash}
          onChange={(e) => setDataHash(e.target.value)}
          placeholder="Enter IPFS Hash"
        />
        <button onClick={createRecord} disabled={loading}>
          {loading ? 'Creating Record...' : 'Create Record'}
        </button>
      </div>

      <div>
        <h2>Grant Permission</h2>
        <input
          type="number"
          value={recordId}
          onChange={(e) => setRecordId(e.target.value)}
          placeholder="Enter Record ID"
        />
        <input
          type="text"
          value={grantAddress}
          onChange={(e) => setGrantAddress(e.target.value)}
          placeholder="Enter Address to Grant Permission"
        />
        <button onClick={grantPermission} disabled={loading}>
          {loading ? 'Granting Permission...' : 'Grant Permission'}
        </button>
      </div>
    </div>
  );
}

export default App;
