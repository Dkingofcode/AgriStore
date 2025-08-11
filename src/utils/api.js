import axios from "axios";

const API = axios.create({
  baseURL: "https://agristorebackend.onrender.com/api",
});

// Example calls
export const healthCheck = () => API.get("/health");
export const uploadFile = (formData) =>
  API.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const registerFarmer = (data) => API.post("/farmers/register", data);
export const registerCrop = (data) => API.post("/crops/register", data);
export const predictYield = (data) => API.post("/ai/predict-yield", data);
export const getMarketIntelligence = () => API.get("/market/intelligence");
export const createSupplyChain = (data) => API.post("/supply-chain/create", data);
export const getFarmerAnalytics = (id) => API.get(`/analytics/farmer/${id}`);
export const getStorageStats = () => API.get("/lighthouse/stats");
export const retrieveFile = (cid, walletAddress) => API.get(`/retieve/${cid}`, { params: { walletAddress } });


export default API;
