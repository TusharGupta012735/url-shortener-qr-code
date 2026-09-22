# Snowflake ID and Base62 Design

This document explains how short codes are generated.

## Why Snowflake

- Distributed ID generation without DB roundtrips
- Time-sortable IDs
- Scales across instances

## Bit layout

```text
timestamp (41) | worker id (10) | sequence (12)
```

## Why Base62

Base62 encodes numeric IDs into URL-safe short strings using:

- `0-9`
- `A-Z`
- `a-z`

Example:

```text
1782938472394823 -> MJJpcLmQHg
```

## URL creation flow

1. Generate Snowflake ID
2. Encode with Base62
3. Persist URL with `snowflakeId` and `shortCode`
4. Return short code to client

## Analytics note

Redirect analytics are processed asynchronously through Kafka (`link.visited`) and do not affect Snowflake/Base62 generation.
