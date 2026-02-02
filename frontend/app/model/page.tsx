"use client";

import { useState, useEffect } from "react";
import AvatarScene from "@/app/components/avatar/AvatarScene";
import ConfiguratorPanel from "@/app/components/avatar/ConfiguratorPanel";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
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
        <div className="flex h-[calc(100vh-var(--header-height,72px))] w-full bg-neutral-50 overflow-hidden">
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
                    baseModelUrl={currentAvatar.base_file}
                    shirtUrl={shirtUrl}
                    pantUrl={pantUrl}
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
                    availableShirts={availableShirts}
                    availablePants={availablePants}
                    avatars={avatars}
                    currentAvatar={currentAvatar}
                    setCurrentAvatar={setCurrentAvatar}
                />
            </div>
        </div>
    );
}

function cn(...classes: (string | undefined | null | boolean)[]) {
    return classes.filter(Boolean).join(" ");
}
