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
        <div className="flex flex-col h-full bg-white border-l border-neutral-200">
            {/* Avatar Selector Section */}
            <div className="p-6 border-b border-neutral-200">
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">Model</h3>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {avatars.map(avatar => (
                        <button
                            key={avatar.id}
                            onClick={() => setCurrentAvatar(avatar)}
                            className={cn(
                                "shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all border",
                                currentAvatar?.id === avatar.id
                                    ? "bg-neutral-900 text-white border-neutral-900 shadow-sm"
                                    : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
                            )}
                        >
                            {avatar.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Category Tabs */}
            <div className="flex border-b border-neutral-200">
                <button
                    onClick={() => setSelectedCategory("shirts")}
                    className={cn(
                        "flex-1 py-4 text-sm font-medium transition-colors",
                        selectedCategory === "shirts"
                            ? "text-black border-b-2 border-black"
                            : "text-neutral-500 hover:text-black"
                    )}
                >
                    Shirts
                </button>
                <button
                    onClick={() => setSelectedCategory("pants")}
                    className={cn(
                        "flex-1 py-4 text-sm font-medium transition-colors",
                        selectedCategory === "pants"
                            ? "text-black border-b-2 border-black"
                            : "text-neutral-500 hover:text-black"
                    )}
                >
                    Pants
                </button>
            </div>

            {/* Items Grid */}
            <div className="flex-1 overflow-y-auto p-6">
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
                                    "flex flex-col items-start p-4 rounded-lg border text-left transition-all",
                                    isSelected
                                        ? "border-black bg-neutral-50 ring-1 ring-black"
                                        : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
                                )}
                            >
                                <div className="w-full aspect-square bg-neutral-200 rounded-md mb-3 flex items-center justify-center text-2xl">
                                    {/* Placeholder icon/emoji logic */}
                                    {selectedCategory === "shirts" ? "👕" : "👖"}
                                </div>
                                <span className="font-medium text-sm">{item.name}</span>
                                <span className="text-xs text-neutral-500 mt-1">{item.description}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Reset Button */}
            <div className="p-6 border-t border-neutral-200">
                <button
                    onClick={() => {
                        setSelectedShirt(null);
                        setSelectedPant(null);
                    }}
                    className="w-full py-3 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 rounded-lg font-medium transition-colors"
                >
                    Reset Avatar
                </button>
            </div>
        </div>
    );
}

function cn(...classes: (string | undefined | null | boolean)[]) {
    return classes.filter(Boolean).join(" ");
}
