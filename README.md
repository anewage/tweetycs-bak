# tweetycs-bak
A light bak.js application for Tweetycs project

# Deploy
```bash
# Create config file
mv config/default.js config/local.js

# Create .env file
mv .env.example .env

# Edit config file and DB credentials
vim .env 
vim config/local.js
 
# Deploy the services
docker-compose up
```
