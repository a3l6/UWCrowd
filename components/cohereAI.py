from fluctuator import corrected_count, percent_full_raw
import cohere

# Initialize Cohere
COHERE_API_KEY = "Hv0ertbmossgeHHFddZ5oBgzpeezSKEL4JBLJdaG"
co = cohere.Client(COHERE_API_KEY)

# Loop through all buildings and pass only the necessary treated values
for building_name in corrected_count.keys():
    # Convert the fully treated values to strings for AI input
    corrected_count_str = str(corrected_count[building_name])
    percent_full_str = str(percent_full_raw[building_name])

    # Build prompt
    prompt = f"""
Here is the occupancy info for {building_name} today:
- Corrected count: [{corrected_count_str}]
- Percent full: [{percent_full_str}]

Analyze this data and provide:
1. Is this location busier or less busy than the same time yesterday?
2. Predict if it will get busier or less busy in the next hour.
3. Recommend the best and worst times to go today based on these trends, in hours/minutes from now.

Format exactly like this:
1. (Less/More) busy than yesterday.
2. Expected to get (more/less) busy in one hour.
3. Best time to go in X minutes/hours, Worst time to go in Y minutes/hours.
"""

    # Call Cohere chat API
    response = co.chat(
        model="command-nightly",
        message=prompt,
        temperature=0.7,
        max_tokens=300
    )

    print(f"AI Prediction for {building_name}:")
    print(response.text)
