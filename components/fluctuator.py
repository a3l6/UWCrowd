# ui_fluctuator.py
import time
import random
import json
from threading import Thread
from fluctuator import corrected_count, percent_full_raw  


# Example: simulated_db from your detection system
raw_count = {
    "CMH": 150,
    "PAC": 120,
    "DC": 85,
    "E7": 40,
    "Dana_Porter": 200
}

adjustmentFac = {
    "CMH": 0.0769,
    "PAC": 1,
    "DC": 0.08,
    "E7": 1,
    "Dana_Porter": 1
}

building_capacity = {
    "CMH": 600,
    "PAC": 200,
    "DC": 1500,
    "E7": 1550,
    "Dana_Porter": 400
}

# Compute corrected count dynamically from current raw_count and adjustment factors
#These are the numbers we should send though the ai
corrected_count = {}
for building, raw in raw_count.items():
    fac = adjustmentFac.get(building, 1)  
    corrected_count[building] = raw / fac

# Here is a non-fluctuated % full (corrected_count vs. building capacity)
percent_full_raw = {}
for building, corrected in corrected_count.items():
    cap = building_capacity.get(building, 1)  # avoid div/0
    percent_full_raw[building] = round((corrected / cap) * 100, 1)

# Fluctuated numbers for the UI (start from corrected count)
ui_display = {
    b: {
        "people": int(round(v)), 
        "percent_full": round((int(round(v)) / building_capacity.get(b, 1)) * 100, 1)
    }
    for b, v in corrected_count.items()
}


def fluctuate(building_name, min_interval=10, max_interval=30, noise_pct=0.05):
    """
    Continuously fluctuate the number of people for UI display and print immediately.
    Base the fluctuation on corrected_count (raw_count / adjustmentFac).
    """
    global corrected_count, ui_display, building_capacity

    while True:
        base_people = corrected_count[building_name]             # float
        base_people_int = max(0, int(round(base_people)))       # integer base for noise
        noise = max(1, int(round(abs(base_people) * noise_pct)))  # ensure ≥1 noise

        noisy_people = max(0, base_people_int + random.randint(-noise, noise))

        capacity = building_capacity.get(building_name, None)
        if capacity and capacity > 0:
            percent_full = round(noisy_people / capacity * 100, 1)
        else:
            percent_full = 0.0

        ui_display[building_name]["people"] = noisy_people
        ui_display[building_name]["percent_full"] = percent_full

        # ✅ write fluctuated state to JSON so Next.js can consume it
        with open("ui_fluctuator.json", "w") as f:
            json.dump(ui_display, f, indent=2)

        # Print immediately for this building
        print(f"[{building_name}] People: {noisy_people}, % Full: {percent_full}%")

        time.sleep(random.uniform(min_interval, max_interval))


# Start a thread for each building, each with independent timing
threads = []
for building in corrected_count.keys():
    min_delay = random.randint(10, 20)
    max_delay = random.randint(25, 40)
    t = Thread(target=fluctuate, args=(building, min_delay, max_delay))
    t.daemon = True
    t.start()
    threads.append(t)


# Keep the main thread alive
if __name__ == "__main__":
    while True:
        time.sleep(30)
