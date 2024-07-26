#!/usr/bin/env bash

# Update package list and install necessary dependencies
apt-get update && apt-get install -y \
    software-properties-common \
    build-essential \
    libproj-dev \
    proj-bin

# Add the PPA for the required version of PROJ
add-apt-repository -y ppa:ubuntugis/ubuntugis-unstable

# Update package list again
apt-get update

# Install the correct version of PROJ
apt-get install -y proj-data proj-bin libproj-dev
