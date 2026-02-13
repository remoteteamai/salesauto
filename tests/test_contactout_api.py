import io
import json
from urllib.error import HTTPError
from unittest.mock import patch

import pytest

from contactout_api import ContactOutAPIError, ContactOutClient


class FakeResponse:
    def __init__(self, payload):
        self._payload = payload

    def read(self):
        return json.dumps(self._payload).encode("utf-8")

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False


@patch("contactout_api.urlopen")
def test_enrich_by_email_success(mock_urlopen):
    mock_urlopen.return_value = FakeResponse({"person": {"email": "jane@example.com"}})

    client = ContactOutClient(api_key="secret")
    data = client.enrich_by_email("jane@example.com")

    assert data["person"]["email"] == "jane@example.com"


@patch("contactout_api.urlopen")
def test_linkedin_profile_lookup_uses_linkedin_profile_api_endpoint(mock_urlopen):
    mock_urlopen.return_value = FakeResponse({"linkedin": {"url": "https://linkedin.com/in/jane"}})

    client = ContactOutClient(api_key="secret")
    data = client.linkedin_profile_lookup("https://linkedin.com/in/jane")

    assert data["linkedin"]["url"] == "https://linkedin.com/in/jane"
    req = mock_urlopen.call_args[0][0]
    assert req.method == "POST"
    assert req.full_url.endswith("/linkedin/profile")


@patch("contactout_api.urlopen")
def test_request_sets_auth_and_user_agent_headers(mock_urlopen):
    mock_urlopen.return_value = FakeResponse({"ok": True})

    client = ContactOutClient(api_key="secret", user_agent="Mozilla/5.0")
    data = client.request("GET", "custom/endpoint", params={"q": "abc"})

    assert data == {"ok": True}
    req = mock_urlopen.call_args[0][0]
    assert req.method == "GET"
    assert req.full_url.endswith("/custom/endpoint?q=abc")
    assert req.get_header("User-agent") == "Mozilla/5.0"
    assert req.get_header("X-auth-token") == "secret"


def test_from_env_builds_client(monkeypatch):
    monkeypatch.setenv("CONTACTOUT_API_KEY", "env-secret")

    client = ContactOutClient.from_env()

    assert client.api_key == "env-secret"


def test_from_env_requires_key(monkeypatch):
    monkeypatch.delenv("CONTACTOUT_API_KEY", raising=False)

    with pytest.raises(ValueError):
        ContactOutClient.from_env()


@patch("contactout_api.urlopen")
def test_raises_on_api_error(mock_urlopen):
    http_error = HTTPError(
        url="https://api.contactout.com/v1/companies/search",
        code=401,
        msg="Unauthorized",
        hdrs=None,
        fp=io.BytesIO(b"unauthorized"),
    )
    mock_urlopen.side_effect = http_error

    client = ContactOutClient(api_key="bad-key")

    with pytest.raises(ContactOutAPIError) as err:
        client.find_company("example.com")

    assert "401" in str(err.value)
