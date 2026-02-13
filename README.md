# ContactOut API Integration

This repository includes a Python integration for the [ContactOut API](https://api.contactout.com/#introduction).

## What is covered

- Convenience methods for common operations:
  - `enrich_by_email(email)`
  - `enrich_by_linkedin_url(linkedin_url)`
  - `find_company(domain)`
- **Full API surface via generic methods**:
  - `request(method, path, params=None, payload=None)`
  - `get`, `post`, `put`, `patch`, `delete`

So yes—you can call all ContactOut endpoints with this client, even if a dedicated wrapper method is not yet present.

## Install

```bash
pip install pytest
```

## Quick start

```python
from contactout_api import ContactOutClient

client = ContactOutClient(
    api_key="YOUR_CONTACTOUT_API_KEY",
    user_agent="Mozilla/5.0",  # browser-like User-Agent
)

# Convenience wrapper
person = client.enrich_by_email("jane@example.com")
print(person)

# Generic endpoint call (works for all ContactOut endpoints)
response = client.request("GET", "/some/other/contactout/endpoint", params={"page": 1})
print(response)
```

## Notes

- Authentication uses `X-Auth-Token`.
- Requests include a browser-like `User-Agent` by default (`Mozilla/5.0`) and can be overridden.
- The client raises `ContactOutAPIError` for non-2xx responses and network errors.
- `base_url` and timeout are configurable through `ContactOutClient`.
