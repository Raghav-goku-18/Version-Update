import requests
import json
import os

email = os.environ["CONFLUENCE_EMAIL"]
api_token = os.environ["CONFLUENCE_API_TOKEN"]
page_id = "196609"

with open("package.json", "r") as f:
    data = json.load(f)
angular_version = data["dependencies"]["@angular/core"]

auth = (email, api_token)
headers = {"Content-Type": "application/json"}
url = f"https://raghavlahoti55.atlassian.net/wiki/rest/api/content/{page_id}?expand=body.storage,version"

response = requests.get(url, auth=auth, headers=headers)
page = response.json()

new_content = f"<p><strong>Angular Version:</strong> {angular_version}</p>"
new_version = page["version"]["number"] + 1

update_data = {
    "id": page_id,
    "type": "page",
    "title": page["title"],
    "version": {"number": new_version},
    "body": {
        "storage": {
            "value": new_content,
            "representation": "storage"
        }
    }
}

update_url = f"https://raghavlahoti55.atlassian.net/wiki/rest/api/content/{page_id}"
update_response = requests.put(update_url, auth=auth, headers=headers, json=update_data)

if update_response.status_code == 200:
    print("✅ Confluence page updated.")
else:
    print("❌ Update failed:", update_response.text)
