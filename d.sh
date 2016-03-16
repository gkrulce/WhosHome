#!/bin/bash

while true
do
    python -c "from util import *; dumpToFile(getUsers(), getMACAddresses())"
    sleep 60
done
