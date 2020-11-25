# Fresh Start (Amazon Linux)
## Setup On AWS
```
sudo yum update -y;
sudo amazon-linux-extras install docker;
sudo service docker start;
sudo usermod -a -G docker ec2-user;
sudo systemctl enable docker;
sudo reboot -n;
```

## Setup Git on AWS
```
sudo yum install git-core;
```

## Download
Navigate to whatever directory you want to clone it to (e.g. `cd ~/Makosai` and then the git clone command will automatically create the Dingo folder)
```
git clone https://github.com/Makosai/Dingo.git
```
"yes" to accept the RSA.
## Run Docker
Go to the newly created Dingo folder.
Paste your `firebase.config.json` file into `src/firebase/`. There's an example in that folder if you need it.
```
docker build --tag dingo .
docker run -id -p 2241:2241 -p 2351:2351 --name dingo dingo
```
That will build the container and run it.

## Updating
```
git pull;
docker stop dingo;
docker rm dingo;
docker build --tag dingo .;
docker run -id -p 2241:2241 -p 2351:2351 --name dingo dingo;
```

This will pull the latest git files, stop any existing container for dingo, remove the previous container, build it again, and then finally run it.

# Maintainance
```
docker system prune --all
```
