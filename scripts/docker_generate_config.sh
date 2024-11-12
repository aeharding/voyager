#!/usr/bin/env bash

# Function to sanitize input
sanitize_input() {
    # Remove leading and trailing whitespaces
    local sanitized_input
    sanitized_input=$(echo "$1" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')
    echo "$sanitized_input"
}

# Get comma-separated list from the environment variable and sanitize it
servers=$(sanitize_input "$CUSTOM_LEMMY_SERVERS")

# Split comma-separated list into an array
IFS=',' read -ra server_array <<< "$servers"

# Convert array to JSON format
json="{ \"customServers\": ["

for server in "${server_array[@]}"; do
    # Sanitize each server name
    sanitized_server=$(sanitize_input "$server")
    if [ -n "$sanitized_server" ]; then
        json+="\"$sanitized_server\", "
    fi
done

# Remove trailing comma and add closing bracket
json="${json%, } ] }"

# Write JSON to a file
echo "$json" > /var/www/config.json

echo "JSON file generated: config.json"
