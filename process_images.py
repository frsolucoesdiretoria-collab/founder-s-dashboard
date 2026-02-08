import os
import glob
from PIL import Image, ImageEnhance, ImageDraw, ImageFilter, ImageOps

ARTIFACT_DIR = "/Users/fabricio/.gemini/antigravity/brain/bb42abd7-1c9e-439c-8fc0-7ce2d90b8362"
OUTPUT_DIR = "outputs"

CONFIG = {
    "hero_doctor_raw": {
        "target_name": "hero-doctor",
        "size": (2400, 1800),
        "brightness": 0.9,
        "contrast": 1.2,
        "color": 0.75,
        "sharpness": 1.0,
        "tint": (0.95, 1.0, 1.05) # Slight cyan tint
    },
    "radar_hud_raw": {
        "target_name": "radar-hud",
        "size": (1120, 800),
        "brightness": 1.0,
        "contrast": 1.15,
        "color": 1.2,
        "sharpness": 1.5,
        "tint": (1.0, 1.05, 1.05) # Green/Cyan boost
    },
    "target_hud_raw": {
        "target_name": "target-hud",
        "size": (1120, 800),
        "brightness": 1.0,
        "contrast": 1.15,
        "color": 1.25, # Red boost
        "sharpness": 1.5,
         "tint": (1.05, 1.0, 1.05)
    },
    "execute_hud_raw": {
        "target_name": "execute-hud",
        "size": (1120, 800),
        "brightness": 1.0,
        "contrast": 1.15,
        "color": 1.2,
        "sharpness": 1.5,
        "tint": (1.0, 1.05, 1.05)
    },
    "avatar_dr_roberto_raw": {
        "target_name": "avatar-dr-roberto",
        "size": (512, 512),
        "avatar_mode": True,
        "sharpness": 1.2
    },
    "avatar_dra_juliana_raw": {
        "target_name": "avatar-dra-juliana",
        "size": (512, 512),
        "avatar_mode": True,
        "sharpness": 1.2
    },
    "waiting_room_raw": {
        "target_name": "waiting-room",
        "size": (2800, 1200),
        "brightness": 0.9,
        "contrast": 1.1,
        "color": 0.7, # Desaturated
        "tint": (0.9, 0.95, 1.05) # Cool blue
    },
    "corridor_light_raw": {
        "target_name": "corridor-light",
        "size": (2800, 1200),
        "brightness": 0.95,
        "contrast": 1.2,
        "color": 1.1, # Warmer
    },
    "clock_motion_raw": {
        "target_name": "clock-motion",
        "size": (1200, 1200),
        "contrast": 1.1,
        "sharpness": 1.2
    },
    "data_dissolving_raw": {
        "target_name": "data-dissolving",
        "size": (2800, 1000),
        "contrast": 1.2,
        "color": 1.2,
        "tint": (1.1, 0.9, 1.1)
    }
}

def process_avatar(img, size):
    # Resize to slightly larger than target to allow for crop
    img = img.resize(size, Image.Resampling.LANCZOS)
    
    # Create circular mask
    mask = Image.new('L', size, 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0) + size, fill=255)
    
    # Create avatar with transparency
    output = Image.new('RGBA', size, (0, 0, 0, 0))
    output.paste(img, (0, 0), mask=mask)
    
    # Draw Green Border
    draw_output = ImageDraw.Draw(output)
    draw_output.ellipse((1, 1, size[0]-2, size[1]-2), outline="#00FF88", width=4) # 2px border inside (approx 4px stroke centered)
    
    # Shadow (tricky to do properly without expanding canvas, but instructions say 512x512 output)
    # If we need shadow, we need a larger canvas or the shadow will be cut off.
    # Instruction: "Export as... (512x512px exact)". "Add drop shadow 0 8px 24px".
    # This implies the VISIBLE circle is smaller than 512x512 to fit the shadow?
    # Or the output is larger? "512x512px exact" usually means the final file dimension.
    # To fit a shadow, I'll shrink the circle slightly.
    
    final_size = size
    circle_radius = int(size[0] * 0.9) # 90% size to fit shadow
    bg_size = size
    
    # Re-do with shadow logic
    # 1. Shadow layer
    shadow_layer = Image.new('RGBA', bg_size, (0,0,0,0))
    shadow_draw = ImageDraw.Draw(shadow_layer)
    offset_y = 8
    shadow_bbox = (
        (bg_size[0] - circle_radius)//2, 
        (bg_size[1] - circle_radius)//2 + offset_y,
        (bg_size[0] + circle_radius)//2,
        (bg_size[1] + circle_radius)//2 + offset_y
    )
    shadow_draw.ellipse(shadow_bbox, fill=(0,0,0,128))
    shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(12)) # 24px spread approx
    
    # 2. Main Circle
    avatar_layer = Image.new('RGBA', bg_size, (0,0,0,0))
    avatar_mask = Image.new('L', bg_size, 0)
    avatar_draw_mask = ImageDraw.Draw(avatar_mask)
    avatar_bbox = (
        (bg_size[0] - circle_radius)//2, 
        (bg_size[1] - circle_radius)//2,
        (bg_size[0] + circle_radius)//2,
        (bg_size[1] + circle_radius)//2
    )
    avatar_draw_mask.ellipse(avatar_bbox, fill=255)
    
    img_resized = img.resize(bg_size, Image.Resampling.LANCZOS) # Ensure source covers canvas
    avatar_layer.paste(img_resized, (0,0), mask=avatar_mask)
    
    # 3. Border
    draw_avatar = ImageDraw.Draw(avatar_layer)
    draw_avatar.ellipse(avatar_bbox, outline="#00FF88", width=4)
    
    # Composite
    final = Image.alpha_composite(shadow_layer, avatar_layer)
    return final

def apply_tint(img, tint_rgb):
    if img.mode != 'RGB':
        img = img.convert('RGB')
    
    r, g, b = img.split()
    r = r.point(lambda i: i * tint_rgb[0])
    g = g.point(lambda i: i * tint_rgb[1])
    b = b.point(lambda i: i * tint_rgb[2])
    return Image.merge('RGB', (r, g, b))

def main():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        
    files = glob.glob(os.path.join(ARTIFACT_DIR, "*.png"))
    print(f"Found {len(files)} files in artifacts.")
    
    for fpath in files:
        basename = os.path.basename(fpath)
        # Match config
        matched_key = None
        for key in CONFIG:
            if key in basename:
                matched_key = key
                break
        
        if not matched_key:
            print(f"Skipping {basename} (no config match)")
            continue
            
        settings = CONFIG[matched_key]
        print(f"Processing {matched_key} -> {settings['target_name']}")
        
        try:
            img = Image.open(fpath)
            
            # Avatar Mode
            if settings.get("avatar_mode"):
                img = process_avatar(img, settings['size'])
            else:
                # Resize/Crop
                # Use ImageOps.fit to crop to aspect ratio then resize
                img = ImageOps.fit(img, settings['size'], method=Image.Resampling.LANCZOS)
                
                # Enhancements
                if "brightness" in settings:
                    img = ImageEnhance.Brightness(img).enhance(settings['brightness'])
                if "contrast" in settings:
                    img = ImageEnhance.Contrast(img).enhance(settings['contrast'])
                if "color" in settings:
                    img = ImageEnhance.Color(img).enhance(settings['color'])
                if "sharpness" in settings:
                    img = ImageEnhance.Sharpness(img).enhance(settings['sharpness'])
                if "tint" in settings:
                    img = apply_tint(img, settings['tint'])
            
            # Save
            target_base = os.path.join(OUTPUT_DIR, settings['target_name'])
            
            # WebP
            img.save(f"{target_base}.webp", "WEBP", quality=85)
            # PNG
            img.save(f"{target_base}.png", "PNG")
            
            print(f"Saved {settings['target_name']}")
            
        except Exception as e:
            print(f"Error processing {basename}: {e}")

if __name__ == "__main__":
    main()
