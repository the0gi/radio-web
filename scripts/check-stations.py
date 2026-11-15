#!/usr/bin/env python3
"""Validate a station catalog; optionally sample public HTTPS audio streams.

Examples:
  python3 scripts/check-stations.py
  python3 scripts/check-stations.py --transport --output research/stream-checks-latest.json
  python3 scripts/check-stations.py research/expansion-candidates.json --transport

Audio is never saved. A failed check means needs-review, not removal. Transport
success does not prove browser playback, content identity, or long-term uptime.
"""
import argparse
import concurrent.futures
import datetime
import json
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path


REQUIRED_TEXT = ("id", "name", "countryCode", "country", "category", "website", "streamUrl", "contentType")


def https_url(value):
    if not isinstance(value, str):
        return False
    try:
        url = urllib.parse.urlsplit(value)
        port = url.port  # Validate malformed/non-numeric ports too.
        return url.scheme == "https" and bool(url.hostname) and not url.username and not url.password and not any(c.isspace() for c in value) and (port is None or 0 < port <= 65535)
    except ValueError:
        return False


def validate(stations):
    errors, warnings = [], []
    ids, streams = {}, {}
    for index, station in enumerate(stations):
        label = f"stations[{index}]"
        if not isinstance(station, dict):
            errors.append(f"{label}: expected object")
            continue
        label = str(station.get("id") or label)
        for field in REQUIRED_TEXT:
            if not isinstance(station.get(field), str) or not station[field].strip():
                errors.append(f"{label}: missing or empty {field}")
        station_id = station.get("id")
        if isinstance(station_id, str):
            if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", station_id):
                errors.append(f"{label}: id must be lowercase letters/digits separated by hyphens")
            if station_id in ids:
                errors.append(f"{label}: duplicate id")
            ids[station_id] = index
        for field in ("website", "streamUrl"):
            if not https_url(station.get(field)):
                errors.append(f"{label}: {field} must be an HTTPS URL without credentials")
        stream = station.get("streamUrl")
        if isinstance(stream, str):
            if stream in streams:
                warnings.append(f"{label}: shares streamUrl with {streams[stream]}; check for duplicate station")
            streams[stream] = label
        if station.get("countryCode") not in ("RS", "HR", "BA", "ME"):
            errors.append(f"{label}: countryCode must be RS, HR, BA, or ME")
        bitrate = station.get("bitrateKbps")
        if "bitrateKbps" not in station or (bitrate is not None and (isinstance(bitrate, bool) or not isinstance(bitrate, (int, float)) or bitrate <= 0)):
            errors.append(f"{label}: bitrateKbps must be a positive number or null")
        sources = station.get("sources")
        if not isinstance(sources, list) or not sources or not all(https_url(s) for s in sources):
            errors.append(f"{label}: sources must contain source URLs")
    return errors, warnings


class HTTPSOnlyRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        if not https_url(newurl):
            raise urllib.error.URLError("Redirect does not use HTTPS without credentials")
        return super().redirect_request(req, fp, code, msg, headers, newurl)


def check_stream(station, timeout, sample_bytes):
    result = {"id": station.get("id"), "url": station.get("streamUrl"), "checkedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(), "status": "needs-review", "bytesRead": 0, "audioResponseReceived": False}
    if not https_url(result["url"]):
        result["error"] = "Invalid HTTPS stream URL"
        return result
    try:
        request = urllib.request.Request(result["url"], headers={"User-Agent": "RadioCatalogCheck/1.0", "Accept": "audio/*, application/ogg;q=0.9, */*;q=0.1", "Icy-MetaData": "0"})
        opener = urllib.request.build_opener(HTTPSOnlyRedirect())
        with opener.open(request, timeout=timeout) as response:
            mime = response.headers.get_content_type()
            result.update({"httpStatus": response.status, "finalUrl": response.url, "contentType": mime, "icyName": response.headers.get("icy-name"), "icyBitrateKbps": response.headers.get("icy-br")})
            # Bounded read: close the live connection as soon as the sample arrives.
            data = response.read(sample_bytes)
            result["bytesRead"] = len(data)
            result["audioResponseReceived"] = bool(data) and (mime.startswith("audio/") or mime == "application/ogg")
            if result["audioResponseReceived"]:
                result["status"] = "transport-ok"
            else:
                result["error"] = "No audio response; manual review needed (possibly playlist or HTML)"
    except urllib.error.HTTPError as exc:
        result.update({"httpStatus": exc.code, "error": str(exc)})
        exc.close()
    except Exception as exc:
        result["error"] = f"{type(exc).__name__}: {exc}"
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("catalog", nargs="?", default="src/data/stations.json")
    parser.add_argument("--transport", action="store_true", help="Make bounded live stream requests")
    parser.add_argument("--output", type=Path, help="Save JSON report (stdout otherwise)")
    parser.add_argument("--workers", type=int, choices=range(1, 5), default=3)
    parser.add_argument("--timeout", type=float, default=10, help="Socket timeout in seconds")
    parser.add_argument("--sample-bytes", type=int, default=4096)
    args = parser.parse_args()
    if not 0 < args.timeout <= 30 or not 0 < args.sample_bytes <= 16384:
        parser.error("timeout must be 0–30 seconds and sample-bytes 1–16384")
    try:
        catalog = json.loads(Path(args.catalog).read_text())
        stations = catalog if isinstance(catalog, list) else catalog.get("stations", catalog.get("candidates"))
        if not isinstance(stations, list):
            raise ValueError("Expected a stations array")
    except (OSError, ValueError, AttributeError) as exc:
        parser.error(str(exc))
    errors, warnings = validate(stations)
    report = {"checkedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(), "catalog": args.catalog, "stationCount": len(stations), "schemaErrors": errors, "warnings": warnings, "transportChecks": []}
    if args.transport:
        with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as pool:
            report["transportChecks"] = list(pool.map(lambda station: check_stream(station, args.timeout, args.sample_bytes), (s for s in stations if isinstance(s, dict))))
    output = json.dumps(report, indent=2, ensure_ascii=False) + "\n"
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(output)
        print(f"{len(stations)} stations; {len(errors)} schema errors; {sum(c['status'] == 'needs-review' for c in report['transportChecks'])} streams need review. Report: {args.output}")
    else:
        print(output, end="")
    return 1 if errors else 2 if any(c["status"] == "needs-review" for c in report["transportChecks"]) else 0


if __name__ == "__main__":
    sys.exit(main())
