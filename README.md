# ContactOut API Integration

This repository includes a Python integration for the [ContactOut API](https://api.contactout.com/#authentication), including the [LinkedIn Profile API](https://api.contactout.com/#linkedin-profile-api).

## Authentication

- Default auth header: `X-Auth-Token: <YOUR_API_KEY>`
- Browser-like User-Agent is sent by default (`Mozilla/5.0`)
- Optional environment-based construction:

```python
from contactout_api import ContactOutClient

client = ContactOutClient.from_env()  # reads CONTACTOUT_API_KEY
```

## What is covered

- Convenience methods for common operations:
  - `enrich_by_email(email)`
  - `enrich_by_linkedin_url(linkedin_url)`
  - `linkedin_profile_lookup(linkedin_url)`  # LinkedIn Profile API
  - `find_company(domain)`
- Full API surface via generic methods:
  - `request(method, path, params=None, payload=None)`
  - `get`, `post`, `put`, `patch`, `delete`

## Quick start

```python
from contactout_api import ContactOutClient

client = ContactOutClient(api_key="YOUR_CONTACTOUT_API_KEY")

# LinkedIn Profile API
linkedin_profile = client.linkedin_profile_lookup("https://linkedin.com/in/jane")
print(linkedin_profile)

# Any other endpoint
response = client.request("GET", "/some/other/contactout/endpoint", params={"page": 1})
print(response)
```

## Notes

- The client raises `ContactOutAPIError` for non-2xx responses and network errors.
- `base_url`, auth header name, and timeout are configurable through `ContactOutClient`.
