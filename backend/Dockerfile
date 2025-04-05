# get the image that has the version of python we want (small version)
FROM python:3.12-slim

# the working directory of the container is /app
WORKDIR /app

# make sure the pip version is the one we want
RUN pip install --upgrade pip==25.0.1

# copy the requirements that python needs
COPY requirements.txt .

# install the requirements (no-cache-dir since using docker)
RUN pip install --no-cache-dir -r requirements.txt

# copy the rest of the files to the container
COPY . .

# the backend will run on port 5000 (note: this is for documentation purposes as it doesn't actually expose the port)
EXPOSE 5000

# run the Python flask app
CMD ["flask", "run", "--host=0.0.0.0"]