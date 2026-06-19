"""ContactOut multi-endpoint API helper.

Supports quick CLI calls for:
- People Search API
- People Count API
- Decision Makers API
- Company Search API
- Email to LinkedIn API
- Contact Checker API
- Email Verifier API
- API Usage Stats
- Errors guide output

Examples:
  CONTACTOUT_API_KEY=... python contactout_check.py people-search --company-name OpenAI
  CONTACTOUT_API_KEY=... python contactout_check.py email-verifier --email hello@example.com
  CONTACTOUT_API_KEY=... python contactout_check.py usage-stats
"""

from __future__ import annotations

import argparse
import contextlib
import json
import os
import socket
import urllib.error
import urllib.parse
import urllib.request
from typing import Any

BASE_URL = "https://api.contactout.com"

DEFAULT_PATHS = {
    "people-search": "/v1/people/search",
    "people-count": "/v1/people/count",
    "decision-makers": "/v1/decision_makers/search",
    "company-search": "/v1/company/search",
    "email-to-linkedin": "/v1/email/linkedin",
    "contact-checker": "/v1/contact/checker",
    "email-verifier": "/v1/email/verifier",
    "usage-stats": "/v1/usage/stats",
}

ERROR_GUIDE = {
    400: "Bad Request: invalid/missing fields in payload.",
    401: "Unauthorized: invalid API key or missing auth header.",
    403: "Forbidden: key does not have permission for this endpoint.",
    404: "Not Found: endpoint path may differ by API version/account plan.",
    422: "Unprocessable Entity: payload format accepted, but values invalid.",
    429: "Rate Limited: slow down or retry later.",
    500: "Server Error: ContactOut temporary issue; retry later.",
    503: "Service Unavailable: endpoint temporarily unavailable.",
}


@contextlib.contextmanager
def _temporary_proxy_env_cleared() -> None:
    proxy_keys = [key for key in os.environ if key.upper().endswith("_PROXY")]
    backup = {key: os.environ.get(key) for key in proxy_keys}
    for key in proxy_keys:
        os.environ.pop(key, None)
    try:
        yield
    finally:
        for key, value in backup.items():
            if value is not None:
                os.environ[key] = value


def _print_payload(payload: bytes) -> None:
    try:
        print(json.dumps(json.loads(payload), indent=2))
    except Exception:
        print(payload.decode("utf-8", errors="replace"))


def _print_error_guide(status: int) -> None:
    message = ERROR_GUIDE.get(status)
    if message:
        print(f"Error guide: {message}")


def _run_request(opener: urllib.request.OpenerDirector, request: urllib.request.Request, timeout: int) -> bool:
    try:
        with opener.open(request, timeout=timeout) as response:
            payload = response.read()
            print(f"HTTP {response.status} {response.reason}")
            _print_payload(payload)
            return True
    except urllib.error.HTTPError as exc:
        print(f"HTTP error: {exc.code} {exc.reason}")
        body = exc.read()
        if body:
            _print_payload(body)
        _print_error_guide(exc.code)
        if exc.code == 404:
            print("Tip: use --endpoint-path to override if your account uses a different route.")
        return True
    except urllib.error.URLError as exc:
        print(f"URL error: {exc.reason}")
        return False


def _print_network_diagnostics() -> None:
    proxy_related = {k: v for k, v in os.environ.items() if k.upper().endswith("_PROXY")}
    if proxy_related:
        print("Detected proxy environment variables:")
        for key in sorted(proxy_related):
            print(f"  {key}={proxy_related[key]}")
    else:
        print("No proxy environment variables detected.")

    print("Tip: if your environment enforces an HTTP proxy, add api.contactout.com to NO_PROXY.")
    print("  Example: export NO_PROXY=api.contactout.com,$NO_PROXY")

    print("Network diagnostics:")
    try:
        infos = socket.getaddrinfo("api.contactout.com", 443, proto=socket.IPPROTO_TCP)
        print(f"  DNS lookup succeeded ({len(infos)} records).")
    except socket.gaierror as exc:
        print(f"  DNS lookup failed: {exc}")


def _request_with_fallback(api_key: str, method: str, endpoint_path: str, payload: dict[str, Any] | None, timeout: int) -> None:
    endpoint = f"{BASE_URL}{endpoint_path}"
    headers = {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json,text/plain,*/*",
        "Authorization": f"Bearer {api_key}",
        "X-API-Key": api_key,
    }

    data = None
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"

    print(f"Calling: {method.upper()} {endpoint}")
    if payload is not None:
        print("Payload:")
        print(json.dumps(payload, indent=2))

    print("Attempt 1: using environment/system proxy settings")
    request = urllib.request.Request(endpoint, data=data, headers=headers, method=method.upper())
    if _run_request(urllib.request.build_opener(), request, timeout):
        return

    print("Attempt 2: bypassing proxies (direct connection)")
    with _temporary_proxy_env_cleared():
        # Create a fresh Request object to avoid urllib caching proxy state from attempt 1
        request = urllib.request.Request(endpoint, data=data, headers=headers, method=method.upper())
        if _run_request(urllib.request.build_opener(urllib.request.ProxyHandler({})), request, timeout):
            return

    _print_network_diagnostics()


def _payload_from_data_json(raw: str | None) -> dict[str, Any]:
    if not raw:
        return {}
    obj = json.loads(raw)
    if not isinstance(obj, dict):
        raise ValueError("--data-json must be a JSON object")
    return obj


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="ContactOut multi-endpoint API checker")
    parser.add_argument("--api-key", default=os.getenv("CONTACTOUT_API_KEY"), help="ContactOut API key (or set CONTACTOUT_API_KEY)")
    parser.add_argument("--timeout", type=int, default=20, help="Request timeout in seconds")

    subparsers = parser.add_subparsers(dest="command", required=True)

    def add_endpoint_subparser(name: str, help_text: str) -> argparse.ArgumentParser:
        p = subparsers.add_parser(name, help=help_text)
        p.add_argument("--endpoint-path", default=DEFAULT_PATHS[name], help=f"API path override (default: {DEFAULT_PATHS[name]})")
        p.add_argument("--data-json", help="Raw JSON object payload override")
        return p

    p_people_search = add_endpoint_subparser("people-search", "People Search API")
    p_people_search.add_argument("--company-name")
    p_people_search.add_argument("--job-title")
    p_people_search.add_argument("--location")

    p_people_count = add_endpoint_subparser("people-count", "People Count API")
    p_people_count.add_argument("--company-name")
    p_people_count.add_argument("--job-title")

    p_decision = add_endpoint_subparser("decision-makers", "Decision Makers API")
    p_decision.add_argument("--domain")
    p_decision.add_argument("--company-name")

    p_company_search = add_endpoint_subparser("company-search", "Company Search API")
    p_company_search.add_argument("--domain")
    p_company_search.add_argument("--company-name")

    p_email_li = add_endpoint_subparser("email-to-linkedin", "Email to LinkedIn API")
    p_email_li.add_argument("--email")

    p_contact_checker = add_endpoint_subparser("contact-checker", "Contact Checker API")
    p_contact_checker.add_argument("--email")
    p_contact_checker.add_argument("--phone")

    p_email_verifier = add_endpoint_subparser("email-verifier", "Email Verifier API")
    p_email_verifier.add_argument("--email")

    p_usage = add_endpoint_subparser("usage-stats", "API Usage Stats")
    p_usage.add_argument("--start-date", help="Optional YYYY-MM-DD")
    p_usage.add_argument("--end-date", help="Optional YYYY-MM-DD")

    subparsers.add_parser("errors", help="Print local HTTP error guide")

    return parser


def _build_payload(args: argparse.Namespace) -> tuple[str, dict[str, Any] | None, str]:
    command = args.command
    if command == "errors":
        return "GET", None, ""

    payload = _payload_from_data_json(args.data_json)

    if command == "usage-stats":
        endpoint = args.endpoint_path
        query = {}
        if args.start_date:
            query["start_date"] = args.start_date
        if args.end_date:
            query["end_date"] = args.end_date
        if query:
            endpoint = f"{endpoint}?{urllib.parse.urlencode(query)}"
        return "GET", None, endpoint

    if not payload:
        if command == "people-search":
            payload = {k: v for k, v in {"company_name": args.company_name, "job_title": args.job_title, "location": args.location}.items() if v}
        elif command == "people-count":
            payload = {k: v for k, v in {"company_name": args.company_name, "job_title": args.job_title}.items() if v}
        elif command == "decision-makers":
            payload = {k: v for k, v in {"domain": args.domain, "company_name": args.company_name}.items() if v}
        elif command == "company-search":
            payload = {k: v for k, v in {"domain": args.domain, "company_name": args.company_name}.items() if v}
        elif command == "email-to-linkedin":
            payload = {k: v for k, v in {"email": args.email}.items() if v}
        elif command == "contact-checker":
            payload = {k: v for k, v in {"email": args.email, "phone": args.phone}.items() if v}
        elif command == "email-verifier":
            payload = {k: v for k, v in {"email": args.email}.items() if v}

    if not payload:
        raise ValueError("No payload fields provided. Pass command flags or --data-json.")

    return "POST", payload, args.endpoint_path


def _print_errors_guide_only() -> None:
    print("ContactOut API error guide:")
    for code in sorted(ERROR_GUIDE):
        print(f"  {code}: {ERROR_GUIDE[code]}")


def main() -> None:
    parser = _build_parser()
    args = parser.parse_args()

    if args.command == "errors":
        _print_errors_guide_only()
        return

    if not args.api_key:
        parser.error("Missing API key. Pass --api-key or set CONTACTOUT_API_KEY.")

    try:
        method, payload, endpoint_path = _build_payload(args)
    except (ValueError, json.JSONDecodeError) as exc:
        parser.error(str(exc))

    _request_with_fallback(
        api_key=args.api_key,
        method=method,
        endpoint_path=endpoint_path,
        payload=payload,
        timeout=args.timeout,
    )


if __name__ == "__main__":
    main()
