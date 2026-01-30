
import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface SortIconProps {
    columnKey: string;
    sortConfig: { key: string; direction: 'asc' | 'desc' } | null;
}

export const SortIcon = ({ columnKey, sortConfig }: SortIconProps) => {
    if (sortConfig?.key !== columnKey) return <ArrowUpDown size={12} className="opacity-30" />;
    return sortConfig.direction === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />;
};
