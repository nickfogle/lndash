#!/bin/bash

# Collects system performance statistics such as CPU, memory, and disk
# usage as well as top processes ran by users.
#
# All size values are in KiB (memory, disk, etc).


# Takes these command line arguments:
# $1 - cpuThreshold in % of total across all CPUs. Default is provided in no-args option.
# $2 - memThreshold in % of total avail. Default is provided in no-args option.
#
# EXAMPLE USAGE:
# ./os_stats.sh 5 20


# Debugging and error handling
# Stop this script on any error. Unless you want to get data by any means
# this is a good option.
set -e
# Debugging options:
# set -x
# set -v


# Validate command line arguments
if [[ "$#" == 1 || "$#" > 2 ]]; then
  echo "Wrong number of arguments supplied. Expects 2 arguments: <cpu>, <mem>, or none."
  exit 1
fi


# Configurable variables
#
# CPU threshold in %of total CPU consumption (100%)
# All processes below this threshold will be discarded.
if [ -z "$1" ]; then
  cpuThreshold="1"
else
  cpuThreshold="$1"
fi
# % of memory usage. All processes below this threshold will be discarded.
if [ -z "$2" ]; then
  memThreshold="10"
else
  memThreshold="$2"
fi


# General OS props
HOST=$HOSTNAME
#OS=$(uname -a)
OS=$(lsb_release -s -i -c -r | tr '\n' ' ')
UPTIME=$(uptime -p)
ARCHITECTURE=$(uname -m)

version="0.1"

temp=$(vcgencmd measure_temp | sed 's/temp=//g')

# Memory
memTotal=$(egrep '^MemTotal:' /proc/meminfo | awk '{print $2}')
memFree=$(egrep '^MemFree:' /proc/meminfo | awk '{print $2}')
memCached=$(egrep '^Cached:' /proc/meminfo | awk '{print $2}')
memAvailable=$(expr "$memFree" + "$memCached")
#memUsed=$(($memTotal - $memAvailable))
memUsed=$(($memTotal - $memFree))
swapTotal=$(egrep '^SwapTotal:' /proc/meminfo | awk '{print $2}')
swapFree=$(egrep '^SwapFree:' /proc/meminfo | awk '{print $2}')
swapUsed=$(($swapTotal - $swapFree))


# CPU
cpuThreads=$(grep processor /proc/cpuinfo | wc -l)
#cpuUtilization=$(top -bn3 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}' | tail -1)
cpuUtilization=$((100 - $(vmstat 2 2 | tail -1 | awk '{print $15}' | sed 's/%//')))

# Disk
disksJson=$(for d in $(df -P -x tmpfs -x devtmpfs -x ecryptfs -x nfs -x cifs -T | tail -n+2 | awk '{print "{" "\"total\":" $3 ", \"used\":" $4 ", \"mountPoint\":" "\""$7"\"" "},"}'); do echo $d; done | sed '$s/.$//')

# Processes
processesJson=$(ps --no-headers -eo user,pcpu,comm,pmem --sort=user | grep -v '<defunct>' | while read p; do
  arr=($p)
  user=${arr[0]}
  load=${arr[1]}
  command=${arr[2]}
  memory=${arr[3]}
  load=$(echo "scale=2; $load / $cpuThreads" | bc -l | awk '{printf "%0.2f\n", $0}')
  if [[ "$load" > "$cpuThreshold" || "$memory" > "$memThreshold" ]]; then
    memUsedKb=$(echo "scale=0; $memory * $memTotal / 100 " | bc -l)
    echo  " {\"cpuLoad\": \"$load\", \"command\": \"$command\", \"memoryUsage\": \"$memUsedKb\"},"
  fi
done | sed '$s/.$//')

# Final result in JSON
JSON="{
  \"version\" : \"$version\",
  \"temp\" : \"$temp\",
  \"hostname\": \"$HOST\",
  \"operatingSystem\": \"$OS\",
  \"uptime\": \"$UPTIME\",
  \"architecture\": \"$ARCHITECTURE\",
  \"memoryTotal\" : $memTotal,
  \"memoryUsed\" : $memUsed,
  \"cpuThreads\": $cpuThreads,
  \"cpuUsage\" : $cpuUtilization,
  \"processes\" : [ $processesJson],
  \"disks\" : [$disksJson]
}"

echo "$JSON"
