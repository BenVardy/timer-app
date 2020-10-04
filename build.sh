#!/bin/bash
yarn build
cp static/index.php build/api.php
if [[ ! -e build/times.json ]]; then
    touch build/times.json
    chmod 666 build/times.json
fi
