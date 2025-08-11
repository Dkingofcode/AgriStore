import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  Database, 
  MapPin, 
  TrendingUp, 
  Shield, 
  Users, 
  Leaf, 
  BarChart3,
  CloudUpload,
  FileText,
  Truck,
  DollarSign,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
  Download,
  X
} from 'lucide-react';
import { 
  healthCheck, 
  uploadFile, 
  registerFarmer, 
  registerCrop, 
  predictYield, 
  getMarketIntelligence, 
  createSupplyChain, 
  getFarmerAnalytics, 
  getStorageStats,
  retrieveFile
} from './utils/api';
import { ethers } from 'ethers';

const AgriStoreNigeria = () => {
// AgriStoreNigeria contract ABI (minimal, update with your full ABI)

  const [health, setHealth] = useState('checking');
  const [walletAddress, setWalletAddress] = useState(null);
  const [file, setFile] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [farmer, setFarmer] = useState({ name: '', location: '', cropTypes: '', landSize: '', walletAddress: '' });
  const [crop, setCrop] = useState({ 
    cropType: '', 
    plantingDate: '', 
    expectedHarvestDate: '', 
    soilPH: '', 
    soilMoisture: '', 
    organicMatter: '', 
    farmerId: '', 
    location: '', 
    walletAddress: '' 
  });
  const [uploads, setUploads] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [crops, setCrops] = useState([]);
  const [marketData, setMarketData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [predictionData, setPredictionData] = useState({ cropType: '', soilData: { pH: '', moisture: '', organicMatter: '' }, location: '' });
  const [predictionResult, setPredictionResult] = useState('');
  const [filecoinStats, setFilecoinStats] = useState(null);
  const [onChainStorage, setOnChainStorage] = useState(null);
  const [error, setError] = useState(null);
  const [fileInfoModal, setFileInfoModal] = useState(null);

  // Connect to MetaMask and authenticate
  const connectWallet = async () => {
    if (!window.ethereum) {
      setError('MetaMask not detected');
      return;
    }
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const address = accounts[0];
      setWalletAddress(address);
      setFarmer({ ...farmer, walletAddress: address });
      setCrop({ ...crop, walletAddress: address });

      // Request authentication challenge
      const challengeResponse = await API.post('/auth/challenge', { walletAddress: address });
      const { message, timestamp } = challengeResponse.data.data;
      
      // Sign the message
      const signer = provider.getSigner();
      const signature = await signer.signMessage(message);
      
      // Verify signature
      const verifyResponse = await API.post('/auth/verify', { walletAddress: address, signature, message });
      if (verifyResponse.data.success) {
        alert('Wallet authenticated successfully');
      } else {
        setError('Wallet authentication failed');
        setWalletAddress(null);
      }
    } catch (err) {
      setError('Wallet connection failed: ' + err.message);
    }
  };

  // Health Check
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await healthCheck();
        setHealth(response.data.status);
      } catch (error) {
        console.error('Health check failed:', error);
        setHealth('unhealthy');
        setError('Health check failed: ' + error.message);
      }
    };
    checkHealth();
  }, []);

  const contractABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "OwnableInvalidOwner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "OwnableUnauthorizedAccount",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "policyId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "claimAmount",
        "type": "uint256"
      }
    ],
    "name": "ClaimSubmitted",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_farmerId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_cropId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_coverage",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_duration",
        "type": "uint256"
      }
    ],
    "name": "createPolicy",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "policyId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "farmerId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "coverage",
        "type": "uint256"
      }
    ],
    "name": "PolicyCreated",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_policyId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_claimAmount",
        "type": "uint256"
      }
    ],
    "name": "submitClaim",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
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
    "name": "policies",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "farmerId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "cropId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "premium",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "coverage",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "startDate",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "endDate",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "active",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "claimed",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "policyCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

  // Fetch Lighthouse storage stats
  const fetchStorageStats = async () => {
    try {
      const response = await getStorageStats();
      setFilecoinStats({
        totalStorage: (response.data.data.storage.used / 1024 / 1024).toFixed(2) + ' MB',
        totalFiles: response.data.data.storage.totalFiles,
        provider: response.data.data.storage.provider,
        recentFiles: response.data.data.recentFiles
      });
      setUploads(response.data.data.recentFiles);
    } catch (error) {
      console.error('Failed to fetch storage stats:', error);
      setError('Failed to fetch storage stats: ' + error.message);
    }
  };

  // Fetch market intelligence
  const fetchMarketIntelligence = async () => {
    try {
      const response = await getMarketIntelligence();
      setMarketData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch market intelligence:', error);
      setError('Failed to fetch market intelligence: ' + error.message);
    }
  };

  // Fetch farmer analytics
  const fetchFarmerAnalytics = async () => {
    try {
      const response = await getFarmerAnalytics('farmer_123'); // Replace with dynamic farmerId
      setAnalytics(response.data.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setError('Failed to fetch analytics: ' + error.message);
    }
  };

  // Fetch on-chain storage data
  const fetchOnChainStorage = async () => {
    if (!window.ethereum) return;
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract('0x8348136F9aacD06Fc10283c001995f64AAF2754b', contractABI, provider);
      const totalStorage = await contract.getTotalStorageUsed();
      const storageRecord = await contract.getStorageRecord('bafybeig3yasxhgjw5ysx2pi3zmcsv2dynmnkeef3jlxsazems53ca5mzba');
      setOnChainStorage({
        totalStorage: ethers.utils.formatUnits(totalStorage, 0),
        storageRecord
      });
    } catch (error) {
      console.error('Failed to fetch on-chain data:', error);
      setError('Failed to fetch on-chain data: ' + error.message);
    }
  };

  // Fetch initial data
  useEffect(() => {
    fetchStorageStats();
    fetchMarketIntelligence();
    fetchFarmerAnalytics();
    if (window.ethereum) fetchOnChainStorage();
  }, []);

  // File Upload
  const handleFileAsyncUpload = async (e) => {
    e.preventDefault();
    if (!file || !walletAddress) {
      setError('Please select a file and connect wallet');
      return;
    }
    setIsUploading(true);
    setUploadProgress(0);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('walletAddress', walletAddress);
      formData.append('dataType', 'agricultural_data');
      const response = await uploadFile(formData, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });
      setUploads(prev => [{
        id: Date.now(),
        fileName: response.data.data.metadata.originalName,
        size: (response.data.data.size / 1024 / 1024).toFixed(2) + ' MB',
        cid: response.data.data.cid,
        timestamp: new Date().toISOString(),
        status: 'stored',
        url: response.data.data.url
      }, ...prev]);
      alert('File uploaded successfully: ' + response.data.data.cid);
      fetchStorageStats(); // Refresh stats
    } catch (err) {
      console.error('File upload failed:', err);
      setError('File upload failed: ' + err.message);
      alert('File upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setFile(null);
    }
  };

  // File Retrieval
  const handleFileRetrieve = async (cid) => {
    if (!walletAddress) {
      setError('Please connect wallet to retrieve files');
      return;
    }
    try {
      const response = await retrieveFile(cid, walletAddress);
      setFileInfoModal({
        cid: response.data.data.cid,
        fileInfo: response.data.data.fileInfo,
        accessUrls: response.data.data.accessUrls,
        retrievedAt: response.data.data.retrievedAt
      });
    } catch (error) {
      console.error('File retrieval failed:', error);
      setError('File retrieval failed: ' + error.message);
      alert('File retrieval failed. Please try again.');
    }
  };

  // Farmer Registration
  const handleFarmerRegister = async (e) => {
    e.preventDefault();
    if (!walletAddress) {
      setError('Please connect wallet');
      return;
    }
    try {
      const response = await registerFarmer({ ...farmer, cropTypes: farmer.cropTypes.split(',').map(t => t.trim()) });
      setFarmers(prev => [{
        id: response.data.data.farmerId,
        name: farmer.name,
        location: farmer.location,
        cropTypes: farmer.cropTypes.split(',').map(t => t.trim()),
        landSize: farmer.landSize + ' hectares',
        filecoinCID: response.data.data.filecoinCID,
        lastUpdate: new Date().toISOString(),
        status: 'pending'
      }, ...prev]);
      alert('Farmer registered successfully: ' + response.data.data.farmerId);
      setFarmer({ name: '', location: '', cropTypes: '', landSize: '', walletAddress });
    } catch (error) {
      console.error('Farmer registration failed:', error);
      setError('Farmer registration failed: ' + error.message);
      alert('Farmer registration failed. Please try again.');
    }
  };

  // Crop Registration
  const handleCropRegister = async (e) => {
    e.preventDefault();
    if (!walletAddress) {
      setError('Please connect wallet');
      return;
    }
    try {
      const response = await registerCrop(crop);
      setCrops(prev => [{
        id: response.data.data.cropId,
        farmerId: crop.farmerId,
        type: crop.cropType,
        plantingDate: crop.plantingDate,
        expectedHarvest: crop.expectedHarvestDate,
        currentStage: response.data.data.crop.status,
        soilData: `pH: ${crop.soilPH}, Moisture: ${crop.soilMoisture}%`,
        ipfsHash: response.data.data.filecoinCID,
        predictions: response.data.data.crop.predictions
      }, ...prev]);
      alert('Crop registered successfully: ' + response.data.data.cropId);
      setCrop({ 
        cropType: '', 
        plantingDate: '', 
        expectedHarvestDate: '', 
        soilPH: '', 
        soilMoisture: '', 
        organicMatter: '', 
        farmerId: '', 
        location: '', 
        walletAddress: '' 
      });
    } catch (error) {
      console.error('Crop registration failed:', error);
      setError('Crop registration failed: ' + error.message);
      alert('Crop registration failed. Please try again.');
    }
  };

  // Yield Prediction
  const handlePrediction = async (e) => {
    e.preventDefault();
    try {
      const response = await predictYield(predictionData);
      setPredictionResult(`Yield: ${response.data.data.predictions.yield}, Quality: ${response.data.data.predictions.quality}`);
    } catch (error) {
      console.error('Prediction failed:', error);
      setError('Prediction failed: ' + error.message);
      alert('Prediction failed. Please try again.');
    }
  };

  // Supply Chain Creation
  const handleSupplyChainCreation = async (e) => {
    e.preventDefault();
    if (!walletAddress) {
      setError('Please connect wallet');
      return;
    }
    try {
      const supplyChainData = {
        cropId: crop.farmerId, // Assuming cropId is tied to farmerId for simplicity
        batchNumber: `AG${Date.now()}`,
        initialLocation: crop.location,
        handler: farmer.name || 'Farmer',
        walletAddress
      };
      const response = await createSupplyChain(supplyChainData);
      alert('Supply chain created successfully: ' + response.data.data.supplyChainId);
    } catch (error) {
      console.error('Supply chain creation failed:', error);
      setError('Supply chain creation failed: ' + error.message);
      alert('Supply chain creation failed. Please try again.');
    }
  };

  // File Info Modal
  const FileInfoModal = ({ fileInfoModal, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">File Information</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">CID</p>
            <p className="text-sm font-mono break-all">{fileInfoModal.cid}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">File Name</p>
            <p className="text-sm font-medium">{fileInfoModal.fileInfo.fileName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Size</p>
            <p className="text-sm font-medium">{(fileInfoModal.fileInfo.fileSize / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Retrieved At</p>
            <p className="text-sm font-medium">{new Date(fileInfoModal.retrievedAt).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Access URLs</p>
            <div className="space-y-2">
              <a
                href={fileInfoModal.accessUrls.lighthouse}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 text-sm hover:underline block"
              >
                Lighthouse Gateway
              </a>
              <a
                href={fileInfoModal.accessUrls.ipfs}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 text-sm hover:underline block"
              >
                IPFS Gateway
              </a>
              <a
                href={fileInfoModal.accessUrls.cloudflare}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 text-sm hover:underline block"
              >
                Cloudflare Gateway
              </a>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full"
        >
          Close
        </button>
      </div>
    </div>
  );

  // Dashboard Tab
  const DashboardTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Active Farmers</p>
              <p className="text-2xl font-bold text-green-900">{farmers.length}</p>
            </div>
            <Users className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Data Stored</p>
              <p className="text-2xl font-bold text-blue-900">{filecoinStats?.totalStorage || '0 MB'}</p>
            </div>
            <Database className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Active Crops</p>
              <p className="text-2xl font-bold text-orange-900">{crops.length}</p>
            </div>
            <Leaf className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">On-Chain Storage</p>
              <p className="text-2xl font-bold text-purple-900">{onChainStorage ? (onChainStorage.totalStorage / 1024 / 1024).toFixed(2) + ' MB' : 'N/A'}</p>
            </div>
            <Globe className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Database className="w-5 h-5 mr-2 text-blue-500" />
          Filecoin Network Status
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{filecoinStats?.totalStorage || '0 MB'}</p>
            <p className="text-sm text-gray-600">Total Storage</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{filecoinStats?.totalFiles || 0}</p>
            <p className="text-sm text-gray-600">Total Files</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{filecoinStats?.provider || 'Lighthouse'}</p>
            <p className="text-sm text-gray-600">Provider</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">{health}</p>
            <p className="text-sm text-gray-600">Network Status</p>
          </div>
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-green-500" />
          Recent Platform Activity
        </h3>
        <div className="space-y-3">
          {uploads.slice(0, 3).map(upload => (
            <div key={upload.id} className="flex items-center justify-between py-2 border-b border-gray-100">
              <div className="flex items-center">
                <Upload className="w-4 h-4 text-blue-500 mr-2" />
                <span className="text-sm">Uploaded {upload.fileName} to Filecoin</span>
              </div>
              <span className="text-xs text-gray-500">{new Date(upload.timestamp).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Farmers Tab
  const FarmersTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Registered Farmers</h2>
        <form onSubmit={handleFarmerRegister} className="flex space-x-2">
          <input
            type="text"
            placeholder="Name"
            value={farmer.name}
            onChange={(e) => setFarmer({ ...farmer, name: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Location"
            value={farmer.location}
            onChange={(e) => setFarmer({ ...farmer, location: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Crop Types (comma-separated)"
            value={farmer.cropTypes}
            onChange={(e) => setFarmer({ ...farmer, cropTypes: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="number"
            placeholder="Land Size (hectares)"
            value={farmer.landSize}
            onChange={(e) => setFarmer({ ...farmer, landSize: e.target.value })}
            className="border p-2 rounded"
          />
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
          >
            <Users className="w-4 h-4 mr-2" />
            Add New Farmer
          </button>
        </form>
      </div>
      <div className="grid gap-4">
        {farmers.map(farmer => (
          <div key={farmer.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{farmer.name}</h3>
                <p className="text-gray-600 flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {farmer.location}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                farmer.status === 'verified' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {farmer.status}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Land Size</p>
                <p className="font-medium">{farmer.landSize}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Crop Types</p>
                <p className="font-medium">{farmer.cropTypes.join(', ')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Update</p>
                <p className="font-medium">{farmer.lastUpdate}</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">Filecoin Storage CID:</p>
              <p className="text-xs font-mono break-all text-blue-600">{farmer.filecoinCID}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Storage Tab
  const StorageTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Filecoin Storage Management</h2>
        <form onSubmit={handleFileAsyncUpload} className="flex items-center space-x-2">
          <label className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer flex items-center">
            <CloudUpload className="w-4 h-4 mr-2" />
            Upload to Filecoin
            <input 
              type="file" 
              className="hidden" 
              onChange={(e) => setFile(e.target.files[0])}
            />
          </label>
          {isUploading && (
            <div className="flex items-center">
              <div className="bg-blue-200 rounded-full h-2 w-24">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
              </div>
              <p className="text-sm text-blue-600 ml-2">{uploadProgress}%</p>
            </div>
          )}
        </form>
      </div>
      {isUploading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-blue-800">Uploading to Filecoin network...</span>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-500" />
            Recent Uploads
          </h3>
          <div className="space-y-3">
            {uploads.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No files uploaded yet</p>
            ) : (
              uploads.slice(0, 5).map(upload => (
                <div key={upload.id} className="border-b border-gray-100 pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">{upload.fileName}</p>
                      <p className="text-xs text-gray-500">Size: {upload.size}</p>
                      <a href={upload.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 font-mono">{upload.cid}</a>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">{upload.status}</span>
                      <button
                        onClick={() => handleFileRetrieve(upload.cid)}
                        className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 flex items-center"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Retrieve
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-purple-500" />
            Storage Analytics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Storage Used</span>
              <span className="text-sm font-medium">{filecoinStats?.totalStorage || '0 MB'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Files</span>
              <span className="text-sm font-medium">{filecoinStats?.totalFiles || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Provider</span>
              <span className="text-sm font-medium">{filecoinStats?.provider || 'Lighthouse'}</span>
            </div>
          </div>
        </div>
      </div>
      {fileInfoModal && (
        <FileInfoModal fileInfoModal={fileInfoModal} onClose={() => setFileInfoModal(null)} />
      )}
    </div>
  );

  // Supply Chain Tab
  const SupplyChainTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Supply Chain Tracking</h2>
        <form onSubmit={handleSupplyChainCreation} className="flex space-x-2">
          <input
            type="text"
            placeholder="Crop ID"
            value={crop.farmerId}
            onChange={(e) => setCrop({ ...crop, farmerId: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Location"
            value={crop.location}
            onChange={(e) => setCrop({ ...crop, location: e.target.value })}
            className="border p-2 rounded"
          />
          <button
            type="submit"
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center"
          >
            <Truck className="w-4 h-4 mr-2" />
            Create Supply Chain
          </button>
        </form>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Truck className="w-5 h-5 mr-2 text-orange-500" />
          Active Shipments
        </h3>
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-medium">Batch #AG2025-001</h4>
                <p className="text-sm text-gray-600">Cassava from Adebayo Farms</p>
              </div>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">In Transit</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <span>Harvested - Ogun State</span>
                <span className="ml-auto text-gray-500">Aug 8, 2025</span>
              </div>
              <div className="flex items-center text-sm">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <span>Quality Verified - Processing Center</span>
                <span className="ml-auto text-gray-500">Aug 9, 2025</span>
              </div>
              <div className="flex items-center text-sm">
                <Clock className="w-4 h-4 text-blue-500 mr-2" />
                <span>In Transit to Lagos Market</span>
                <span className="ml-auto text-gray-500">Aug 10, 2025</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Crops Tab
  const CropsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Crop Management</h2>
        <form onSubmit={handleCropRegister} className="flex space-x-2 flex-wrap">
          <input
            type="text"
            placeholder="Crop Type"
            value={crop.cropType}
            onChange={(e) => setCrop({ ...crop, cropType: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="date"
            placeholder="Planting Date"
            value={crop.plantingDate}
            onChange={(e) => setCrop({ ...crop, plantingDate: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="date"
            placeholder="Expected Harvest Date"
            value={crop.expectedHarvestDate}
            onChange={(e) => setCrop({ ...crop, expectedHarvestDate: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="number"
            placeholder="Soil pH"
            value={crop.soilPH}
            onChange={(e) => setCrop({ ...crop, soilPH: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="number"
            placeholder="Soil Moisture"
            value={crop.soilMoisture}
            onChange={(e) => setCrop({ ...crop, soilMoisture: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="number"
            placeholder="Organic Matter"
            value={crop.organicMatter}
            onChange={(e) => setCrop({ ...crop, organicMatter: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Farmer ID"
            value={crop.farmerId}
            onChange={(e) => setCrop({ ...crop, farmerId: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Location"
            value={crop.location}
            onChange={(e) => setCrop({ ...crop, location: e.target.value })}
            className="border p-2 rounded"
          />
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
          >
            <Leaf className="w-4 h-4 mr-2" />
            Add New Crop
          </button>
        </form>
      </div>
      <div className="grid gap-4">
        {crops.map(crop => {
          const farmer = farmers.find(f => f.id === crop.farmerId);
          return (
            <div key={crop.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{crop.type}</h3>
                  <p className="text-gray-600">{farmer?.name} - {farmer?.location}</p>
                </div>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs">
                  {crop.currentStage}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Planted</p>
                  <p className="font-medium">{crop.plantingDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Expected Harvest</p>
                  <p className="font-medium">{crop.expectedHarvest}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Predicted Yield</p>
                  <p className="font-medium text-green-600">{crop.predictions.yield}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Quality Grade</p>
                  <p className="font-medium text-blue-600">{crop.predictions.quality}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600 mb-1">Soil Conditions</p>
                  <p className="text-sm font-medium">{crop.soilData}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600 mb-1">IPFS Data Hash</p>
                  <p className="text-xs font-mono text-blue-600">{crop.ipfsHash}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Analytics Tab
  const AnalyticsTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">AI-Powered Analytics</h2>
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
          Yield Prediction
        </h3>
        <form onSubmit={handlePrediction} className="flex space-x-2 flex-wrap">
          <input
            type="text"
            placeholder="Crop Type"
            value={predictionData.cropType}
            onChange={(e) => setPredictionData({ ...predictionData, cropType: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="number"
            placeholder="Soil pH"
            value={predictionData.soilData.pH}
            onChange={(e) => setPredictionData({ ...predictionData, soilData: { ...predictionData.soilData, pH: e.target.value } })}
            className="border p-2 rounded"
          />
          <input
            type="number"
            placeholder="Soil Moisture"
            value={predictionData.soilData.moisture}
            onChange={(e) => setPredictionData({ ...predictionData, soilData: { ...predictionData.soilData, moisture: e.target.value } })}
            className="border p-2 rounded"
          />
          <input
            type="number"
            placeholder="Organic Matter"
            value={predictionData.soilData.organicMatter}
            onChange={(e) => setPredictionData({ ...predictionData, soilData: { ...predictionData.soilData, organicMatter: e.target.value } })}
            className="border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Location"
            value={predictionData.location}
            onChange={(e) => setPredictionData({ ...predictionData, location: e.target.value })}
            className="border p-2 rounded"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Predict Yield
          </button>
        </form>
        {predictionResult && (
          <p className="mt-4 text-green-600">{predictionResult}</p>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-blue-500" />
            Market Intelligence
          </h3>
          <div className="space-y-4">
            {marketData?.crops?.map((crop, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm">{crop.type}</span>
                <span className="font-medium">{crop.currentPrice} NGN ({crop.trend})</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-purple-500" />
            Farmer Analytics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Total Crops</span>
              <span className="font-medium">{analytics?.overview.totalCrops || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Estimated Value</span>
              <span className="font-medium">{analytics?.financial.estimatedValue || 0} NGN</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Profit Margin</span>
              <span className="font-medium">{(analytics?.financial.profitMargin * 100 || 0).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-green-600 rounded-lg p-2 mr-3">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">AgriStore Nigeria</h1>
              <p className="text-sm text-gray-600">Powered by Filecoin Network</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={connectWallet}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              {walletAddress ? `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Connect Wallet'}
            </button>
            <div className="text-right">
              <p className="text-sm text-gray-600">Network Status</p>
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${health === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={`text-sm font-medium ${health === 'healthy' ? 'text-green-600' : 'text-red-600'}`}>
                  {health.charAt(0).toUpperCase() + health.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>
      {error && (
        <div className="bg-red-100 text-red-700 p-4 mx-6 mt-4 rounded">
          {error}
        </div>
      )}
      <nav className="bg-white border-b border-gray-200 px-6">
        <div className="flex space-x-8">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'farmers', label: 'Farmers', icon: Users },
            { id: 'crops', label: 'Crops', icon: Leaf },
            { id: 'storage', label: 'Storage', icon: Database },
            { id: 'supply-chain', label: 'Supply Chain', icon: Truck },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>
      <main className="px-6 py-8">
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'farmers' && <FarmersTab />}
        {activeTab === 'crops' && <CropsTab />}
        {activeTab === 'storage' && <StorageTab />}
        {activeTab === 'supply-chain' && <SupplyChainTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
      </main>
      <footer className="bg-white border-t border-gray-200 px-6 py-4 mt-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-600">
            <Shield className="w-4 h-4 mr-1" />
            <span>Secured by Filecoin Network</span>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>ETHNigeria 2025 Hackathon</span>
            <span>•</span>
            <span>Built for Nigerian Agriculture</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AgriStoreNigeria;