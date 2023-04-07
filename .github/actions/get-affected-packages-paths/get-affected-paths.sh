#!/usr/bin/env bash
set -eo pipefail
IFS=$'\n\t'

set -u

replace() {
    cat workspace.json | jq ".projects[\"$1\"]"
}

export -f replace

readonly AFFECTED_STRING=$(yarn nx affected:libs --plain)
readonly AFFECTED_ARRAY=($(echo "$AFFECTED_STRING" | tr ' ' '\n'))

RESULT=''

if [[ -z "$AFFECTED_STRING" ]]; then
    echo "[]"
    exit 0
fi

for app in "${AFFECTED_ARRAY[@]}"; do
    if [[ -z "${RESULT}" ]]; then
        RESULT=$(replace "$app")
    else
        RESULT="$RESULT,$(replace "$app")"
    fi
done

RESULT="[$RESULT]"

echo "$RESULT"
