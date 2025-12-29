export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  category: string;
  subcategory: string;
  colors: string[];
  sizes: string[];
  images: string[];
  isNew?: boolean;
  isBestseller?: boolean;
  rating: number;
  reviewCount: number;
  tags: string[];
}

export const mockProducts: Product[] = [
  {
    id: 127784989,
    name: "INAWLY เสื้อแขนยาวลายทาง ประดับด้วยเพชรพลอย เหมาะสำหรับฤดูใบไม้ผลิและฤดูใบไม้ร่วง",
    description: "รูปดอกไม้ประดับหมุด, รูปทรงนามธรรมประดับหมุด",
    price: 279.0,
    category: "Women",
    subcategory: "Tops",
    colors: ["White", "Black"],
    sizes: ["XS", "S", "M", "L", "XL"],
    images: [
      "https://img.ltwebstatic.com/v4/j/pi/2025/09/16/71/17579873664c86b1498eced30153949b659ac80049_thumbnail_600x.webp",
    ],
    isNew: true,
    rating: 4.5,
    reviewCount: 128,
    tags: ["summer", "floral", "casual"],
  },
  {
    id: 114067324,
    name: "Aloruh ผู้หญิงชุดมินิเดรสคอวีหลังโล่ง ผูกคอ ดีไซน์ระบาย ตีนตุงสีพื้น",
    description: "ดีไซน์จับจีบช่วงคอและเอว'",
    price: 241.0,
    category: "Women",
    subcategory: "Dresses",
    colors: ["White", " Black"],
    sizes: ["XS", "S", "M", "L", "XL"],
    images: [
      "https://img.ltwebstatic.com/v4/j/pi/2025/07/03/c0/1751515429d98661d7e908ed285f73d2f0fa1baff7_thumbnail_600x.webp",
    ],
    isBestseller: true,
    rating: 4.7,
    reviewCount: 324,
    tags: ["ทันสมัย", "สบายๆ", "มั่นใจ"],
  },
  // {
  //   id: 3,
  //   name: "Striped Cotton T-Shirt",
  //   description: "Comfortable cotton t-shirt with striped pattern. Features crew neckline and short sleeves.",
  //   price: 12.99,
  //   category: "Women",
  //   subcategory: "Tops",
  //   colors: ["Blue/White", "Black/White", "Pink/White"],
  //   sizes: ["XS", "S", "M", "L", "XL"],
  //   images: [
  //     "/images/product3-1.jpg",
  //     "/images/product3-2.jpg",
  //     "/images/product3-3.jpg"
  //   ],
  //   rating: 4.3,
  //   reviewCount: 89,
  //   tags: ["casual", "cotton", "striped"]
  // },
  // {
  //   id: 4,
  //   name: "High-Waist Skinny Jeans",
  //   description: "High-rise skinny jeans with stretch denim for comfortable fit. Features five-pocket styling and button closure.",
  //   price: 29.99,
  //   originalPrice: 44.99,
  //   discount: 33,
  //   category: "Women",
  //   subcategory: "Jeans",
  //   colors: ["Blue", "Black", "White"],
  //   sizes: ["XS", "S", "M", "L", "XL"],
  //   images: [
  //     "/images/product4-1.jpg",
  //     "/images/product4-2.jpg",
  //     "/images/product4-3.jpg"
  //   ],
  //   isBestseller: true,
  //   rating: 4.6,
  //   reviewCount: 217,
  //   tags: ["denim", "high-waist", "skinny"]
  // },
  // {
  //   id: 5,
  //   name: "Floral Embroidered Tank Top",
  //   description: "Lightweight tank top with delicate floral embroidery on the front. Features adjustable shoulder straps and relaxed fit.",
  //   price: 15.99,
  //   category: "Women",
  //   subcategory: "Tops",
  //   colors: ["White", "Beige", "Light Blue"],
  //   sizes: ["XS", "S", "M", "L", "XL"],
  //   images: [
  //     "/images/product5-1.jpg",
  //     "/images/product5-2.jpg",
  //     "/images/product5-3.jpg"
  //   ],
  //   isNew: true,
  //   rating: 4.4,
  //   reviewCount: 64,
  //   tags: ["floral", "embroidery", "summer"]
  // },
  // {
  //   id: 6,
  //   name: "Pleated Midi Skirt",
  //   description: "Elegant pleated midi skirt with elastic waistband. Perfect for both casual and formal occasions.",
  //   price: 27.99,
  //   originalPrice: 39.99,
  //   discount: 30,
  //   category: "Women",
  //   subcategory: "Skirts",
  //   colors: ["Black", "Navy", "Burgundy"],
  //   sizes: ["XS", "S", "M", "L", "XL"],
  //   images: [
  //     "/images/product6-1.jpg",
  //     "/images/product6-2.jpg",
  //     "/images/product6-3.jpg"
  //   ],
  //   rating: 4.5,
  //   reviewCount: 143,
  //   tags: ["pleated", "midi", "elegant"]
  // },
  // {
  //   id: 7,
  //   name: "Oversized Graphic Hoodie",
  //   description: "Comfortable oversized hoodie with graphic print on the front. Features kangaroo pocket and adjustable drawstring hood.",
  //   price: 32.99,
  //   category: "Women",
  //   subcategory: "Hoodies",
  //   colors: ["Gray", "Black", "Pink"],
  //   sizes: ["XS", "S", "M", "L", "XL"],
  //   images: [
  //     "/images/product7-1.jpg",
  //     "/images/product7-2.jpg",
  //     "/images/product7-3.jpg"
  //   ],
  //   rating: 4.8,
  //   reviewCount: 256,
  //   tags: ["oversized", "graphic", "hoodie"]
  // },
  // {
  //   id: 8,
  //   name: "Lace Trim Bralette",
  //   description: "Delicate lace trim bralette with adjustable shoulder straps. Wire-free design for all-day comfort.",
  //   price: 14.99,
  //   category: "Women",
  //   subcategory: "Lingerie",
  //   colors: ["White", "Black", "Nude", "Pink"],
  //   sizes: ["XS", "S", "M", "L", "XL"],
  //   images: [
  //     "/images/product8-1.jpg",
  //     "/images/product8-2.jpg",
  //     "/images/product8-3.jpg"
  //   ],
  //   isNew: true,
  //   rating: 4.2,
  //   reviewCount: 78,
  //   tags: ["lace", "bralette", "lingerie"]
  // }
];

export const categories = [
  {
    id: 1,
    name: "Women",
    subcategories: [
      { name: "Dresses", count: 342 },
      { name: "Tops", count: 527 },
      { name: "Bottoms", count: 418 },
      { name: "Jackets", count: 193 },
      { name: "Jeans", count: 287 },
      { name: "Skirts", count: 156 },
      { name: "Hoodies", count: 124 },
      { name: "Lingerie", count: 267 },
    ],
  },
  {
    id: 2,
    name: "Men",
    subcategories: [
      { name: "T-Shirts", count: 428 },
      { name: "Shirts", count: 235 },
      { name: "Pants", count: 312 },
      { name: "Jackets", count: 167 },
      { name: "Jeans", count: 198 },
      { name: "Shorts", count: 143 },
      { name: "Hoodies", count: 156 },
      { name: "Underwear", count: 189 },
    ],
  },
  {
    id: 3,
    name: "Kids",
    subcategories: [
      { name: "Girls (2-10)", count: 256 },
      { name: "Boys (2-10)", count: 248 },
      { name: "Baby Girls (0-24M)", count: 134 },
      { name: "Baby Boys (0-24M)", count: 128 },
      { name: "Toddler Girls (2-5T)", count: 167 },
      { name: "Toddler Boys (2-5T)", count: 154 },
    ],
  },
  {
    id: 4,
    name: "Home",
    subcategories: [
      { name: "Bedding", count: 187 },
      { name: "Bath", count: 143 },
      { name: "Kitchen", count: 256 },
      { name: "Decor", count: 298 },
      { name: "Furniture", count: 134 },
      { name: "Storage", count: 167 },
    ],
  },
];

export const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
export const colors = [
  { name: "White", hex: "#FFFFFF" },
  { name: "Black", hex: "#000000" },
  { name: "Red", hex: "#FF0000" },
  { name: "Blue", hex: "#0000FF" },
  { name: "Green", hex: "#00FF00" },
  { name: "Yellow", hex: "#FFFF00" },
  { name: "Pink", hex: "#FFC0CB" },
  { name: "Purple", hex: "#800080" },
  { name: "Orange", hex: "#FFA500" },
  { name: "Brown", hex: "#A52A2A" },
  { name: "Gray", hex: "#808080" },
  { name: "Navy", hex: "#000080" },
  { name: "Beige", hex: "#F5F5DC" },
  { name: "Burgundy", hex: "#800020" },
  { name: "Teal", hex: "#008080" },
];
