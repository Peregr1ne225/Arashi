"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { blogsApi } from "@/app/lib/api/blogs";

import { revalidateBlogs } from "@/app/actions/blog";

interface PostFormProps {
    onSuccess?: (slug: string) => void;
}

export default function PostForm({ onSuccess }: PostFormProps) {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [tempImagePath, setTempImagePath] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Image Generation State
    const [gender, setGender] = useState("Female");
    const [skinTone, setSkinTone] = useState("2) ผิวขาว (White)");
    const [neckType, setNeckType] = useState("คอมาตรฐาน/คอทั่วไป (Average/Normal Neck)");
    const [chestSize, setChestSize] = useState("M : 36 - 38, 38 - 40");
    const [hipSize, setHipSize] = useState("M : 38 - 39");
    const [shoulderSize, setShoulderSize] = useState("M : 16.0 - 17.0");
    const [armLength, setArmLength] = useState("Regular Fit (มาตรฐาน) : 34.0 นิ้ว");
    const [faceShape, setFaceShape] = useState("ทรงรี/ไข่ (Oval)");
    const [country, setCountry] = useState("ไทย");

    // Options
    const GENDER_OPTIONS = ["Male", "Female"];
    const COUNTRY_OPTIONS = [
        "ไทย", "จีน", "ญี่ปุ่น", "อินเดีย", "อินโดนีเซีย", "เกาหลีใต้", "เกาหลีเหนือ", "ฟิลิปปินส์", "สิงคโปร์", "มาเลเซีย", "เวียดนาม",
        "พม่า", "ภูฏาน", "บังกลาเทศ", "ศรีลังกา", "ปากีสถาน", "เนปาล", "อัฟกานิสถาน", "อิหร่าน", "อิรัก", "อิสราเอล", "จอร์แดน", "ซาอุดีอาระเบีย",
        "สหรัฐอาหรับเอมิเรตส์", "โอมาน", "กาตาร์", "คูเวต", "เลบานอน", "ซีเรีย", "ไซปรัส", "อาร์เมเนีย", "อาเซอร์ไบจาน", "จอร์เจีย", "คาซัคสถาน",
        "คีร์กีซสถาน", "อุซเบกิสถาน", "เติร์กเมนิสถาน", "ทาจิกิสถาน", "บรูไน", "ติมอร์-เลสเต", "มัลดีฟส์", "มองโกเลีย", "ฝรั่งเศส", "เยอรมนี",
        "สหราชอาณาจักร", "รัสเซีย", "อิตาลี", "สเปน", "โปรตุเกส", "เนเธอร์แลนด์", "เบลเยียม", "สวิตเซอร์แลนด์", "ออสเตรีย", "โปแลนด์", "กรีซ",
        "ฮังการี", "สาธารณรัฐเช็ก", "เดนมาร์ก", "ฟินแลนด์", "สวีเดน", "นอร์เวย์", "ไอซ์แลนด์", "ไอร์แลนด์", "แอลเบเนีย", "บอสเนีย", "บัลแกเรีย",
        "โครเอเชีย", "เอสโตเนีย", "ลัตเวีย", "ลิทัวเนีย", "ลักเซมเบิร์ก", "มาซิโดเนีย", "มอลตา", "มอลโดวา", "โมนาโก", "โรมาเนีย", "ซานมารีโน",
        "สโลวัก", "สโลวีเนีย", "ยูเครน", "นครรัฐวาติกัน", "สหรัฐอเมริกา", "แคนาดา", "เม็กซิโก", "กรีนแลนด์", "คิวบา", "ปานามา",
        "คอสตาริกา", "นิการากัว", "ฮอนดูรัส", "เอลซัลวาดอร์", "กัวเตมาลา", "เบลิซ", "สาธารณรัฐโดมินิกัน", "เฮติ", "จาเมกา", "บาฮามาส",
        "ตรินิแดดและโตเบโก", "บาร์เบโดส", "บราซิล", "อาร์เจนตินา", "โคลอมเบีย", "เปรู", "ชิลี", "เวเนซุเอลา", "เอกวาดอร์", "โบลิเวีย", "ปารากวัย",
        "อุรุกวัย", "กายอานา", "ซูรินาม", "เฟรนช์เกียนา", "อียิปต์", "ไนจีเรีย", "แอฟริกาใต้", "เอธิโอเปีย", "คองโก", "ซูดาน", "แอลจีเรีย",
        "โมร็อกโก", "เคนยา", "กานา", "โกตดิวัวร์", "ตูนิเซีย", "เซเนกัล", "อังโกลา", "มาดากัสการ์", "กาบอง", "แคเมรูน", "ยูกันดา", "ออสเตรเลีย",
        "นิวซีแลนด์", "ปาปัวนิวกินี", "ฟิจิ", "หมู่เกาะโซโลมอน", "วานูอาตู"
    ];

    const SKIN_OPTIONS = [
        "1) ผิวขาวมาก (Pale White)",
        "2) ผิวขาว (White)",
        "3) ผิวขาวปานกลางถึงน้ำตาลอ่อน (Medium White to Olive)",
        "4) ผิวสีน้ำตาลปานกลาง (Moderate Brown)",
        "5) ผิวสีน้ำตาลเข้ม (Dark Brown)",
        "6) ผิวเข้มมาก (Very Dark)"
    ];
    const NECK_OPTIONS = [
        "คอสั้น (Short Neck)",
        "คอมาตรฐาน/คอทั่วไป (Average/Normal Neck)",
        "คอยาว (Long Neck)"
    ];
    const CHEST_OPTIONS = [
        "XS : 30 - 32, 32 - 34",
        "S : 33 - 35, 35 - 37",
        "M : 36 - 38, 38 - 40",
        "L : 39 - 41, 41 - 43",
        "XL : 42 - 44, 44 - 46",
        "XXL : 45+, 47+"
    ];
    const HIP_OPTIONS = [
        "XS : 34 - 35",
        "S : 36 - 37",
        "M : 38 - 39",
        "L : 40 - 42",
        "XL : 43 - 45",
        "XXL : 46+"
    ];
    const SHOULDER_OPTIONS = [
        "XS : 14.0 - 15.0",
        "S : 15.0 - 16.0",
        "M : 16.0 - 17.0",
        "L : 17.0 - 18.0",
        "XL : 18.0 - 19.0",
        "XXL : 19.0+"
    ];
    const ARM_OPTIONS = [
        "Regular Fit (มาตรฐาน) : 34.0 นิ้ว",
        "Tall Fit : 35.5 - 36.0 นิ้ว",
        "Short/Petite Fit : 32.5 - 33.0 นิ้ว"
    ];
    const FACE_OPTIONS = [
        "ทรงกลม (Round)",
        "ทรงสี่เหลี่ยม (Square)",
        "ทรงสามเหลี่ยมคว่ำ (Inverted Triangle / Heart)",
        "ทรงสามเหลี่ยม (Triangle / Pear)",
        "ทรงรี/ไข่ (Oval)",
        "ทรงเพชร (Diamond)",
        "ทรงยาว/สี่เหลี่ยมผืนผ้า (Oblong / Rectangle)"
    ];

    const handleGenerateImage = async () => {
        setIsGenerating(true);
        setError(null);
        setImagePreview(null);
        setTempImagePath(null);

        try {
            const result = await blogsApi.generateImage({
                gender,
                country,
                skinTone,
                neckType,
                chestSize,
                hipSize,
                shoulderSize,
                armLength,
                faceShape,
                title: title.trim(),
                content: content.trim()
            });
            console.log("Generated Image Result:", result);
            setImagePreview(result.image_url);
            setTempImagePath(result.temp_path);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to generate image");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim() || !content.trim()) {
            setError("Title and content are required");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const post = await blogsApi.createPost({
                title: title.trim(),
                content: content.trim(),
                temp_image_path: tempImagePath || undefined,
            });

            await revalidateBlogs();

            if (onSuccess) {
                // Return ID or Slug depending on what parent expects, but usually ID is better now 
                // However, interface says (slug: string) -> void. Let's update interface too?
                // Actually onSuccess is optional and used maybe by modals? 
                // Let's check usage. But for now, fixing router.push is key.
                onSuccess(String(post.id));
            } else {
                router.push(`/blogs/${post.id}`);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create post");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {/* Title */}
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                </label>
                <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter your post title..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    required
                />
            </div>

            {/* Content */}
            <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                    Content
                </label>
                <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your blog post content..."
                    rows={12}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Image (AI Generated)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                    {isGenerating ? (
                        <div className="py-8 flex flex-col items-center justify-center text-purple-600">
                            <svg className="animate-spin w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span>Generating unique image from your content...</span>
                        </div>
                    ) : imagePreview ? (
                        <div className="relative">
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="max-h-48 mx-auto rounded-lg"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    setTempImagePath(null);
                                    setImagePreview(null);
                                }}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    ) : (
                        <div className="py-4">
                            <div className="text-gray-400 mb-2">
                                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <p className="text-gray-600 mb-4 font-medium">Configure attributes to generate a unique cover image</p>

                            {/* Generation Controls */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-left p-4 bg-gray-50 rounded-lg border">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Gender (เพศ)</label>
                                    <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full p-2 border rounded">
                                        {GENDER_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Skin Tone (สีผิว)</label>
                                    <select value={skinTone} onChange={(e) => setSkinTone(e.target.value)} className="w-full p-2 border rounded">
                                        {SKIN_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Neck Type (รูปแบบคอ)</label>
                                    <select value={neckType} onChange={(e) => setNeckType(e.target.value)} className="w-full p-2 border rounded">
                                        {NECK_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Face Shape (รูปแบบหน้า)</label>
                                    <select value={faceShape} onChange={(e) => setFaceShape(e.target.value)} className="w-full p-2 border rounded">
                                        {FACE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Bust/Chest (รอบอก)</label>
                                    <select value={chestSize} onChange={(e) => setChestSize(e.target.value)} className="w-full p-2 border rounded">
                                        {CHEST_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Waist/Hip (รอบสะโพก)</label>
                                    <select value={hipSize} onChange={(e) => setHipSize(e.target.value)} className="w-full p-2 border rounded">
                                        {HIP_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Shoulder (ไหล่)</label>
                                    <select value={shoulderSize} onChange={(e) => setShoulderSize(e.target.value)} className="w-full p-2 border rounded">
                                        {SHOULDER_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Arm Length (ความยาวแขน)</label>
                                    <select value={armLength} onChange={(e) => setArmLength(e.target.value)} className="w-full p-2 border rounded">
                                        {ARM_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Country (ประเทศ)</label>
                                    <select value={country} onChange={(e) => setCountry(e.target.value)} className="w-full p-2 border rounded">
                                        <option value="">Select Country / เลือกประเทศ</option>
                                        {COUNTRY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleGenerateImage}
                                disabled={isGenerating}
                                className="px-6 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                            >
                                Generate with AI
                            </button>
                        </div>
                    )}
                </div>
            </div>


            {/* Submit Button */}
            <div className="flex justify-end gap-4">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading || isGenerating}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Publishing...
                        </>
                    ) : (
                        "Publish Post"
                    )}
                </button>
            </div>
        </form >
    );
}
