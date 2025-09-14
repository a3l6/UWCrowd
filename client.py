import asyncio
from bleak import BleakScanner, BleakClient
import requests
import time

NAME = "E7"
FULL_NAME = "Engineering 7"
URL = "https://uwcrowd.com/api/information"
MAX_CAPACITY = 1550
COORDINATES = [43.4695, -80.5359]


async def main():
    while True:
        devices = await BleakScanner.discover(timeout=10)

        mac_addresses = set([x.address for x in devices])

        body = {
            "data": [{
                "id": NAME.lower(),
                "name": FULL_NAME,
                "shortName": NAME,
                "currentOccupancy": len(mac_addresses),
                "maxCapacity": MAX_CAPACITY,
                "coordinates": COORDINATES,
            }]
        }

        requests.post(URL, json=body)

        time.sleep(10)


asyncio.run(main())