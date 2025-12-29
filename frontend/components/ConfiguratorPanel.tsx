"use client";

import { Dispatch, SetStateAction } from "react";


interface ConfiguratorPanelProps {
    selectedCategory: "shirts" | "pants";
    setSelectedCategory: Dispatch<SetStateAction<"shirts" | "pants">>;
    selectedShirt: string | null;
    setSelectedShirt: Dispatch<SetStateAction<string | null>>;
    selectedPant: string | null;
    setSelectedPant: Dispatch<SetStateAction<string | null>>;

}



const ITEMS = {
    shirts: [
        { id: "shirt1", name: "Yellow Duck Shirt", description: "A classic yellow duck mesh." },
        // { id: "shirt2", name: "Blue Shirt", description: "Coming soon..." },
    ],
    pants: [
        { id: "pant1", name: "Boxy Pants", description: "Simple box geometry pant." },
        // { id: "pant2", name: "Jeans", description: "Coming soon..." },
    ]
};

export default function ConfiguratorPanel({
    selectedCategory,
    setSelectedCategory,
    selectedShirt,
    setSelectedShirt,
    selectedPant,
    setSelectedPant
}: ConfiguratorPanelProps) {

    const items = ITEMS[selectedCategory];

    return (
        <div className="flex flex-col h-full bg-white border-l border-neutral-200">
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
                            (selectedCategory === "shirts" && selectedShirt === item.id) ||
                            (selectedCategory === "pants" && selectedPant === item.id);

                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    if (selectedCategory === "shirts") {
                                        setSelectedShirt(isSelected ? null : item.id);
                                    } else {
                                        setSelectedPant(isSelected ? null : item.id);
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
                <div className="mt-4 text-xs text-neutral-400 text-center">
                    Backend: localhost:8000/static/models/avatar1
                </div>
            </div>
        </div>
    );
}

// Simple className merger helper if not imported
function cn(...classes: (string | undefined | null | boolean)[]) {
    return classes.filter(Boolean).join(" ");
}
