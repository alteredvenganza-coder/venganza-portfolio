"""
Fetch Instagram premade posts and generate data for the MAT Renders gallery.

Uses Instagram Graph API to:
1. Fetch media from the configured account
2. Filter posts containing #premade in their caption
3. Download images to mat-renders-landing/public/premades/
4. Generate src/data/premades.js with numbered entries
"""

import argparse
import json
import os
import sys
from pathlib import Path

import requests
from dotenv import load_dotenv

# Load .env from project root
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent
load_dotenv(dotenv_path=PROJECT_ROOT / ".env")


def get_env(key: str, required: bool = True) -> str:
    """Get an environment variable with validation."""
    value = os.getenv(key)
    if required and not value:
        print(f"[ERROR] Required environment variable not found: {key}")
        print(f"        Make sure it exists in your .env file at {PROJECT_ROOT / '.env'}")
        sys.exit(1)
    return value or ""


def fetch_media(access_token: str, user_id: str, limit: int = 100) -> list[dict]:
    """Fetch media from Instagram Graph API."""
    url = f"https://graph.instagram.com/{user_id}/media"
    params = {
        "fields": "id,caption,media_type,media_url,permalink,timestamp",
        "access_token": access_token,
        "limit": limit,
    }

    all_media = []
    while url:
        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()
        data = response.json()
        all_media.extend(data.get("data", []))

        # Pagination
        url = data.get("paging", {}).get("next")
        params = {}  # Next URL already has params

    return all_media


def filter_premades(media_list: list[dict], hashtag: str = "#premade") -> list[dict]:
    """Filter media that contains the premade hashtag in caption."""
    premades = []
    for item in media_list:
        caption = (item.get("caption") or "").lower()
        if hashtag.lower() in caption and item.get("media_type") in ("IMAGE", "CAROUSEL_ALBUM"):
            premades.append(item)
    return premades


def download_image(url: str, dest: Path) -> bool:
    """Download an image from URL to destination path."""
    try:
        response = requests.get(url, timeout=60, stream=True)
        response.raise_for_status()
        dest.parent.mkdir(parents=True, exist_ok=True)
        with open(dest, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        return True
    except requests.RequestException as e:
        print(f"  [WARN] Failed to download {url}: {e}")
        return False


def generate_js_data(premades: list[dict], output_path: Path, price: int = 200) -> None:
    """Generate the premades.js data file for the React app."""
    entries = []
    for item in premades:
        entries.append(
            f'  {{ id: {item["id"]}, number: "{item["number"]}", '
            f'imageUrl: "/premades/{item["number"]}.jpg", '
            f'instagramUrl: "{item["permalink"]}", '
            f"price: {price}, available: true }}"
        )

    js_content = f"""export const PREMADE_PRICE = {price};

export const premades = [
{",\\n".join(entries)}
];
"""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(js_content, encoding="utf-8")
    print(f"  [OK] Generated {output_path}")


def main():
    parser = argparse.ArgumentParser(description="Fetch Instagram premades for MAT Renders gallery")
    parser.add_argument("--hashtag", default="#premade", help="Hashtag to filter premade posts (default: #premade)")
    parser.add_argument("--limit", type=int, default=100, help="Max posts to fetch (default: 100)")
    parser.add_argument("--price", type=int, default=200, help="Price per premade in USD (default: 200)")
    parser.add_argument("--verbose", action="store_true", help="Enable verbose output")
    args = parser.parse_args()

    access_token = get_env("INSTAGRAM_ACCESS_TOKEN")
    user_id = get_env("INSTAGRAM_USER_ID")

    landing_dir = PROJECT_ROOT / "mat-renders-landing"
    images_dir = landing_dir / "public" / "premades"
    data_path = landing_dir / "src" / "data" / "premades.js"

    # Step 1: Fetch media
    print(f"[1/4] Fetching media from Instagram (limit: {args.limit})...")
    media = fetch_media(access_token, user_id, limit=args.limit)
    print(f"  Found {len(media)} total posts")

    # Step 2: Filter premades
    print(f'[2/4] Filtering posts with "{args.hashtag}"...')
    premades = filter_premades(media, hashtag=args.hashtag)
    print(f"  Found {len(premades)} premade posts")

    if not premades:
        print("[DONE] No premades found. Check your hashtag or Instagram content.")
        sys.exit(0)

    # Step 3: Download images and assign numbers
    print("[3/4] Downloading images...")
    numbered_premades = []
    for i, item in enumerate(premades, start=1):
        number = f"{i:03d}"
        item["number"] = number
        dest = images_dir / f"{number}.jpg"

        if dest.exists():
            if args.verbose:
                print(f"  [SKIP] {number}.jpg already exists")
        else:
            media_url = item.get("media_url", "")
            if media_url:
                success = download_image(media_url, dest)
                if success:
                    print(f"  [OK] Downloaded {number}.jpg")
                else:
                    continue
            else:
                print(f"  [WARN] No media_url for post {item['id']}, skipping")
                continue

        numbered_premades.append(item)

    # Step 4: Generate JS data file
    print("[4/4] Generating premades.js...")
    generate_js_data(numbered_premades, data_path, price=args.price)

    print(f"\n[DONE] {len(numbered_premades)} premades processed successfully!")
    print(f"  Images: {images_dir}")
    print(f"  Data:   {data_path}")


if __name__ == "__main__":
    main()
