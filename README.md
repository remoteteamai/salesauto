# ContactOut API Integration

This repository includes a Python integration for the [ContactOut API](https://api.contactout.com/#authentication).

## Authentication

- Default auth header: `X-Auth-Token: <YOUR_API_KEY>`
- Browser-like User-Agent is sent by default (`Mozilla/5.0`)
- Optional environment-based construction:

```python
from contactout_api import ContactOutClient

client = ContactOutClient.from_env()  # reads CONTACTOUT_API_KEY
```

If ContactOut changes auth header requirements, you can override it:

```python
client = ContactOutClient(
    api_key="YOUR_CONTACTOUT_API_KEY",
    auth_header_name="X-Auth-Token",  # configurable
)
```

## What is covered

- Convenience methods for common operations:
  - `enrich_by_email(email)`
  - `enrich_by_linkedin_url(linkedin_url)`
  - `find_company(domain)`
- Full API surface via generic methods:
  - `request(method, path, params=None, payload=None)`
  - `get`, `post`, `put`, `patch`, `delete`

## Quick start

```python
from contactout_api import ContactOutClient

client = ContactOutClient(
    api_key="YOUR_CONTACTOUT_API_KEY",
    user_agent="Mozilla/5.0",
)

person = client.enrich_by_email("jane@example.com")
print(person)

response = client.request("GET", "/some/other/contactout/endpoint", params={"page": 1})
print(response)
```

## Notes

- The client raises `ContactOutAPIError` for non-2xx responses and network errors.
- `base_url` and timeout are configurable through `ContactOutClient`.
