#!/bin/bash
yarn build
cp static/index.php build/api.php
if [[ ! -e times.json ]]; then
    touch times.json
    chmod 666 times.json
fi
ln times.json build/times.json
