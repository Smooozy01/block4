import { useState, useEffect } from "react";
import { ethers } from "ethers";
import MarketplaceABI from "./abis/AIModelMarketplace.json";
import TokenABI from "./abis/ERC20Token.json";
import { Button } from "./components/ui/button";
import { Card, CardContent } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Textarea } from "./components/ui/textarea";
import { BrowserRouter as Router, Route, Link, Routes } from "react-router-dom";

const MARKETPLACE_ADDRESS = "0xB9FA9b847B2863c845F9736204D523263254Fd45";
const TOKEN_ADDRESS = "0x922E8f89E731443000CfFaFf086892369a4CD15A";

export default function App() {
    const [wallet, setWallet] = useState(null);
    const [balance, setBalance] = useState("0");
    const [models, setModels] = useState([]);
    const [myModels, setMyModels] = useState([]);
    const [newModel, setNewModel] = useState({ name: "", description: "", price: "", link: "" });

    async function connectWallet() {
        if (!window.ethereum) return alert("Please install MetaMask");
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        setWallet(signer);
        fetchBalance(signer);
        fetchModels();
        fetchMyModels(signer);
    }

    async function fetchBalance(signer) {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const contract = new ethers.Contract(TOKEN_ADDRESS, TokenABI.abi, provider);
            const userAddress = await signer.getAddress();
            console.log("Fetching balance for address:", userAddress);
            const userBalance = await contract.balanceOf(userAddress);
            console.log("Balance fetched successfully:", userBalance);
            setBalance(ethers.formatUnits(userBalance, 18));
        } catch (error) {
            console.error("Error fetching balance:", error);
        }
    }

    async function fetchModels() {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const contract = new ethers.Contract(MARKETPLACE_ADDRESS, MarketplaceABI.abi, provider);
            const data = await contract.getModels();

            const formattedModels = data.map((model, index) => ({
                id: index,
                name: model.name,
                description: model.description,
                price: ethers.formatUnits(model.price, 18),
                seller: model.seller,
                sold: model.sold,
            }));

            setModels(formattedModels);
        } catch (error) {
            console.error("Error fetching models:", error);
        }
    }

    async function fetchMyModels(signer) {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const contract = new ethers.Contract(MARKETPLACE_ADDRESS, MarketplaceABI.abi, provider);
            const data = await contract.getMyModels(await signer.getAddress());

            const formattedMyModels = data.map((model, index) => ({
                id: index,
                name: model.name,
                description: model.description,
                price: ethers.formatUnits(model.price, 18),
                link: model.accessLink,
            }));

            setMyModels(formattedMyModels);
        } catch (error) {
            console.error("Error fetching my models:", error);
        }
    }

    async function buyModel(modelId, price) {
        if (!wallet) return alert("Connect your wallet first");

        try {
            const tokenContract = new ethers.Contract(TOKEN_ADDRESS, TokenABI.abi, wallet);
            const marketplaceContract = new ethers.Contract(MARKETPLACE_ADDRESS, MarketplaceABI.abi, wallet);

            // Approve token transfer
            const amount = ethers.parseUnits(price, 18);
            const approvalTx = await tokenContract.approve(MARKETPLACE_ADDRESS, amount);
            await approvalTx.wait();

            // Buy the model
            const buyTx = await marketplaceContract.buyModel(modelId, {gasLimit: 500000});
            await buyTx.wait();

            fetchModels();
            fetchMyModels(wallet);
            alert("Purchase successful!");
        } catch (error) {
            console.error("Transaction failed:", error);
            alert("Transaction failed: " + (error.reason || error.message));
        }
    }

    async function createModel() {
        if (!wallet) return alert("Connect your wallet first");
        const contract = new ethers.Contract(MARKETPLACE_ADDRESS, MarketplaceABI.abi, wallet);
        await contract.listModel(newModel.name, newModel.description, ethers.parseUnits(newModel.price, 18), newModel.link);
        fetchModels();
    }

    return (
        <Router>
            <div className="p-6 max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold mb-4">AI Model Marketplace</h1>
                <Button onClick={connectWallet}>{wallet ? "Wallet Connected" : "Connect Wallet"}</Button>
                <p className="mt-2">Balance: {balance} Tokens</p>
                <nav className="mt-4">
                    <Link to="/" className="mr-4">Marketplace</Link>
                    <Link to="/my-models">My Models</Link>
                </nav>
                <Routes>
                    <Route path="/" element={
                        <>
                            <h2 className="text-xl font-bold mt-6">Available AI Models</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                {models.map((model, index) => (
                                    <Card key={index}>
                                        <CardContent>
                                            <h3 className="text-lg font-bold">{model.name}</h3>
                                            <p>{model.description}</p>
                                            <p>Price: {model.price} Tokens</p>
                                            {model.sold ? (
                                                <p className="text-red-500">Sold</p>
                                            ) : (
                                                <Button onClick={() => buyModel(model.id, model.price)}>Buy</Button>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            <h2 className="text-xl font-bold mt-6">Create AI Model</h2>
                            <div className="mt-4 space-y-2">
                                <Input placeholder="Model Name" onChange={(e) => setNewModel({ ...newModel, name: e.target.value })} />
                                <Textarea placeholder="Description" onChange={(e) => setNewModel({ ...newModel, description: e.target.value })} />
                                <Input placeholder="Price in Tokens" onChange={(e) => setNewModel({ ...newModel, price: e.target.value })} />
                                <Input placeholder="Model Link" onChange={(e) => setNewModel({ ...newModel, link: e.target.value })} />
                                <Button onClick={createModel}>List Model</Button>
                            </div>
                        </>
                    } />
                    <Route path="/my-models" element={
                        <>
                            <h2 className="text-xl font-bold mt-6">My Purchased AI Models</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                {myModels.map((model, index) => (
                                    <Card key={index}>
                                        <CardContent>
                                            <h3 className="text-lg font-bold">{model.name}</h3>
                                            <p>{model.description}</p>
                                            <p>Price: {model.price} Tokens</p>
                                            <p>Link: <a href={model.link} target="_blank" rel="noopener noreferrer">{model.link}</a></p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </>
                    } />
                </Routes>
            </div>
        </Router>
    );
}
