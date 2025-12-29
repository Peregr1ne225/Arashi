"use client";

import { useState } from "react";
import AvatarScene from "@/components/AvatarScene";
import ConfiguratorPanel from "@/components/ConfiguratorPanel";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";



const ACTIONS = [
    { id: "Idle", icon: "🧍", label: "Idle" },
    { id: "Walk", icon: "🚶", label: "Walk" },
    { id: "Run", icon: "🏃", label: "Run" },
    { id: "Sit", icon: "🪑", label: "Sit" },
];

const ENVIRONMENTS = [
    { id: "city", label: "City" },
    { id: "sunset", label: "Sunset" },
    { id: "studio", label: "Studio" },
    { id: "park", label: "Park" },
];

export default function ModelPage() {
    const [selectedCategory, setSelectedCategory] = useState<"shirts" | "pants">("shirts");
    const [selectedShirt, setSelectedShirt] = useState<string | null>(null);
    const [selectedPant, setSelectedPant] = useState<string | null>(null);
    const [actionName, setActionName] = useState<string>("Idle");
    const [environment, setEnvironment] = useState<string>("city");

    // Hardcoded for MVP
    const BASE_URL = "http://localhost:8000";
    const AVATAR_ID = "avatar1";

    return (
        <div className="flex h-screen w-full bg-neutral-50 overflow-hidden">
            {/* 3D Scene Area */}
            <div className="flex-1 relative">
                <header className="absolute top-0 left-0 p-6 z-10 w-full flex items-center justify-between pointer-events-none">
                    <Link
                        href="/"
                        className="pointer-events-auto flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md rounded-full shadow-sm text-sm font-medium hover:bg-white transition-colors"
                    >
                        <ChevronLeft size={16} />
                        Back to Shop
                    </Link>
                    <div className="px-4 py-2 bg-white/80 backdrop-blur-md rounded-full shadow-sm text-sm font-medium">
                        3D Configurator Alpha
                    </div>
                </header>

                {/* Environment Controls (Top Left) */}
                <div className="absolute top-24 left-6 z-10 bg-white/90 backdrop-blur rounded-lg p-2 shadow-sm border border-neutral-200">
                    <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2 px-1">Environment</div>
                    <div className="flex flex-col gap-1">
                        {ENVIRONMENTS.map(env => (
                            <button
                                key={env.id}
                                onClick={() => setEnvironment(env.id)}
                                className={cn(
                                    "px-3 py-1.5 text-xs font-medium rounded-md text-left transition-colors",
                                    environment === env.id
                                        ? "bg-black text-white"
                                        : "hover:bg-neutral-100 text-neutral-600"
                                )}
                            >
                                {env.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Actions Bar (Bottom Floating) */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 bg-white/90 backdrop-blur rounded-full p-2 shadow-lg border border-neutral-200 flex gap-2">
                    {ACTIONS.map((action) => (
                        <button
                            key={action.id}
                            onClick={() => setActionName(action.id)}
                            className={cn(
                                "px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2",
                                actionName === action.id
                                    ? "bg-black text-white shadow-md"
                                    : "bg-transparent text-neutral-600 hover:bg-neutral-100"
                            )}
                        >
                            <span>{action.icon}</span>
                            <span>{action.label}</span>
                        </button>
                    ))}
                </div>

                <AvatarScene
                    baseUrl={BASE_URL}
                    avatarId={AVATAR_ID}
                    selectedShirt={selectedShirt}
                    selectedPant={selectedPant}
                    actionName={actionName}
                    environmentPreset={environment}
                />
            </div>

            {/* Configurator Sidebar */}
            <div className="w-[400px] h-full shadow-xl z-20">
                <ConfiguratorPanel
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    selectedShirt={selectedShirt}
                    setSelectedShirt={setSelectedShirt}
                    selectedPant={selectedPant}
                    setSelectedPant={setSelectedPant}
                />
            </div>
        </div>
    );
}

function cn(...classes: (string | undefined | null | boolean)[]) {
    return classes.filter(Boolean).join(" ");
}
