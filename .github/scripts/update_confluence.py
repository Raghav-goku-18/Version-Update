import requests
import json
import os
import re

# Configuration
email = os.environ["CONFLUENCE_EMAIL"]
api_token = os.environ["CONFLUENCE_API_TOKEN"]
page_id = "196609"
confluence_base_url = "https://raghavlahoti55.atlassian.net/wiki"

# Step 1: Extract versions from package.json
with open("package.json", "r") as f:
    data = json.load(f)
dependencies = data.get("dependencies", {})
dev_dependencies = data.get("devDependencies", {})

angular_core_version = dependencies.get("@angular/core", "N/A")
angular_cli_version = dev_dependencies.get("@angular/cli", "N/A")
typescript_version = dev_dependencies.get("typescript", "N/A")

# Step 2: Fetch latest versions from npm
def fetch_latest_version(package_name):
    url = f"https://registry.npmjs.org/{package_name}"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        return data.get("dist-tags", {}).get("latest", "N/A")
    return "N/A"

latest_angular_core = fetch_latest_version("@angular/core")
latest_angular_cli = fetch_latest_version("@angular/cli")
latest_typescript = fetch_latest_version("typescript")

# Step 3: Get current Confluence page content
auth = (email, api_token)
headers = {"Content-Type": "application/json"}
url = f"{confluence_base_url}/rest/api/content/{page_id}?expand=body.storage,version"

response = requests.get(url, auth=auth, headers=headers)
if response.status_code != 200:
    print(f"Failed to fetch Confluence page: {response.status_code}")
    exit(1)
page = response.json()
current_content = page["body"]["storage"]["value"]

# Step 4: Prepare the table to append
table_html = f"""
<h2>Version Comparison</h2>
<table>
  <tr>
    <th>Package</th>
    <th>Project Version</th>
    <th>Latest Stable Version</th>
  </tr>
  <tr>
    <td>@angular/core</td>
    <td>{angular_core_version}</td>
    <td>{latest_angular_core}</td>
  </tr>
  <tr>
    <td>@angular/cli</td>
    <td>{angular_cli_version}</td>
    <td>{latest_angular_cli}</td>
  </tr>
  <tr>
    <td>TypeScript</td>
    <td>{typescript_version}</td>
    <td>{latest_typescript}</td>
  </tr>
</table>
"""

# Step 5: Append the table to the existing content
updated_content = current_content + table_html

# Step 6: Update the Confluence page
new_version = page["version"]["number"] + 1
update_data = {
    "id": page_id,
    "type": "page",
    "title": page["title"],
    "version": {"number": new_version},
    "body": {
        "storage": {
            "value": updated_content,
            "representation": "storage"
        }
    }
}

update_url = f"{confluence_base_url}/rest/api/content/{page_id}"
update_response = requests.put(update_url, auth=auth, headers=headers, json=update_data)

if update_response.status_code == 200:
    print("✅ Confluence page updated successfully.")
else:
    print(f"❌ Failed to update Confluence page: {update_response.status_code}")
    print(update_response.text)
