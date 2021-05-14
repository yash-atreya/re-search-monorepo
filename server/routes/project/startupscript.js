module.exports = `#! /bin/bash

echo "STARTING REDIS INSTALLATION ON STARTUP"
echo "Making Dir in $(pwd)"
mkdir redis && cd redis
echo "Downloading deps..."
sudo apt-get update
sudo apt updgrade
sudo apt-get install wget -y
sudo apt install build-essential -y
echo "Installing git.."
sudo apt-get install git -y
echo "Downloading redis-stable.tar.gz"
wget http://download.redis.io/redis-stable.tar.gz
tar xvzf redis-stable.tar.gz
echo "Downloaded"
cd redis-stable
echo "Installed make -v $(make -v)"
make
sudo make install
echo "Redis Server installed version = $(redis-server -v)"
cd ..
echo "Cloning RediSearch in $(pwd)"
git clone --recursive https://github.com/RediSearch/RediSearch.git
echo "Cloned"
cd RediSearch
sudo make setup
make build
rediSearchBuildPath="$(pwd)/redisearch.so"
echo "Redis Search Build path is = $rediSearchBuildPath"
cd ..
echo "Current PATH = $(pwd)"
wget https://storage.googleapis.com/startup-scripts-redis-search/redis.conf
redisConfPath="$(pwd)/redis.conf"
echo "Current PATH = $(pwd)"
rm -rf redis-stable.tar.gz
myip=$(curl -s http://whatismyip.akamai.com/)
echo "Making curl request from $myip"
curl -X POST -H "Content-Type: application/json" -d '{"external_ip":"'$myip'", "authKey":"${process.env.VERIFY_STARTUP_SCRIPT_KEY}"}' https://us-central1-redis-search.cloudfunctions.net/verifyStartupScript 
echo "Starting redis-server with search..."
redis-server $redisConfPath
echo "SUCCESS"
`;
