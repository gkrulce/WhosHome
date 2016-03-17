#!/bin/bash

while true
do
    python -c "from util import *; populateArpTable(); dumpToFile(getUsers(), getMACAddresses())"
    sleep 60
done
