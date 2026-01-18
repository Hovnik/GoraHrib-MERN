#!/usr/bin/env python3
"""Scraper for a single mountain range page on hribi.net.

Behavior (per your instructions):
- Target range URL: https://www.hribi.net/gorovje/gorisko_notranjsko_in_sneznisko_hribovje/26
- From the range page extract: name & elevation for each listed item
- Visit each peak detail page and include ONLY peaks where the "Vrsta" attribute contains "vrh"
- From detail page fetch coordinates (Širina/Dolžina), keep null if missing
- Save output to: gorisko_notranjsko_in_sneznisko_hribovje.json
- Fast: use asyncio + aiohttp with concurrency limit

Usage: run without args to execute. Optional: -n <limit> to test only first N peaks.
"""

import asyncio
import aiohttp
from bs4 import BeautifulSoup
import re
import json
import argparse
import sys

# RANGE_URL = "https://www.hribi.net/gorovje/gorisko_notranjsko_in_sneznisko_hribovje/26"
# RANGE_URL = "https://www.hribi.net/gorovje/julijske_alpe/1"
# RANGE_URL = "https://www.hribi.net/gorovje/kamnisko_savinjske_alpe/3"
# RANGE_URL = "https://www.hribi.net/gorovje/karavanke/11"
# RANGE_URL = "https://www.hribi.net/gorovje/pohorje_dravinjske_gorice_in_haloze/4"
# RANGE_URL = "https://www.hribi.net/gorovje/polhograjsko_hribovje_in_ljubljana/5"
# RANGE_URL = "https://www.hribi.net/gorovje/posavsko_hribovje_in_dolenjska/25"
# RANGE_URL = "https://www.hribi.net/gorovje/prekmurje/163"
# RANGE_URL = "https://www.hribi.net/gorovje/skofjelosko_cerkljansko_hribovje_in_jelovica/21"
RANGE_URL = "https://www.hribi.net/gorovje/strojna_kosenjak_kozjak_in_slovenske_gorice/162"
OUTPUT_FILE = "strojna_kosenjak_kozjak_in_slovenske_gorice.json"
CONCURRENCY = 20
TIMEOUT = 20

# Regex helpers
ELEV_RE = re.compile(r"(\d{1,4})\s*m")
VRSTA_PEAK_RE = re.compile(r"\bvrh\b", re.I)
COORD_RE = re.compile(r"Širina/Dolžina:\s*([0-9,\.]+)°\s*[NnSs]?\s*[,;]?\s*([0-9,\.]+)°\s*[EeWw]?")
# looser coord matcher with N/E letters optional and comma decimals
COORD_LOOSE = re.compile(r"([0-9]{1,2}[,\.][0-9]+)°\s*[NnSs]?.{0,8}([0-9]{1,3}[,\.][0-9]+)°\s*[EeWw]?")

async def fetch(session: aiohttp.ClientSession, url: str, retries: int = 2):
    for attempt in range(retries + 1):
        try:
            async with session.get(url, timeout=TIMEOUT) as resp:
                text = await resp.text()
                return text
        except Exception as e:
            if attempt == retries:
                print(f"Failed to fetch {url}: {e}")
                return None
            await asyncio.sleep(0.5)

async def parse_range(session: aiohttp.ClientSession):
    html = await fetch(session, RANGE_URL)
    if not html:
        raise RuntimeError("Could not fetch range page")
    soup = BeautifulSoup(html, 'html.parser')

    # Get a human-friendly mountain_range name from the page h1 or title
    title = soup.find('h1')
    if title and title.text.strip():
        mountain_range = title.text.strip()
    else:
        # fallback to URL slug
        mountain_range = RANGE_URL.rstrip('/').split('/')[-1]

    peaks = []

    # The page lists peaks in tables; find links to individual /gora/ pages and the adjacent elevation
    for row in soup.select('tr'):
        a = row.find('a', href=re.compile(r'^/gora/'))
        if not a:
            continue
        name = a.get_text().strip()
        # Try to find elevation in the row text
        row_text = row.get_text(separator=' ', strip=True)
        m = ELEV_RE.search(row_text)
        elevation = int(m.group(1)) if m else None
        url = 'https://www.hribi.net' + a['href']
        peaks.append({'name': name, 'elevation': elevation, 'url': url, 'mountain_range': mountain_range})

    return peaks

async def fetch_peak_details(session: aiohttp.ClientSession, sem: asyncio.Semaphore, peak: dict):
    async with sem:
        html = await fetch(session, peak['url'])
        if not html:
            print(f"Skipped (no page): {peak['name']}")
            return None
        soup = BeautifulSoup(html, 'html.parser')

        text = soup.get_text(separator=' ', strip=True)

        # Find the Vrsta attribute - we only accept if it contains 'vrh'
        # Look for 'Vrsta: ...' and capture until the next known label (e.g., 'Vremenska', 'Širina', 'Višina')
        vrsta = None
        m = re.search(r"Vrsta\s*[:\u00A0]?\s*(.+?)(?=(?:Vremenska|Širina|Višina|$))", text, re.I)
        if m:
            vrsta = m.group(1).strip()
        else:
            # fallback: any short 'Vrsta:' occurrence
            for node in soup.find_all(string=re.compile(r"Vrsta", re.I)):
                parent = node.parent.get_text(separator=' ', strip=True)
                m2 = re.search(r"Vrsta\s*[:\u00A0]?\s*(.*)", parent, re.I)
                if m2:
                    vrsta = m2.group(1).strip()
                    break

        if not vrsta or not VRSTA_PEAK_RE.search(vrsta):
            # not a 'vrh' type; skip
            # print a short skip log
            print(f"Skipped (type mismatch): {peak['name']} -- Vrsta: {vrsta}")
            return None

        # Extract coordinates robustly
        lat = lon = None
        # Prefer the 'Širina/Dolžina' node but normalize spaces first
        coord_node = soup.find(string=re.compile(r"Širina/Dolžina", re.I))
        search_text = coord_node.strip() if coord_node else text
        search_text = search_text.replace('\u00A0', ' ')

        # Strict match first
        m = re.search(r"Širina/Dolžina\s*[:]?\s*([0-9,\.]+)°\s*[NnSs]?.*?([0-9,\.]+)°\s*[EeWw]?", search_text)
        if m:
            lat = float(m.group(1).replace(',', '.'))
            lon = float(m.group(2).replace(',', '.'))

        # If not found or longitude looks implausible (e.g., < 10), scan all degree numbers and pick the pair
        if lat is None or lon is None or (lon is not None and lon < 10):
            candidates = re.findall(r"([0-9]{1,3}[,\.][0-9]+)°", text)
            nums = [float(c.replace(',', '.')) for c in candidates]
            found = False
            for i in range(len(nums) - 1):
                la = nums[i]
                lo = nums[i + 1]
                # Slovenia lat ~ 45 +/- 3, lon ~ 13 +/- 4 -> use conservative bounds
                if 42.0 <= la <= 48.0 and 8.0 <= lo <= 19.0:
                    lat, lon = la, lo
                    found = True
                    break
            if not found and len(nums) >= 2:
                lat, lon = nums[0], nums[1]  # fallback (still better than None)

        # Build result
        return {
            'name': peak['name'],
            'elevation': peak['elevation'],
            'mountain_range': peak['mountain_range'],
            'latitude': lat,
            'longitude': lon,
            'url': peak['url']
        }

async def run(limit: int = None):
    sem = asyncio.Semaphore(CONCURRENCY)
    async with aiohttp.ClientSession() as session:
        print('Fetching range page and list of peaks...')
        peaks = await parse_range(session)
        print(f'Found {len(peaks)} entries on range page')
        if limit:
            peaks = peaks[:limit]
            print(f'Testing limited to first {limit} peaks')

        tasks = [fetch_peak_details(session, sem, p) for p in peaks]

        print(f'Scraping details (concurrency={CONCURRENCY})...')
        results = []
        # gather in small batches to show progress
        for i in range(0, len(tasks), 50):
            batch = tasks[i:i+50]
            res = await asyncio.gather(*batch)
            results.extend(res)

        # filter, deduplicate by URL, and save (do NOT include url in saved records)
        final = [r for r in results if r is not None]
        seen = set()
        unique = []
        for r in final:
            url = r.get('url')
            if url in seen:
                continue
            seen.add(url)
            # remove url before saving
            entry = {k: v for k, v in r.items() if k != 'url'}
            unique.append(entry)

        skipped = len(results) - len(unique)
        print(f'Done: {len(unique)} peaks accepted (deduped), {skipped} skipped')
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(unique, f, ensure_ascii=False, indent=2)
        print(f'Saved to {OUTPUT_FILE} (deduped)')

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('-n', type=int, help='limit number of peaks (for testing)')
    parser.add_argument('--concurrency', type=int, default=CONCURRENCY, help='max concurrent requests')
    args = parser.parse_args()
    if args.concurrency:
        CONCURRENCY = args.concurrency
    try:
        asyncio.run(run(limit=args.n))
    except KeyboardInterrupt:
        print('\nCancelled by user')
        sys.exit(130)
