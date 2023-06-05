#!/bin/bash

# Check if Node.js is installed
if ! which node >/dev/null 2>&1; then
  echo "Node.s is not installed. Please install nodejs, aiverify requires Node.js v18.x."
  exit 1
fi

# Check Node.js version
node_ver=$(node -v)
required_node_ver="v18"
if [[ $node_ver != $required_node_ver* ]]; then
  echo "aiverify requires Node.js $required_node_ver.x, please install Node.js $required_node_ver.x."
  exit 1
fi

# Check if Python3 is installed
if ! which python3 &>/dev/null; then
  echo "Python3 is not installed. Please install Python3, aiverify requires Python 3.10.x."
  exit 1
fi

# Check Python version
py_ver=$(python3 --version 2>&1)
required_py_ver="Python 3.10"
if [[ $py_ver != $required_py_ver* ]]; then
  echo "aiverify is tested on $required_py_ver.x, you may encounter issues with other python3 versions."
fi

echo "This script requires sudo permission"
sudo -v

# Check machine architecture - amd64 or arm64 (M1/2)
# x86_64, i686, arm, or aarch64
machine_arch=$(uname -m)

# Script to setup the aiverify development environment

sudo apt update

############ redis ############

echo "========================== Install redis ============================="
sudo apt install -y redis-server
pattern='notify-keyspace-events ""'
replacement='notify-keyspace-events Kh'
sudo sed -i 's/'"$pattern"'/'"$replacement"'/g' "/etc/redis/redis.conf"

sudo systemctl restart redis-server.service

############ mongodb ############

echo "========================= Install mongodb ============================"

wget -nc https://www.mongodb.org/static/pgp/server-6.0.asc
cat server-6.0.asc | gpg --dearmor | sudo tee /etc/apt/keyrings/mongodb.gpg >/dev/null
sudo sh -c 'echo "deb [ arch=amd64,arm64 signed-by=/etc/apt/keyrings/mongodb.gpg] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" >> /etc/apt/sources.list.d/mongo.list'
sudo apt update
sudo apt install -y mongodb-org

sudo systemctl start mongod
sleep 2
mongosh <<EOF
  admin = db.getSiblingDB('admin')
  admin.createUser({
    user: 'mongodb',
    pwd: 'mongodb',
    roles: [{ role: 'root', db: 'admin' }],
  });

  aiverify = db.getSiblingDB('aiverify')

  aiverify.createUser({
    user: 'aiverify',
    pwd: 'aiverify',
    roles: [{ role: 'readWrite', db: 'aiverify' }],
  });

  aiverify.createCollection('test-collection');

EOF

if [[ "$machine_arch" == "aarch64" ]]; then
  echo "arm64 architecture detected"
  echo "====================== Installing Chromium ========================="
  # For arm64 based machines, as Puppeteer installs Chrome which is only
  # available in amd64

  sudo apt install debian-archive-keyring

  umask 22

  echo "deb [signed-by=/usr/share/keyrings/debian-archive-keyring.gpg] http://deb.debian.org/debian stable main
deb-src [signed-by=/usr/share/keyrings/debian-archive-keyring.gpg] http://deb.debian.org/debian stable main

deb [signed-by=/usr/share/keyrings/debian-archive-keyring.gpg] http://deb.debian.org/debian-security/ stable-security main
deb-src [signed-by=/usr/share/keyrings/debian-archive-keyring.gpg] http://deb.debian.org/debian-security/ stable-security main

deb [signed-by=/usr/share/keyrings/debian-archive-keyring.gpg] http://deb.debian.org/debian stable-updates main
deb-src [signed-by=/usr/share/keyrings/debian-archive-keyring.gpg] http://deb.debian.org/debian stable-updates main" | sudo tee /etc/apt/sources.list.d/debian-stable.list

  echo "Explanation: Allow installing chromium from the debian repo.
Package: chromium*
Pin: origin "*.debian.org"
Pin-Priority: 100

Explanation: Avoid other packages from the debian repo.
Package: *
Pin: origin "*.debian.org"
Pin-Priority: 1" | sudo tee /etc/apt/preferences.d/debian-chromium

  sudo apt update

  sudo apt install chromium -y

  sudo ln -s /usr/bin/chromium /usr/bin/chromium-browser
else
  # Install libs needed by puppeteer/chromium
  sudo apt install -y libx11-xcb1 libxcomposite1 libxcursor1 libxdamage1 \
          libxi-dev libxtst-dev libnss3 libcups2 libxss1 libxrandr2 \
          libasound2 libatk1.0-0 libatk-bridge2.0-0 libpangocairo-1.0-0 \
          libgtk-3-0 libgbm1
fi

# For shap-toolbox plugin
sudo apt install -y gcc g++ python3-dev

echo "====================== Cloning aiverify repo ========================="

sudo apt install -y git
sudo apt-get install unzip

sudo apt install -y python3.10-venv

pat=$1
# Won't need PAT when aiverify repo become public
git clone https://oauth2:${pat}@github.com/imda-btg/aiverify.git
cd aiverify

############ Node ############

echo "===================== Installing node dependencies ====================="

# Install dependencies - shared-library
cd ai-verify-shared-library
npm install
npm run build
cd ..

# Install dependencies - portal
cd ai-verify-portal
cp .env.development .env.local
npm install
sudo npm link ../ai-verify-shared-library
cd ..

# Install dependencies - apigw
cd ai-verify-apigw
cp .env.development .env
if [[ "$machine_arch" == "aarch64" ]]; then
  PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1 npm install
else
  npm install
fi
cd ..

# Install stock plugins (non-algos)
unzip stock-plugins/aiverify.stock.decorators/dist/aiverify.stock.decorators-*.zip -d ai-verify-portal/plugins/stock.decorators
unzip stock-plugins/aiverify.stock.process-checklist/dist/aiverify.stock.process_checklist-*.zip -d ai-verify-portal/plugins/stock.process-checklist
unzip stock-plugins/aiverify.stock.reports/dist/aiverify.stock.reports-*.zip -d ai-verify-portal/plugins/stock.reports

############ Python ############

echo "Enabling virtualenv venv"
python3 -m venv venv
source venv/bin/activate

echo "====================== Installing py dependencies ======================"
find ./ -type f -name 'requirements.txt' -exec pip install -r "{}" \;
pip3 install ./test-engine-core/dist/test_engine_core-*.tar.gz

wdir=$(pwd)
cd test-engine-app
echo "CORE_MODULES_FOLDER=\"$wdir/test-engine-core-modules/src\"
VALIDATION_SCHEMAS_FOLDER=\"$wdir/test-engine-app/test_engine_app/validation_schemas/\"
REDIS_CONSUMER_GROUP=\"MyGroup\"
REDIS_SERVER_HOSTNAME=\"localhost\"
REDIS_SERVER_PORT=6379
API_SERVER_PORT=8080" > .env
cd ..

# Install stock plugins (algos)
echo "Install stock plugins (algos)"
unzip stock-plugins/aiverify.stock.accumulated-local-effect/dist/*.zip -d ai-verify-portal/plugins/stock.accumulated-local-effect
unzip stock-plugins/aiverify.stock.fairness-metrics-toolbox-for-classification/dist/*.zip -d ai-verify-portal/plugins/stock.fairness-metrics-toolbox-for-classification
unzip stock-plugins/aiverify.stock.fairness-metrics-toolbox-for-regression/dist/*.zip -d ai-verify-portal/plugins/stock.fairness-metrics-toolbox-for-regression
unzip stock-plugins/aiverify.stock.image-corruption-toolbox/dist/*.zip -d ai-verify-portal/plugins/stock.image-corruption-toolbox
unzip stock-plugins/aiverify.stock.partial-dependence-plot/dist/*.zip -d ai-verify-portal/plugins/stock.partial-dependence-plot
unzip stock-plugins/aiverify.stock.robustness-toolbox/dist/*.zip -d ai-verify-portal/plugins/stock.robustness-toolbox
unzip stock-plugins/aiverify.stock.shap-toolbox/dist/*.zip -d ai-verify-portal/plugins/stock.shap-toolbox

echo "Run portal build"
cd ai-verify-portal
npm run build
cd ..

echo "====================== Creating aiverify services ======================="

echo "[Unit]
Description=test-engine-app
After=network.target

[Service]
User=$USER
WorkingDirectory=$(pwd)/test-engine-app
ExecStart=/bin/bash -c 'source venv/bin/activate && python3 -m test_engine_app'

[Install]
WantedBy=multi-user.target" | sudo tee /etc/systemd/system/test-engine-app.service

echo "[Unit]
Description=ai-verify-apigw
After=network.target

[Service]
User=$USER
WorkingDirectory=$(pwd)/ai-verify-apigw
ExecStart=node app.mjs

[Install]
WantedBy=multi-user.target" | sudo tee /etc/systemd/system/ai-verify-apigw.service

echo "[Unit]
Description=ai-verify-portal
After=network.target

[Service]
User=$USER
WorkingDirectory=$(pwd)/ai-verify-portal
ExecStart=npm run start

[Install]
WantedBy=multi-user.target" | sudo tee /etc/systemd/system/ai-verify-portal.service

#cd test-engine-app
#python3 -m test_engine_app &
#cd ..
#cd ai-verify-apigw
#nohup node app.mjs &
#cd ..
#cd ai-verify-portal
#npm run start
