from PIL import Image
import os

def crop_and_copy():
    # File paths
    source_img_path = r"C:\Users\gnane\.gemini\antigravity\brain\7c46d4a8-c177-44cc-8744-e276e1798ebe\media__1784096174659.jpg"
    side_img_path = r"C:\Users\gnane\.gemini\antigravity\brain\7c46d4a8-c177-44cc-8744-e276e1798ebe\media__1784096185137.jpg"
    
    upload_dir = r"c:\PROJECTS\Gnaneswar_bb\backend\uploads"
    os.makedirs(upload_dir, exist_ok=True)
    
    # 1. Open the stacked image and split it in half vertically (horizontal split)
    img = Image.open(source_img_path)
    w, h = img.size
    mid_y = h // 2
    
    # Crop before (top)
    before_img = img.crop((0, 0, w, mid_y))
    before_img.save(os.path.join(upload_dir, "before_self.jpg"), "JPEG")
    print("Saved before_self.jpg")
    
    # Crop after (bottom)
    after_img = img.crop((0, mid_y, w, h))
    after_img.save(os.path.join(upload_dir, "after_self.jpg"), "JPEG")
    print("Saved after_self.jpg")
    
    # 2. Copy the side flex image to uploads
    side_img = Image.open(side_img_path)
    side_img.save(os.path.join(upload_dir, "after_side_self.jpg"), "JPEG")
    print("Saved after_side_self.jpg")

if __name__ == "__main__":
    crop_and_copy()
