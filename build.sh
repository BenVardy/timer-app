#!/bin/bash
yarn build
cp static/index.php build/api.php
touch build/times.json
chmod 666 build/times.json
