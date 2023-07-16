# Use Debian Buster-slim as the base image
FROM debian:buster-slim

# Update the package repository and install dependencies
RUN apt-get update && apt-get install -y fondu t1utils fonttools nodejs python3 python3-pip python3-venv cmake git pkg-config uuid-dev fontforge

# Create a virtual environment
RUN python3 -m venv /afdko_env

# Install afdko in the virtual environment
RUN /afdko_env/bin/pip install --upgrade pip
RUN /afdko_env/bin/pip install afdko

WORKDIR /data

# Define the default command
CMD ["bash"]

# Set the ENTRYPOINT to use bash and activate the virtual environment
ENTRYPOINT ["/bin/bash", "-c", "source /afdko_env/bin/activate && exec bash"]