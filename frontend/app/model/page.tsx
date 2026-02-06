"use client";

import { useState, useEffect } from "react";
import AvatarScene from "@/app/components/avatar/AvatarScene";
import ConfiguratorPanel from "@/app/components/avatar/ConfiguratorPanel";
import Link from "next/link";
import { visualizationApi } from "@/app/lib/api/client";
import { Avatar } from "@/app/types/visualization";



const ACTIONS = [
    { id: "Idle", icon: "🧍", label: "Idle" },
    { id: "Walk", icon: "🚶", label: "Walk" },
    { id: "Run", icon: "🏃", label: "Run" },
    { id: "Sit", icon: "🪑", label: "Sit" },
];

const ENVIRONMENTS: { id: 'apartment' | 'city' | 'dawn' | 'forest' | 'lobby' | 'night' | 'park' | 'studio' | 'sunset' | 'warehouse', label: string }[] = [
    { id: "city", label: "City" },
    { id: "sunset", label: "Sunset" },
    { id: "studio", label: "Studio" },
    { id: "park", label: "Park" },
    { id: "apartment", label: "Apartment" },
    { id: "dawn", label: "Dawn" },
    { id: "forest", label: "Forest" },
    { id: "lobby", label: "Lobby" },
    { id: "night", label: "Night" },
    { id: "warehouse", label: "Warehouse" },
];

export default function ModelPage() {
    const [avatars, setAvatars] = useState<Avatar[]>([]);
    const [currentAvatar, setCurrentAvatar] = useState<Avatar | null>(null);
    const [loading, setLoading] = useState(true);

    const [selectedCategory, setSelectedCategory] = useState<"shirts" | "pants">("shirts");
    const [selectedShirt, setSelectedShirt] = useState<string | null>(null);
    const [selectedPant, setSelectedPant] = useState<string | null>(null);
    const [actionName, setActionName] = useState<string>("Idle");
    const [environment, setEnvironment] = useState<'apartment' | 'city' | 'dawn' | 'forest' | 'lobby' | 'night' | 'park' | 'studio' | 'sunset' | 'warehouse'>("city");

    useEffect(() => {
        const fetchAvatars = async () => {
            try {
                const data = await visualizationApi.getAvatars();
                setAvatars(data);
                if (data.length > 0) {
                    setCurrentAvatar(data[0]);
                }
            } catch (error) {
                console.error("Failed to fetch avatars:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAvatars();
    }, []);

    // Reset selection when avatar changes
    useEffect(() => {
        setSelectedShirt(null);
        setSelectedPant(null);
    }, [currentAvatar]);

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading 3D Configurator...</div>;
    if (!currentAvatar) return <div className="min-h-screen flex items-center justify-center">No avatars found.</div>;

    // Filter assets for the current avatar
    const availableShirts = currentAvatar.assets.filter(a => a.type === 'shirt');
    const availablePants = currentAvatar.assets.filter(a => a.type === 'pant');

    // Find full URLs for selected assets
    const shirtUrl = availableShirts.find(s => s.slug === selectedShirt)?.file || null;
    const pantUrl = availablePants.find(p => p.slug === selectedPant)?.file || null;

    return (
        <div className="min-h-screen bg-white pb-8 animate-in fade-in duration-700">
            {/* Main Content Card Container */}
            <div className="container mx-auto p-4 w-[95%] max-w-[1800px]">
                <div className="mb-8 pl-4">
                    <Link
                        href="/"
                        className="inline-flex items-center text-xs font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-[#0e4d80] font-body transition-colors group"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M10 19l-7-7m0 0l7-7m-7 7h18"
                            />
                        </svg>
                        Back to Home
                    </Link>
                </div>

                <div className="bg-white rounded-[3rem] md:rounded-[4rem] shadow-2xl shadow-blue-900/5 overflow-hidden border border-gray-100 relative h-auto md:h-[80vh] flex flex-col md:flex-row">
                    {/* 3D Scene Area */}
                    <div className="w-full md:flex-1 h-[50vh] md:h-full relative bg-neutral-50/50">

                        {/* Environment Controls (Top Left) */}
                        <div className="absolute top-6 left-6 z-10 bg-white/80 backdrop-blur-sm rounded-[2rem] p-3 shadow-lg shadow-blue-900/5 border border-white/50">
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-2 font-istok">Environment</div>
                            <div className="flex flex-col gap-1">
                                {ENVIRONMENTS.map(env => (
                                    <button
                                        key={env.id}
                                        onClick={() => setEnvironment(env.id)}
                                        className={cn(
                                            "px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-full text-left transition-all font-istok",
                                            environment === env.id
                                                ? "bg-[#0e4d80] text-white shadow-md shadow-blue-900/20"
                                                : "hover:bg-white text-gray-500 hover:text-[#0e4d80]"
                                        )}
                                    >
                                        {env.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Actions Bar (Bottom Floating) - Disabled for now
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 bg-white/80 backdrop-blur-md rounded-full p-2 shadow-xl shadow-blue-900/10 border border-white/50 flex gap-2">
                            {ACTIONS.map((action) => (
                                <button
                                    key={action.id}
                                    onClick={() => setActionName(action.id)}
                                    className={cn(
                                        "px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-3 font-istok",
                                        actionName === action.id
                                            ? "bg-[#0e4d80] text-white shadow-lg shadow-blue-900/20 scale-105"
                                            : "bg-transparent text-gray-500 hover:bg-white hover:text-[#0e4d80]"
                                    )}
                                >
                                    <span className="text-lg">{action.icon}</span>
                                    <span>{action.label}</span>
                                </button>
                            ))}
                        </div>
                        */}
                        <div className="w-full h-full">
                            <AvatarScene
                                baseModelUrl={currentAvatar.base_file}
                                shirtUrl={shirtUrl}
                                pantUrl={pantUrl}
                                actionName={actionName}
                                environmentPreset={environment}
                            />
                        </div>
                    </div>

                    {/* Configurator Sidebar */}
                    <div className="w-full md:w-[400px] h-[40vh] md:h-full md:border-l border-t md:border-t-0 border-gray-100 bg-white relative z-20">
                        <ConfiguratorPanel
                            selectedCategory={selectedCategory}
                            setSelectedCategory={setSelectedCategory}
                            selectedShirt={selectedShirt}
                            setSelectedShirt={setSelectedShirt}
                            selectedPant={selectedPant}
                            setSelectedPant={setSelectedPant}
                            availableShirts={availableShirts}
                            availablePants={availablePants}
                            avatars={avatars}
                            currentAvatar={currentAvatar}
                            setCurrentAvatar={setCurrentAvatar}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function cn(...classes: (string | undefined | null | boolean)[]) {
    return classes.filter(Boolean).join(" ");
}
