import { useState, useEffect } from "react";
import { ethers } from "ethers";
import MarketplaceABI from "./abis/AIModelMarketplace.json";
import { Button } from "./components/ui/button";
import { Card, CardContent } from "./components/ui/card";

const MARKETPLACE_ADDRESS = "0xB9FA9b847B2863c845F9736204D523263254Fd45";

export default function MyModels({ wallet }) {
    const [myModels, setMyModels] = useState([]);

    useEffect(() => {
        if (wallet) {
            fetchMyModels();
        }
    }, [wallet]);

    async function fetchMyModels() {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const contract = new ethers.Contract(MARKETPLACE_ADDRESS, MarketplaceABI.abi, provider);

            // Get all models
            const totalModels = await contract.getModels();
            const myAddress = await wallet.getAddress();

            // Filter models where the user is the buyer
            const userModels = [];
            for (let i = 0; i < totalModels.length; i++) {
                const buyer = await contract.buyers(i);
                if (buyer.toLowerCase() === myAddress.toLowerCase()) {
                    userModels.push({ id: i, ...totalModels[i] });
                }
            }

            setMyModels(userModels);
        } catch (error) {
            console.error("Error fetching models:", error);
        }
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">My Purchased AI Models</h1>

            {myModels.length === 0 ? (
                <p>You haven't purchased any models yet.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {myModels.map((model, index) => (
                        <Card key={index}>
                            <CardContent>
                                <h3 className="text-lg font-bold">{model.name}</h3>
                                <p>{model.description}</p>
                                <a href={model.accessLink} target="_blank" className="text-blue-500">Access Model</a>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Button onClick={fetchMyModels} className="mt-4">Refresh List</Button>
        </div>
    );
}
