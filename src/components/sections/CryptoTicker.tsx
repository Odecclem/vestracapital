"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface CoinData {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  icon: string;
}

const coins = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin", icon: "₿" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum", icon: "Ξ" },
  { id: "tether", symbol: "USDT", name: "Tether", icon: "₮" },
  { id: "binancecoin", symbol: "BNB", name: "BNB", icon: "BNB" },
];

export default function CryptoTicker() {
  const [cryptoData, setCryptoData] = useState<CoinData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        const ids = coins.map(c => c.id).join(",");
        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        const formattedData = coins.map(coin => ({
          ...coin,
          price: data[coin.id]?.usd || 0,
          change24h: data[coin.id]?.usd_24h_change || 0,
        }));
        
        setCryptoData(formattedData);
      } catch (error) {
        console.warn("Failed to fetch crypto data, using fallback data:", error);
        // Fallback data in case of rate limiting
        const fallbackData = coins.map(coin => ({
          ...coin,
          price: coin.id === 'bitcoin' ? 64000 : coin.id === 'ethereum' ? 3400 : 1.00,
          change24h: 0,
        }));
        setCryptoData(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    fetchCryptoData();
    
    // Refresh every 60 seconds
    const interval = setInterval(fetchCryptoData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="h-16 bg-[#0a0a0a] flex items-center justify-center text-[#6b7280]">Loading market data...</div>;

  return (
    <div className="bg-[#0a0a0a] border-y border-gray-800 py-3 overflow-hidden flex whitespace-nowrap">
      <div className="animate-[ticker_30s_linear_infinite] flex items-center shrink-0">
        {[...cryptoData, ...cryptoData, ...cryptoData].map((coin, index) => (
          <div key={`${coin.id}-${index}`} className="flex items-center space-x-3 px-8 border-r border-gray-800 last:border-0">
            <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-white font-bold text-xs">
              {coin.icon}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="text-white font-semibold">{coin.symbol}</span>
                <span className="text-gray-400 text-sm">{coin.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-white font-medium">
                  ${coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                </span>
                <span className={`flex items-center text-xs font-medium ${coin.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {coin.change24h >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {Math.abs(coin.change24h).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
