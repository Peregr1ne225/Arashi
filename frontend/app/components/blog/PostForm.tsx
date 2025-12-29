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
        <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
                <div className="bg-red-900/10 border border-red-900/50 text-red-500 px-4 py-3 skew-box font-bold uppercase tracking-wider">
                    {error}
                </div>
            )}

            {/* Title */}
            <div>
                <label htmlFor="title" className="block text-xs font-black uppercase italic tracking-widest text-gray-400 mb-2">
                    Title
                </label>
                <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="ENTER YOUR POST TITLE..."
                    className="w-full px-5 py-4 bg-black border border-white/20 text-white placeholder-gray-600 outline-none focus:border-accent focus:ring-1 focus:ring-accent skew-box font-bold uppercase tracking-wider transition-all"
                    required
                />
            </div>

            {/* Content */}
            <div>
                <label htmlFor="content" className="block text-xs font-black uppercase italic tracking-widest text-gray-400 mb-2">
                    Content
                </label>
                <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="WRITE YOUR PLAYBOOK STRATEGY..."
                    rows={12}
                    className="w-full px-5 py-4 bg-black border border-white/20 text-white placeholder-gray-600 outline-none focus:border-accent focus:ring-1 focus:ring-accent skew-box font-medium leading-relaxed transition-all resize-none"
                    required
                />
            </div>

            <div>
                <label className="block text-xs font-black uppercase italic tracking-widest text-accent mb-4">
                    Cover Image Generator (AI Powered)
                </label>
                <div className="border border-white/10 p-6 md:p-8 bg-black/50 skew-box relative">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-accent/5 -skew-x-12 pointer-events-none" />

                    {isGenerating ? (
                        <div className="py-12 flex flex-col items-center justify-center text-accent">
                            <svg className="animate-spin w-10 h-10 mb-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span className="font-bold uppercase tracking-widest animate-pulse">Forging Visuals...</span>
                        </div>
                    ) : imagePreview ? (
                        <div className="relative">
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="max-h-64 mx-auto border border-white/20 skew-box-sm"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    setTempImagePath(null);
                                    setImagePreview(null);
                                }}
                                className="absolute top-2 right-2 bg-red-600 text-white rounded-none p-2 hover:bg-red-700 skew-box-sm transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    ) : (
                        <div className="py-4">
                            <div className="text-gray-600 mb-4">
                                <svg className="w-12 h-12 mx-auto opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <p className="text-gray-400 mb-8 font-bold uppercase tracking-wider text-center text-sm">Configure athlete attributes to generate a unique cover image</p>

                            {/* Generation Controls */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                {/* Select Inputs - Styled */}
                                {[
                                    { label: "Gender (เพศ)", value: gender, setter: setGender, options: GENDER_OPTIONS },
                                    { label: "Skin Tone (สีผิว)", value: skinTone, setter: setSkinTone, options: SKIN_OPTIONS },
                                    { label: "Neck Type (รูปแบบคอ)", value: neckType, setter: setNeckType, options: NECK_OPTIONS },
                                    { label: "Face Shape (รูปแบบหน้า)", value: faceShape, setter: setFaceShape, options: FACE_OPTIONS },
                                    { label: "Bust/Chest (รอบอก)", value: chestSize, setter: setChestSize, options: CHEST_OPTIONS },
                                    { label: "Waist/Hip (รอบสะโพก)", value: hipSize, setter: setHipSize, options: HIP_OPTIONS },
                                    { label: "Shoulder (ไหล่)", value: shoulderSize, setter: setShoulderSize, options: SHOULDER_OPTIONS },
                                    { label: "Arm Length (ความยาวแขน)", value: armLength, setter: setArmLength, options: ARM_OPTIONS }
                                ].map((field, idx) => (
                                    <div key={idx}>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">{field.label}</label>
                                        <div className="relative">
                                            <select
                                                value={field.value}
                                                onChange={(e) => field.setter(e.target.value)}
                                                className="w-full p-3 bg-neutral-900 border border-white/10 text-white rounded-none outline-none focus:border-accent appearance-none skew-box-sm text-sm"
                                            >
                                                {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Country (ประเทศ)</label>
                                    <div className="relative">
                                        <select
                                            value={country}
                                            onChange={(e) => setCountry(e.target.value)}
                                            className="w-full p-3 bg-neutral-900 border border-white/10 text-white rounded-none outline-none focus:border-accent appearance-none skew-box-sm text-sm"
                                        >
                                            <option value="">Select Country / เลือกประเทศ</option>
                                            {COUNTRY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleGenerateImage}
                                disabled={isGenerating}
                                className="w-full py-4 border border-accent text-accent hover:bg-accent hover:text-black transition-all skew-box font-black uppercase italic tracking-widest text-sm disabled:opacity-50"
                            >
                                Generate Visuals //
                            </button>
                        </div>
                    )}
                </div>
            </div>


            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-6 border-t border-white/10">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-8 py-3 bg-transparent border border-white/20 text-white hover:bg-white/5 transition-colors skew-box font-bold uppercase tracking-wider text-sm"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading || isGenerating}
                    className="btn-primary px-10 py-3 skew-box flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin w-5 h-5 text-black" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Publishing...
                        </>
                    ) : (
                        "Publish Strategy //"
                    )}
                </button>
            </div>
        </form >
    );
}
