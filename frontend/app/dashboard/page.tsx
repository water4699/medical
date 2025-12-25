"use client";

import { useFhevm } from "../../fhevm/useFhevm";
import { useInMemoryStorage } from "../../hooks/useInMemoryStorage";
import { useWagmiEthersSigner } from "@/hooks/wagmi/useWagmiEthersSigner";
import { useTemperatureCheck } from "@/hooks/useTemperatureCheck";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState, useEffect, useMemo } from "react";

export default function DashboardPage() {
  const { storage: fhevmDecryptionSignatureStorage } = useInMemoryStorage();
  const {
    provider,
    chainId,
    isConnected,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
    initialMockChains,
  } = useWagmiEthersSigner();

  const [mounted, setMounted] = useState(false);
  const [animatedValues, setAnimatedValues] = useState({
    temperature: 0,
    feverCount: 0,
    normalCount: 0,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    instance: fhevmInstance,
  } = useFhevm({
    provider,
    chainId,
    initialMockChains,
    enabled: true,
  });

  const temperatureCheck = useTemperatureCheck({
    instance: fhevmInstance,
    fhevmDecryptionSignatureStorage,
    eip1193Provider: provider,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
  });

  // Calculate real statistics from contract data
  const stats = useMemo(() => {
    const tempValue = temperatureCheck.clearTemperature 
      ? Number(temperatureCheck.clearTemperature) / 10 
      : null;
    const hasFever = temperatureCheck.clearFeverResult === true;
    const isNormal = temperatureCheck.clearFeverResult === false;

    return {
      temperature: tempValue,
      hasFever,
      isNormal,
      hasData: Boolean(
        temperatureCheck.temperatureHandle && 
        temperatureCheck.temperatureHandle !== "0" && 
        temperatureCheck.temperatureHandle !== "0x0000000000000000000000000000000000000000"
      ),
      isDecrypted: tempValue !== null || temperatureCheck.clearFeverResult !== undefined,
      lastUpdate: temperatureCheck.message || "No data yet",
    };
  }, [
    temperatureCheck.clearTemperature,
    temperatureCheck.clearFeverResult,
    temperatureCheck.temperatureHandle,
    temperatureCheck.message,
  ]);

  // Number animation effect
  useEffect(() => {
    if (stats.temperature !== null) {
      let current = 0;
      const target = stats.temperature;
      const increment = target / 30;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        setAnimatedValues(prev => ({ ...prev, temperature: Math.round(current * 10) / 10 }));
      }, 30);
      return () => clearInterval(timer);
    }
  }, [stats.temperature]);

  if (!mounted) {
    return (
      <div className="mx-auto text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
        <p className="text-lg text-gray-700 mt-4">Loading...</p>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 w-full page-transition">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="text-7xl mb-6">📊</div>
          <h2 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Data Dashboard
          </h2>
          <p className="text-indigo-200 text-xl">
            Connect your wallet to view temperature statistics
          </p>
        </div>
        <ConnectButton />
      </div>
    );
  }

  if (temperatureCheck.isDeployed === false) {
    return (
      <div className="mx-auto text-center py-12">
        <p className="text-red-600 font-semibold">Contract not deployed on this network</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-transition">
      {/* Page Header */}
      <div className="panel-card mb-6 slide-in-right">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl shadow-lg">
            📊
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-indigo-300 mt-1">Real-time temperature data overview</p>
          </div>
        </div>
      </div>

      {/* Main Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          icon="🌡️"
          label="Current Temperature"
          value={stats.temperature !== null ? `${animatedValues.temperature}°C` : "—"}
          color="from-blue-500 to-cyan-500"
          delay={0}
        />
        <StatCard
          icon="📈"
          label="Status"
          value={stats.hasFever ? "FEVER" : stats.isNormal ? "NORMAL" : "—"}
          color={stats.hasFever ? "from-red-500 to-pink-500" : stats.isNormal ? "from-green-500 to-emerald-500" : "from-gray-400 to-gray-500"}
          delay={1}
        />
        <StatCard
          icon="🔒"
          label="Data Status"
          value={stats.isDecrypted ? "Decrypted" : stats.hasData ? "Encrypted" : "No Data"}
          color={stats.isDecrypted ? "from-green-500 to-emerald-500" : stats.hasData ? "from-yellow-500 to-orange-500" : "from-gray-400 to-gray-500"}
          delay={2}
        />
        <StatCard
          icon="✅"
          label="Contract Status"
          value={temperatureCheck.isDeployed ? "Deployed" : "Not Deployed"}
          color={temperatureCheck.isDeployed ? "from-green-500 to-emerald-500" : "from-red-500 to-pink-500"}
          delay={3}
        />
      </div>

      {/* Detailed Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Temperature Details */}
        <div className="panel-card card-enter" style={{ animationDelay: '0.4s' }}>
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="text-2xl">🌡️</span>
            Temperature Details
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-600">Current Reading</span>
                <span className="text-2xl font-bold text-indigo-600">
                  {stats.temperature !== null ? `${stats.temperature}°C` : "—"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Fever Threshold</span>
                <span className="text-sm font-semibold text-gray-700">≥37.5°C</span>
              </div>
            </div>
            {stats.hasFever && (
              <div className="p-4 bg-gradient-to-br from-red-50 to-pink-50 rounded-lg border border-red-100">
                <div className="flex items-center gap-2">
                  <span className="text-xl">⚠️</span>
                  <span className="font-semibold text-red-700">Fever Detected</span>
                </div>
                <p className="text-sm text-red-600 mt-1">Temperature is at or above 37.5°C</p>
              </div>
            )}
            {stats.isNormal && (
              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-100">
                <div className="flex items-center gap-2">
                  <span className="text-xl">✅</span>
                  <span className="font-semibold text-green-700">Normal Temperature</span>
                </div>
                <p className="text-sm text-green-600 mt-1">Temperature is below 37.5°C</p>
              </div>
            )}
          </div>
        </div>

        {/* System Status */}
        <div className="panel-card card-enter" style={{ animationDelay: '0.5s' }}>
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="text-2xl">⚙️</span>
            System Status
          </h3>
          <div className="space-y-4">
            <StatusItem
              label="FHEVM Instance"
              value={fhevmInstance ? "Connected" : "Disconnected"}
              isGood={!!fhevmInstance}
            />
            <StatusItem
              label="Contract"
              value={temperatureCheck.isDeployed ? "Deployed" : "Not Deployed"}
              isGood={!!temperatureCheck.isDeployed}
            />
            <StatusItem
              label="Network"
              value={`Chain ${chainId || "Unknown"}`}
              isGood={true}
            />
            <StatusItem
              label="Wallet"
              value={isConnected ? "Connected" : "Disconnected"}
              isGood={isConnected}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="panel-card card-enter" style={{ animationDelay: '0.6s' }}>
        <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            className="btn-modern btn-success"
            disabled={!temperatureCheck.canDecrypt}
            onClick={temperatureCheck.decryptResults}
          >
            {temperatureCheck.canDecrypt
              ? "Decrypt Results"
              : temperatureCheck.isDecrypting
                ? "Decrypting..."
                : "Nothing to decrypt"}
          </button>
          <button
            className="btn-modern"
            disabled={!temperatureCheck.canGetTemperature}
            onClick={temperatureCheck.refreshTemperature}
          >
            {temperatureCheck.canGetTemperature
              ? "Refresh Data"
              : "Cannot refresh"}
          </button>
        </div>
      </div>

      {/* Message */}
      {temperatureCheck.message && (
        <div className="panel-card card-enter" style={{ animationDelay: '0.7s' }}>
          <div className="flex items-start gap-3">
            <span className="text-2xl">ℹ️</span>
            <div>
              <p className="font-semibold text-gray-800 mb-1">System Message</p>
              <p className="text-sm text-gray-600">{temperatureCheck.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* FHEVM Status Notice */}
      {!fhevmInstance && isConnected && (
        <div className="panel-card card-enter border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50" style={{ animationDelay: '0.8s' }}>
          <div className="flex items-start gap-3">
            <span className="text-2xl">ℹ️</span>
            <div>
              <p className="font-semibold text-blue-800 mb-1">FHEVM Initialization</p>
              <p className="text-sm text-blue-700">
                FHEVM is initializing. Console warnings about COOP headers and network requests are normal in development.
                The app will automatically use mock FHEVM on localhost if the relayer is unavailable.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
  delay,
}: {
  icon: string;
  label: string;
  value: string;
  color: string;
  delay: number;
}) {
  return (
    <div 
      className="panel-card card-enter"
      style={{ animationDelay: `${delay * 0.1}s` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-2xl shadow-lg`}>
          {icon}
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-sm text-gray-600">{label}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-gray-800">{value}</span>
        </div>
      </div>
    </div>
  );
}

function StatusItem({
  label,
  value,
  isGood,
}: {
  label: string;
  value: string;
  isGood: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${
            isGood ? "bg-green-400" : "bg-red-400"
          }`}
        ></div>
        <span className="text-sm font-medium text-gray-800">{value}</span>
      </div>
    </div>
  );
}

