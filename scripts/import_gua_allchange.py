#!/usr/bin/env python3
"""
Import All_Gua_withFuShen*.json into MySQL gua_allchange.

- Column order is read from CREATE TABLE in a schema SQL file, so INSERT always
  matches your DDL (including per-yao grouping).
- Per-爻 JSON: 天干/地支/六亲; 伏神_地支 -> yao{k}_zhi_fu; 伏神_六亲 -> yao{k}_liuqin_fu.
  If both are empty, legacy single field 伏神 (六亲名) maps to liuqin_fu only.

Requires: pip install pymysql

Example (from liuyao-web repo root; data lives in parent LiuYao/):

  python scripts/import_gua_allchange.py \\
    --user root --password 'secret' --database liuyao \\
    --truncate

  # or: export MYSQL_PASSWORD=secret
  # or:  --ask-password
"""

from __future__ import annotations

import argparse
import getpass
import json
import os
import re
import sys
from pathlib import Path
from typing import Any

try:
    import pymysql
    from pymysql.err import OperationalError
except ImportError:
    print("pip install pymysql", file=sys.stderr)
    sys.exit(1)

YAO_KEYS = ["初爻", "二爻", "三爻", "四爻", "五爻", "六爻"]


def empty_to_none(v: Any) -> Any:
    if v is None:
        return None
    t = str(v).strip()
    return None if t == "" else t


def parse_columns_from_create_table(sql_text: str, table: str) -> list[str]:
    pat = rf"CREATE TABLE `{re.escape(table)}`\s*\((.*?)\)\s*ENGINE"
    m = re.search(pat, sql_text, re.S | re.I)
    if not m:
        raise ValueError(f"CREATE TABLE `{table}` (...) not found in schema file")
    body = m.group(1)
    cols: list[str] = []
    for raw in body.splitlines():
        line = raw.strip().rstrip(",")
        if not line or re.match(r"PRIMARY\s+KEY", line, re.I):
            continue
        mm = re.match(r"`([^`]+)`", line)
        if mm:
            cols.append(mm.group(1))
    if not cols:
        raise ValueError("No columns parsed from CREATE TABLE body")
    return cols


def fushen_zhi_liuqin(y: dict[str, Any]) -> tuple[Any, Any]:
    zhi = empty_to_none(y.get("伏神_地支"))
    lq = empty_to_none(y.get("伏神_六亲"))
    if zhi is None and lq is None:
        legacy = empty_to_none(y.get("伏神"))
        if legacy is not None:
            lq = legacy
    return zhi, lq


def row_tuple(cols: list[str], rec: dict[str, Any]) -> tuple[Any, ...]:
    gua_id = str(rec["编号"]).strip()
    head = {
        "gua_id": gua_id,
        "name": empty_to_none(rec.get("卦名")),
        "yinyang": empty_to_none(rec.get("阴阳")),
        "guagong": empty_to_none(rec.get("卦宫")),
        "shi": int(str(rec["世爻"]).strip()),
        "ying": int(str(rec["应爻"]).strip()),
    }

    flat_yao: dict[str, Any] = {}
    for i, k in enumerate(YAO_KEYS, start=1):
        y = rec[k]
        zhi_fu, liuqin_fu = fushen_zhi_liuqin(y)
        flat_yao[f"yao{i}_gan"] = empty_to_none(y.get("天干"))
        flat_yao[f"yao{i}_zhi"] = empty_to_none(y.get("地支"))
        flat_yao[f"yao{i}_liuqin"] = empty_to_none(y.get("六亲"))
        flat_yao[f"yao{i}_zhi_fu"] = zhi_fu
        flat_yao[f"yao{i}_liuqin_fu"] = liuqin_fu

    row: list[Any] = []
    for c in cols:
        if c in head:
            row.append(head[c])
        elif c in flat_yao:
            row.append(flat_yao[c])
        else:
            raise KeyError(f"Column `{c}` not mapped from JSON; extend row_tuple()")
    return tuple(row)


def build_insert_sql(table: str, cols: list[str]) -> str:
    col_list = ", ".join(f"`{c}`" for c in cols)
    placeholders = ", ".join(["%s"] * len(cols))
    return f"INSERT INTO `{table}` ({col_list}) VALUES ({placeholders})"


def default_paths() -> tuple[Path, Path]:
    """If repo is LiuYao/liuyao-web, schema/json live in LiuYao/."""
    liuyao_dir = Path(__file__).resolve().parents[2]
    return (
        liuyao_dir / "table_gua_allchange_.sql",
        liuyao_dir / "All_Gua_withFuShen2.json",
    )


def main() -> None:
    d_schema, d_json = default_paths()
    p = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    p.add_argument(
        "--schema",
        type=Path,
        default=d_schema,
        help="SQL with CREATE TABLE (default: LiuYao/table_gua_allchange_.sql)",
    )
    p.add_argument(
        "--json",
        type=Path,
        default=d_json,
        help="Source JSON (default: LiuYao/All_Gua_withFuShen2.json)",
    )
    p.add_argument(
        "--table",
        default="gua_allchange",
        help="Target table name (must match CREATE TABLE in schema file)",
    )
    p.add_argument("--host", default="127.0.0.1")
    p.add_argument("--port", type=int, default=3306)
    p.add_argument("--user", required=True)
    pwd_default = os.environ.get("MYSQL_PASSWORD") or os.environ.get("LIUYAO_MYSQL_PASSWORD") or ""
    p.add_argument(
        "--password",
        default=pwd_default,
        help="MySQL password; if omitted, uses MYSQL_PASSWORD or LIUYAO_MYSQL_PASSWORD env",
    )
    p.add_argument(
        "--ask-password",
        action="store_true",
        help="Prompt for MySQL password (stdin hidden); overrides --password / env",
    )
    p.add_argument("--database", required=True)
    p.add_argument("--batch", type=int, default=500)
    p.add_argument(
        "--dry-run",
        action="store_true",
        help="Validate only; print column count and first row",
    )
    p.add_argument("--truncate", action="store_true", help="TRUNCATE TABLE before insert")
    p.add_argument(
        "--allow-duplicate-id",
        action="store_true",
        help="Do not skip duplicate 编号 (second insert fails if PK is gua_id)",
    )
    args = p.parse_args()
    if args.ask_password:
        args.password = getpass.getpass("MySQL password: ")

    if not args.schema.is_file():
        sys.exit(f"Schema file not found: {args.schema}")
    if not args.json.is_file():
        sys.exit(f"JSON file not found: {args.json}")

    cols = parse_columns_from_create_table(
        args.schema.read_text(encoding="utf-8"), args.table
    )
    sql = build_insert_sql(args.table, cols)

    data = json.loads(args.json.read_text(encoding="utf-8"))
    if not isinstance(data, list):
        sys.exit("JSON root must be an array")

    seen: set[str] = set()
    rows: list[tuple[Any, ...]] = []
    for i, rec in enumerate(data):
        if not isinstance(rec, dict):
            print(f"WARN skip non-object at index {i}", file=sys.stderr)
            continue
        gid = str(rec.get("编号", "")).strip()
        if not gid:
            print(f"WARN skip missing 编号 at index {i}", file=sys.stderr)
            continue
        if not args.allow_duplicate_id and gid in seen:
            print(f"WARN duplicate 编号 {gid!r} at index {i}, skip", file=sys.stderr)
            continue
        seen.add(gid)
        try:
            rows.append(row_tuple(cols, rec))
        except Exception as e:
            print(f"ERROR index {i} 编号={gid!r}: {e}", file=sys.stderr)
            raise

    print(f"columns={len(cols)} rows={len(rows)} (json_len={len(data)})")

    if args.dry_run:
        if rows:
            print("sample_row[0]:", rows[0])
        return

    try:
        conn = pymysql.connect(
            host=args.host,
            port=args.port,
            user=args.user,
            password=args.password,
            database=args.database,
            charset="utf8mb4",
            autocommit=False,
        )
    except OperationalError as e:
        if e.args and e.args[0] == 1045:
            print(
                "MySQL access denied (often: password not sent). Use one of:\n"
                "  --password 'your_password'\n"
                "  --ask-password\n"
                "  export MYSQL_PASSWORD=...   # or LIUYAO_MYSQL_PASSWORD",
                file=sys.stderr,
            )
        raise
    try:
        with conn.cursor() as cur:
            if args.truncate:
                cur.execute(f"TRUNCATE TABLE `{args.table}`")
            for s in range(0, len(rows), args.batch):
                cur.executemany(sql, rows[s : s + args.batch])
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
    print("done")


if __name__ == "__main__":
    main()
