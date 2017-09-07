# NodeDeploy
Trigger a deployment script via webhook

##Installation
- Change the two variables in deploy.js ```key``` and ```script```, script should match a .sh shell script in the same directory, set the variable for ```secureMode``` (HTTP or HTTPS)
- Start NodeDeploy via ```npm start```

##How to use
GET Endpoint:
- Access the URL with the secret appended yoursite.com:8080/?secret=mykey for HTTP and yoursite.com:8443/?secret=mykey for HTTPS
- The JSON response indicates if the commands in the file were successfully executed

POST Endpoint:
- TO DO