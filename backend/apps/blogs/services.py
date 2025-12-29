import os
import uuid
import json
from django.conf import settings
from django.core.files.base import ContentFile
from google import genai
from google.genai import types
from PIL import Image
import io

# Note: This is an f-string template that will be formatted inside the method
PROMPT_TEMPLATE_BASE = """สร้างภาพถ่ายสตูดิโอแบบไฮเปอร์เรียลลิสติกของคนที่สวย หรือคนที่หล่อ 
ที่สะกดตาและดูดี คล้าย influencer ราวกับภาพในคู่มือโมเดลระดับไฮเอนด์ 
สวมชุดแนว street ที่ไม่เข้ากับตัวเอง แต่งตัวไม่เท่ หรือ ไม่เหมาะกับข้อมูลที่ป้อนให้ 
โดยสร้างภาพถ่ายที่มีลักษณะข้อมูลที่ป้อนให้ โดยเป็นภาพประเภทเต็มตัว 1 รูป แบบ 9:16
ไม่มีส่วนไหนของร่างกายที่หายไป:
{description}
"""

class NanoBananaService:
    @staticmethod
    def generate_from_data(data):
        """
        Generates an image based on the provided parameter dictionary.
        Returns the relative path to the saved temporary image.
        """
        # Cleanup old temp files before generating new one
        NanoBananaService._cleanup_old_temp_files()

        # Extract values with defaults
        gender = data.get("gender", "Female")
        skin = data.get("skinTone", "")
        neck = data.get("neckType", "")
        chest = data.get("chestSize", "")
        hip = data.get("hipSize", "")
        shoulder = data.get("shoulderSize", "")
        arm = data.get("armLength", "")
        face = data.get("faceShape", "")
        country = data.get("country", "")
        
        description = f"""
        Gender: {gender}
        Country/Origin: {country}
        Skin Tone: {skin}
        Neck: {neck}
        Chest/Bust: {chest}
        Hip: {hip}
        Shoulder: {shoulder}
        Arm Length: {arm}
        Face Shape: {face}
        ทรงผม : เน้นไปทางเรียบหรู old money แต่ปรับแต่งทรงผมให้เข้ากับลักษณะข้อมูลที่ป้อนให้
        เมกอัป : ปรับแต่งเมคอัพ เน้นการใช้อายไลน์เนอร์แบบหนาหรือบาง และ สีริมฝีปาก ปรับให้เข้ากับลักษณะข้อมูลที่ป้อนให้
        แสง: ไฟสตูดิโอนุ่ม ๆ พื้นหลังสีเทาอ่อน
        อารมณ์: มั่นใจ สง่างาม สุขุม โดยข้อมูลที่ป้อนให้
        สไตล์โดยรวม: กลิ่นอายแฟชั่นแมกกาซีน — สะอาด ละเมียดหรู ดูพรีเมียม
        """

        prompt = PROMPT_TEMPLATE_BASE.format(description=description)
        
        print(f"DEBUG: Starting image generation...")
        print(f"DEBUG: Prompt length: {len(prompt)}")
        
        # Call Gemini API using SDK
        api_key = settings.GEMINI_API_KEY
        if not api_key:
            api_key = os.environ.get("GEMINI_API_KEY")

        if api_key:
            print(f"DEBUG: Initializing GenAI Client...")
            try:
                client = genai.Client(api_key=api_key)
                
                print("DEBUG: Sending request to Gemini (SDK)...")
                response = client.models.generate_content(
                    model="gemini-3-pro-image-preview",
                    contents=[prompt],
                    config=types.GenerateContentConfig(
                        response_modalities=["IMAGE"]
                    )
                )

                print("DEBUG: Response received from SDK")
                
                # Check parts for image
                # SDK response structure handling based on user snippet
                # for part in response.parts: ...
                if response.parts:
                    for part in response.parts:
                        if part.inline_data:
                            print("DEBUG: Image data found in response")
                            # part.inline_data.data is bytes (or base64 string depending on version, 
                            # but usually bytes in this SDK).
                            try:
                                if hasattr(part.inline_data, 'data'):
                                    image_content = part.inline_data.data
                                    print(f"DEBUG: Retrieved {len(image_content)} bytes from inline_data")
                                    break
                                else:
                                    # Fallback if 'data' attr missing but 'as_image' exists
                                    print("DEBUG: inline_data has no data attribute, trying as_image fallback")
                                    pil_image = part.as_image()
                                    img_byte_arr = io.BytesIO()
                                    # Try saving without format if that was the issue, or default to PNG
                                    pil_image.save(img_byte_arr, format='PNG')
                                    image_content = img_byte_arr.getvalue()
                                    break
                            except Exception as img_err:
                                print(f"ERROR extracting image data: {img_err}")
                                break
                
                if not image_content:
                    raise ValueError("No image part found in SDK response")

            except Exception as e:
                print(f"ERROR calling Gemini SDK: {e}")
                print("DEBUG: Falling back to placeholder")
                return NanoBananaService._generate_placeholder(prompt)
        else:
            print("DEBUG: No GEMINI_API_KEY found, using local placeholder")
            return NanoBananaService._generate_placeholder(prompt)
            
        return NanoBananaService._save_temp_image(image_content)

    @staticmethod
    def _generate_placeholder(prompt):
        """Generates a placeholder image using a public service"""
        try:
             # RoboHash is fun
            url = f"https://robohash.org/{uuid.uuid4()}?set=set2&bgset=bg1"
            with urllib.request.urlopen(url) as response:
                return NanoBananaService._save_temp_image(response.read())
        except Exception as e:
             print(f"Placeholder generation failed: {e}")
             return None

    @staticmethod
    def _save_temp_image(content):
        """Saves binary content to media/temp/ and returns return path"""
        if not content:
            return None
            
        filename = f"banana_{uuid.uuid4().hex}.png"
        rel_path = f"temp/{filename}"
        full_path = os.path.join(settings.MEDIA_ROOT, "temp", filename)
        
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        
        with open(full_path, "wb") as f:
            f.write(content)
            
        # Return URL path
        return settings.MEDIA_URL + rel_path

    @staticmethod
    def _cleanup_old_temp_files():
        """Delete temp files older than 10 minutes"""
        import time
        
        temp_dir = os.path.join(settings.MEDIA_ROOT, "temp")
        if not os.path.exists(temp_dir):
            return

        # 10 minutes in seconds
        EXPIRY_TIME = 600
        now = time.time()

        try:
            for filename in os.listdir(temp_dir):
                file_path = os.path.join(temp_dir, filename)
                # Check if it's a file
                if os.path.isfile(file_path):
                    # Check age
                    if now - os.path.getmtime(file_path) > EXPIRY_TIME:
                        try:
                            os.remove(file_path)
                            print(f"Cleaned up old temp file: {filename}")
                        except OSError as e:
                            print(f"Error deleting {filename}: {e}")
        except Exception as e:
            print(f"Error during temp file cleanup: {e}")
