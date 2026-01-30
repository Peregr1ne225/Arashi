"use client";

import { useState } from "react";
import { X, Star, Loader2 } from "lucide-react";
import NextImage from "next/image";
import { reviewsApi } from "@/app/lib/api/client";
import { Product } from "@/app/types/product";
import { ReviewProduct } from "@/app/types/review";
import { getImageUrl } from "@/app/lib/utils/image";

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: ReviewProduct | Product;
    orderId: number;
    onSuccess?: () => void;
}

export default function ReviewModal({ isOpen, onClose, product, orderId, onSuccess }: ReviewModalProps) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await reviewsApi.createReview({
                product: product.id,
                order: orderId,
                rating,
                comment,
            });
            if (onSuccess) onSuccess();
            onClose();
            // Reset form
            setRating(5);
            setComment("");
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to submit review";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900">Rate Product</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="h-16 w-16 relative rounded-md overflow-hidden border border-gray-200 bg-gray-100 shrink-0">
                            {/* Use the product image if available */}
                            <NextImage
                                src={getImageUrl((product.images && product.images[0]) || "/placeholder-product.svg")}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="64px"
                            />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900 line-clamp-1">{product.name}</p>
                            <p className="text-sm text-gray-500">Order #{orderId}</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Rating
                        </label>
                        <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className="focus:outline-none transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`w-8 h-8 ${star <= rating
                                            ? "text-yellow-400 fill-current"
                                            : "text-gray-300"
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="comment"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Review (Optional)
                        </label>
                        <textarea
                            id="comment"
                            rows={4}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                            placeholder="How was the product?"
                        />
                    </div>

                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end space-x-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
                        >
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Submit Review
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
