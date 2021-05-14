#! /bin/bash
echo "> Deploying files to compute instance\n"

gcloud compute scp --recurse /Users/yashatreya/Desktop/re-search/server redis-test:/home/yashatreya

echo "> Successfully deployed!"

echo "> Connecting to instance"

gcloud compute ssh  --zone "europe-west3-c" "redis-test"  --project "redis-search"