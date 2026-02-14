"""ContactOut Company Information from Domains API helper.

Usage example:
  CONTACTOUT_API_KEY=... python contactout_check.py \
    --domain openai.com \
    --domain example.com
"""

from __future__ import annotations

import argparse
import contextlib
import json
import os
import socket
import urllib.error
import urllib.request

BASE_URL = "https://api.contactout.com"
COMPANY_FROM_DOMAINS_PATH = "/v1/company/domains"


@contextlib.contextmanager
def _temporary_proxy_env_cleared() -> None:
    """Temporarily clear proxy env vars to force a true direct connection attempt."""
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
    """Print payload as pretty JSON when possible, fallback to UTF-8 text."""
    try:
        print(json.dumps(json.loads(payload), indent=2))
    except Exception:
        print(payload.decode("utf-8", errors="replace"))


def _run_request(opener: urllib.request.OpenerDirector, request: urllib.request.Request, timeout: int) -> bool:
    """Execute a request and print response/error details."""
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
        if exc.code == 404:
            print("Tip: Endpoint path may differ for your account tier/version.")
            print("     Override with --endpoint-path if needed.")
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


def lookup_company_info_by_domains(
    api_key: str,
    endpoint_path: str,
    domains: list[str],
    timeout: int = 20,
) -> None:
    """Call ContactOut Company Information from Domains API."""
    endpoint = f"{BASE_URL}{endpoint_path}"
    body = json.dumps({"domains": domains}).encode("utf-8")

    headers = {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json,text/plain,*/*",
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}",
        "X-API-Key": api_key,
    }

    request = urllib.request.Request(endpoint, data=body, headers=headers, method="POST")

    print(f"Calling ContactOut Company Information from Domains API: {endpoint}")
    print(f"Domains in payload: {len(domains)}")
    print("Attempt 1: using environment/system proxy settings")
    if _run_request(urllib.request.build_opener(), request, timeout):
        return

    print("Attempt 2: bypassing proxies (direct connection)")
    with _temporary_proxy_env_cleared():
        if _run_request(urllib.request.build_opener(urllib.request.ProxyHandler({})), request, timeout):
            return

    _print_network_diagnostics()


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="ContactOut Company Information from Domains checker")
    parser.add_argument("--api-key", default=os.getenv("CONTACTOUT_API_KEY"), help="ContactOut API key (or set CONTACTOUT_API_KEY)")
    parser.add_argument("--endpoint-path", default=COMPANY_FROM_DOMAINS_PATH, help="API path to call (default: /v1/company/domains)")
    parser.add_argument("--domain", action="append", default=[], help="Company domain to look up (repeat for bulk requests)")
    parser.add_argument("--timeout", type=int, default=20, help="Request timeout in seconds (default: 20)")
    return parser


def main() -> None:
    parser = _build_parser()
    args = parser.parse_args()

    if not args.api_key:
        parser.error("Missing API key. Pass --api-key or set CONTACTOUT_API_KEY.")

    domains = [domain.strip() for domain in args.domain if domain.strip()]
    if not domains:
        parser.error("Provide at least one --domain value.")

    lookup_company_info_by_domains(
        api_key=args.api_key,
        endpoint_path=args.endpoint_path,
        domains=domains,
        timeout=args.timeout,
    )


if __name__ == "__main__":
    main()
