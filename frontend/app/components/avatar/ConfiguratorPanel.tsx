"use client";

import { Dispatch, SetStateAction } from "react";
import { Avatar, AvatarAsset } from "@/app/types/visualization";

interface ConfiguratorPanelProps {
    selectedCategory: "shirts" | "pants";
    setSelectedCategory: Dispatch<SetStateAction<"shirts" | "pants">>;
    selectedShirt: string | null;
    setSelectedShirt: Dispatch<SetStateAction<string | null>>;
    selectedPant: string | null;
    setSelectedPant: Dispatch<SetStateAction<string | null>>;
    availableShirts: AvatarAsset[];
    availablePants: AvatarAsset[];

    // New props for avatar selection
    avatars: Avatar[];
    currentAvatar: Avatar | null;
    setCurrentAvatar: Dispatch<SetStateAction<Avatar | null>>;
}

export default function ConfiguratorPanel({
    selectedCategory,
    setSelectedCategory,
    selectedShirt,
    setSelectedShirt,
    selectedPant,
    setSelectedPant,
    availableShirts,
    availablePants,
    avatars,
    currentAvatar,
    setCurrentAvatar
}: ConfiguratorPanelProps) {

    const items = selectedCategory === "shirts" ? availableShirts : availablePants;

    return (
        <div className="flex flex-col h-full bg-white/50">
            {/* Avatar Selector Section */}
            <div className="p-8 border-b border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 font-koulen text-[#0e4d80]">Select Model</h3>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {avatars.map(avatar => (
                        <button
                            key={avatar.id}
                            onClick={() => setCurrentAvatar(avatar)}
                            className={cn(
                                "shrink-0 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all font-istok border",
                                currentAvatar?.id === avatar.id
                                    ? "bg-[#0e4d80] text-white border-[#0e4d80] shadow-lg shadow-blue-900/20"
                                    : "bg-white text-gray-400 border-gray-100 hover:border-blue-200 hover:text-[#0e4d80]"
                            )}
                        >
                            {avatar.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Category Tabs */}
            <div className="flex border-b border-gray-100 p-2 gap-2">
                <button
                    onClick={() => setSelectedCategory("shirts")}
                    className={cn(
                        "flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-all rounded-2xl font-istok border border-transparent",
                        selectedCategory === "shirts"
                            ? "bg-[#0e4d80] text-white shadow-md shadow-blue-900/10"
                            : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                    )}
                >
                    Shirts
                </button>
                <button
                    onClick={() => setSelectedCategory("pants")}
                    className={cn(
                        "flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-all rounded-2xl font-istok border border-transparent",
                        selectedCategory === "pants"
                            ? "bg-[#0e4d80] text-white shadow-md shadow-blue-900/10"
                            : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                    )}
                >
                    Pants
                </button>
            </div>

            {/* Items Grid */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <div className="grid grid-cols-2 gap-4">
                    {items.map((item) => {
                        const isSelected =
                            (selectedCategory === "shirts" && selectedShirt === item.slug) ||
                            (selectedCategory === "pants" && selectedPant === item.slug);

                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    if (selectedCategory === "shirts") {
                                        setSelectedShirt(isSelected ? null : item.slug);
                                    } else {
                                        setSelectedPant(isSelected ? null : item.slug);
                                    }
                                }}
                                className={cn(
                                    "flex flex-col items-start p-3 rounded-3xl border text-left transition-all group relative overflow-hidden",
                                    isSelected
                                        ? "border-[#0e4d80] bg-blue-50/50 shadow-md ring-1 ring-[#0e4d80]"
                                        : "border-gray-100 bg-white hover:border-blue-200 hover:shadow-sm"
                                )}
                            >
                                <div className="w-full aspect-square bg-[#FDFDFB] rounded-2xl mb-3 flex items-center justify-center text-4xl border border-gray-50 group-hover:scale-105 transition-transform duration-500">
                                    {/* Placeholder icon/emoji logic - could be replaced with Image if available in future */}
                                    {selectedCategory === "shirts" ? "👕" : "👖"}
                                </div>
                                <span className={cn(
                                    "font-koulen text-lg leading-none uppercase tracking-wide truncate w-full mb-1",
                                    isSelected ? "text-[#0e4d80]" : "text-gray-700"
                                )}>
                                    {item.name}
                                </span>
                                <span className="text-[10px] text-gray-400 font-bold font-istok uppercase tracking-wider line-clamp-1">
                                    {item.description}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Reset Button */}
            <div className="p-6 border-t border-gray-100 bg-white/50 backdrop-blur-sm">
                <button
                    onClick={() => {
                        setSelectedShirt(null);
                        setSelectedPant(null);
                    }}
                    className="w-full py-4 px-6 bg-white border-2 border-gray-100 text-gray-400 rounded-full hover:bg-gray-50 hover:text-gray-600 font-koulen uppercase tracking-[0.2em] text-sm transition-all shadow-sm hover:shadow-md"
                >
                    Reset Outfit
                </button>
            </div>
        </div>
    );
}

function cn(...classes: (string | undefined | null | boolean)[]) {
    return classes.filter(Boolean).join(" ");
}
