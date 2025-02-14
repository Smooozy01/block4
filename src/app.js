import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";

const CONTRACT_ADDRESS = "0x141Ea35c89204617da05F297E1b44ec2a71a5660";
const TOKEN_ADDRESS = "0x4D214ad5CA15e3486a947CF36C007f6c873dC7E2";

function App() {
    const [account, setAccount] = useState(null);
    const [balance, setBalance] = useState(0);
    const [models, setModels] = useState([]);

    // Connect to MetaMask
    const connectWallet = async () => {
        if (window.ethereum) {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await provider.send("eth_requestAccounts", []);
            setAccount(accounts[0]);
            fetchBalance(accounts[0], provider);
        } else {
            alert("Please install MetaMask!");
        }
    };

    // Fetch ERC-20 Token Balance
    const fetchBalance = async (wallet, provider) => {
        const tokenContract = new ethers.Contract(TOKEN_ADDRESS, [
            "function balanceOf(address) view returns (uint256)"
        ], provider);
        const balance = await tokenContract.balanceOf(wallet);
        setBalance(ethers.formatUnits(balance, 18));
    };

    // Fetch AI Models from Smart Contract (Stub)
    useEffect(() => {
        // This should call the blockchain to get the models
        setModels([
            { id: 1, name: "AI Model A", description: "Description A", price: "10", seller: "0x123..." },
            { id: 2, name: "AI Model B", description: "Description B", price: "15", seller: "0x456..." }
        ]);
    }, []);

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold">AI Marketplace</h1>
            {!account ? (
                <Button onClick={connectWallet}>Connect Wallet</Button>
            ) : (
                <div>
                    <p>Connected Wallet: {account}</p>
                    <p>Token Balance: {balance} MPT</p>
                </div>
            )}
            <h2 className="mt-4 font-bold">AI Models for Sale</h2>
            <ul>
                {models.map(model => (
                    <li key={model.id} className="border p-2 mt-2">
                        <h3>{model.name}</h3>
                        <p>{model.description}</p>
                        <p>Price: {model.price} MPT</p>
                        <p>Seller: {model.seller}</p>
                        <Button>Buy</Button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;
