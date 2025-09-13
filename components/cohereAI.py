import cohere
import random

# Initialize Cohere
COHERE_API_KEY = "Hv0ertbmossgeHHFddZ5oBgzpeezSKEL4JBLJdaG"
co = cohere.Client(COHERE_API_KEY)

# Simulated "database": number of people at CMH every 5 minutes for today (288 intervals for 24 hours)
simulated_db = [random.randint(50, 200) for _ in range(288)]

# Convert the list to a string for AI input
data_string = ", ".join(str(x) for x in simulated_db)

# Improved prompt
prompt = f"""
Here is the historical data of people at CMH today in 5-minute intervals: [{data_string}].
Analyze the data and provide:
1. Is this location busier or less busy than the same time yesterday?
2. Predict if it will get busier or less busy in the next hour.
3. Recommend the best and worst times to go today based on these trends, and provide them in hours/minutes from now.
Format the output like this and exactly this way:
1. (Less/More) busy than yesterday.
2. Expected to get (more/less) busy in one hour.
3. Best time to go in X minutes/hours, Worst time to go in Y minutes/hours.
"""

# Call Cohere chat API
response = co.chat(
    model="command-nightly",  # valid chat model
    message=prompt,
    temperature=0.7,
    max_tokens=300
)

# Print AI's formatted prediction
print("AI Prediction:")
print(response.text)
