"""ContactOut API client.

This client includes convenience helpers for common operations and a generic
`request()` method that can call any ContactOut endpoint.
Docs: https://api.contactout.com/#linkedin-profile-api
"""

from __future__ import annotations

import json
import os
from dataclasses import dataclass
from typing import Any, Dict, Optional
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen


class ContactOutAPIError(Exception):
    """Raised when the ContactOut API returns a non-success response."""


@dataclass
class ContactOutClient:
    """Wrapper around ContactOut's REST API."""

    api_key: str
    base_url: str = "https://api.contactout.com/v1"
    timeout_seconds: int = 30
    user_agent: str = "Mozilla/5.0"
    auth_header_name: str = "X-Auth-Token"

    @classmethod
    def from_env(cls) -> "ContactOutClient":
        """Build a client from the CONTACTOUT_API_KEY environment variable."""

        api_key = os.getenv("CONTACTOUT_API_KEY", "").strip()
        if not api_key:
            raise ValueError("CONTACTOUT_API_KEY is required")
        return cls(api_key=api_key)

    def _request(
        self,
        method: str,
        path: str,
        *,
        params: Optional[Dict[str, Any]] = None,
        payload: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        normalized_path = path if path.startswith("/") else f"/{path}"
        url = f"{self.base_url}{normalized_path}"
        if params:
            url = f"{url}?{urlencode(params)}"

        body = json.dumps(payload).encode("utf-8") if payload is not None else None

        request = Request(
            url=url,
            data=body,
            method=method.upper(),
            headers={
                self.auth_header_name: self.api_key,
                "Accept": "application/json",
                "Content-Type": "application/json",
                "User-Agent": self.user_agent,
            },
        )

        try:
            with urlopen(request, timeout=self.timeout_seconds) as response:
                raw = response.read().decode("utf-8").strip()
                return json.loads(raw) if raw else {}
        except HTTPError as err:
            details = err.read().decode("utf-8", errors="replace")
            raise ContactOutAPIError(
                f"ContactOut API request failed ({err.code}): {details}"
            ) from err
        except URLError as err:
            raise ContactOutAPIError(f"Could not reach ContactOut API: {err}") from err

    def request(
        self,
        method: str,
        path: str,
        *,
        params: Optional[Dict[str, Any]] = None,
        payload: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Call any ContactOut endpoint."""

        return self._request(method=method, path=path, params=params, payload=payload)

    def get(self, path: str, *, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        return self._request("GET", path, params=params)

    def post(self, path: str, *, payload: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        return self._request("POST", path, payload=payload)

    def put(self, path: str, *, payload: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        return self._request("PUT", path, payload=payload)

    def patch(self, path: str, *, payload: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        return self._request("PATCH", path, payload=payload)

    def delete(
        self,
        path: str,
        *,
        params: Optional[Dict[str, Any]] = None,
        payload: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        return self._request("DELETE", path, params=params, payload=payload)

    def enrich_by_email(self, email: str) -> Dict[str, Any]:
        """Enrich a person/company profile by email."""

        return self.post("/people/search", payload={"email": email})

    def enrich_by_linkedin_url(self, linkedin_url: str) -> Dict[str, Any]:
        """Enrich a person/company profile by LinkedIn profile URL."""

        return self.post("/people/search", payload={"linkedin_url": linkedin_url})

    def linkedin_profile_lookup(self, linkedin_url: str) -> Dict[str, Any]:
        """Call ContactOut LinkedIn Profile API.

        Docs reference: https://api.contactout.com/#linkedin-profile-api
        """

        return self.post("/linkedin/profile", payload={"linkedin_url": linkedin_url})

    def find_company(self, domain: str) -> Dict[str, Any]:
        """Fetch company information by domain name."""

        return self.get("/companies/search", params={"domain": domain})
