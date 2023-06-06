## Requirements

To run AI Verify, these are the recommended requirements to run AI Verify on a local computer.

### System

|       | Recommended Requirements | 
| ----------- | ----------- |
| Operating System     | Ubuntu 22.04  |
| CPU*     | At least 4 cores (Please note that this varies based on the complexity of the model tested.) |
| Memory    | At least 16GB   |
| Free Space    | At least 6GB of available space |
| GPU*    | Depends on the model tested |

### Software

|    Software   | Recommended Version | 
| ----------- | ----------- |
| [Docker](https://docs.docker.com/get-docker/)     | ##TO BE UPDATED |
| [NodeJs](https://nodejs.org/en/download) | v18.x |
| [Python](https://www.python.org/downloads/release/python-3100/)    | v3.10  |
| [Git](https://git-scm.com/downloads)   | v2.40.0|

## Clone and Build AI Verify

!!! Note
    If you have installed AI Verify before, it is recommended to start the containiner with a clean state. Run the following commands to clean up existing data and files: 
      ```bash
      bash docker-start.sh --reset
      ```

1. Clone AI Verify to your local computer. Open a terminal:
```bash
git clone https://github.com/IMDA-BTG/aiverify.git aiverify
```

2. Type the following commands to build the docker image.
```bash
cd aiverify/build
bash docker-build.sh
```

3. Click on the "Images" tab in Docker Desktop, you should see `ai-verify` running in Docker: 
![docker-image](../../res/getting-started/docker-image-example.png)

!!! Warning
    It will take a while to build the docker image as there are many dependencies and modules required for the environment.   

## Run AI Verify

1. Start AI Verify using our start script
```bash
bash docker-start.sh
```

2. Type [http://localhost:3000](http://localhost:3000) into your browser's address bar. 
   ![aiverify-home](../../res/getting-started/ai-verify-example.png)