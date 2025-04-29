import requests
import json
import os
import datetime
import subprocess
import re

# Setup
email = os.environ["CONFLUENCE_EMAIL"]
api_token = os.environ["CONFLUENCE_API_TOKEN"]
github_actor = os.environ.get("GITHUB_ACTOR", "unknown")
page_id = "196609"
confluence_base_url = "https://raghavlahoti55.atlassian.net/wiki"

# Extract project versions
with open("package.json", "r") as f:
    data = json.load(f)
dependencies = data.get("dependencies", {})
dev_dependencies = data.get("devDependencies", {})

angular_core_version = dependencies.get("@angular/core", "N/A")
angular_cli_version = dev_dependencies.get("@angular/cli", "N/A")
typescript_version = dev_dependencies.get("typescript", "N/A")

# Get latest versions from npm
def fetch_latest_version(pkg):
    res = requests.get(f"https://registry.npmjs.org/{pkg}")
    return res.json().get("dist-tags", {}).get("latest", "N/A") if res.ok else "N/A"

latest_angular_core = fetch_latest_version("@angular/core")
latest_angular_cli = fetch_latest_version("@angular/cli")
latest_typescript = fetch_latest_version("typescript")

# Metadata
timestamp = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
commit_sha = subprocess.getoutput("git rev-parse --short HEAD")

# Get current Confluence page content
auth = (email, api_token)
headers = {"Content-Type": "application/json"}
url = f"{confluence_base_url}/rest/api/content/{page_id}?expand=body.storage,version"
response = requests.get(url, auth=auth, headers=headers)
page = response.json()
current_content = page["body"]["storage"]["value"]

# Extract existing version history table (or create one)
table_header = """
<h2>📘 Version Update History</h2>
<table>
<tr>
  <th>⏰ Timestamp (UTC)</th>
  <th>👤 Author</th>
  <th>🔁 Commit SHA</th>
  <th>@angular/core</th>
  <th>@angular/cli</th>
  <th>TypeScript</th>
  <th>Latest @angular/core</th>
  <th>Latest @angular/cli</th>
  <th>Latest TypeScript</th>
</tr>
"""

new_row = f"""
<tr>
  <td>{timestamp}</td>
  <td>{github_actor}</td>
  <td>{commit_sha}</td>
  <td>{angular_core_version}</td>
  <td>{angular_cli_version}</td>
  <td>{typescript_version}</td>
  <td>{latest_angular_core}</td>
  <td>{latest_angular_cli}</td>
  <td>{latest_typescript}</td>
</tr>
"""

# Append to top of existing table (most recent first)
if "<table>" in current_content:
    updated_content = re.sub(
        r"(<table>.*?<tr>.*?</tr>)",
        r"\1" + new_row,
        current_content,
        count=1,
        flags=re.DOTALL
    )
else:
    updated_content = current_content + table_header + new_row + "</table>"

# Update page
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
    print("✅ Successfully updated Confluence page with version history row.")
else:
    print("❌ Update failed:", update_response.text)
