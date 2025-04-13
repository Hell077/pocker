#!/bin/bash

echo "🚀 Starting PostgreSQL..."
service postgresql start

sleep 15

echo "🌀 Starting Temporal Server..."
temporal-sql-tool --ep localhost --db temporal setup-schema -v 0.0
temporal-sql-tool --ep localhost --db temporal update-schema -d schema/postgresql/v96

temporal-server start --env development &

echo "📺 Starting Temporal UI..."
temporal-ui start --port 8080
