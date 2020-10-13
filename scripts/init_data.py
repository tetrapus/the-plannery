import requests
import json
import time

url = "https://www.hellofresh.com.au/gw/api/recipes"

params = {"country": "au", "locale": "en-AU", "take": "250"}

payload = ""
headers = {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MDQ5OTkzMzMsImp0aSI6IjdkZjhiZTI5LTQ4MjEtNDkwYy1iMWY2LTFlNTc4Y2YxMDI2ZiIsImlhdCI6MTYwMjM2OTU5MCwiaXNzIjoic2VuZiJ9.9G38FG9iKVYm6Jt4OapneGkAMNZlan2rsMufH7t4Kb4",
}

recipes = []

responseCount = None
while responseCount is None or responseCount == 250:
    response = requests.request(
        "GET",
        url,
        data=payload,
        headers=headers,
        params={**params, "skip": len(recipes)},
    )
    responseData = response.json()
    responseCount = len(responseData["items"])
    recipes += responseData["items"]
    print("\n".join(i["name"] for i in responseData["items"]))
    time.sleep(10)

with open("recipes.json", "w") as output:
    json.dump(recipes, output)
