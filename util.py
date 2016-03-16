#!/usr/bin/python
import subprocess
import time
import re
import datetime
import time

from constants import mac_to_user_dict

# Group 1 is ipaddress. Group 2 is MAC Address
arpTableRE = r"([0-9.-.]+) \s* [0-9x-x]+ \s* [0-9x-x]+ \s* ([0-9:-:a-f]+) .*" 

def populateArpTable():
    try:
        ret_string = subprocess.check_output(["nmap", "-sP", "192.168.0.0/24"])
    except CalledProcessError:
        print "NMAP COMMAND FAILED. THIS IS WHAT WAS RETURNED"
        print ret_string

def getMACAddresses():
    macs = []
    with open("/proc/net/arp") as f:
        for l in f:
            m = re.match(arpTableRE, l)
            if m:
                if(m.group(2) != "00:00:00:00:00:00"):
                    macs.append(str(m.group(2)).upper())
    return macs
def getUsers():
    users = []
    macs = getMACAddresses()
    for m in macs:
        if(m in mac_to_user_dict):
            user = mac_to_user_dict[m]
            if user not in users:
                users.append(user)
        else:
            print "unknown mac address: " + m

    return users

def dumpToFile(users, macs):
    with open("humanReadable.txt", "a") as f:
        f.write("{0} {1}\n".format(str(datetime.datetime.today())[:-7], users))

    with open("machineReadable.txt", "a") as f:
        f.write("{0}\t{1}\n".format(time.time(), macs))

if __name__ == '__main__':
    populateArpTable()
    users = getUsers()
    print "{0} {1}".format(str(datetime.datetime.today())[:-7], users)
