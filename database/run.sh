#!/bin/bash

dir=$(dirname "$0")

podman run --rm --name patient-portal-database --detach --net host \
       -e POSTGRES_USER=patient_portal \
       -e POSTGRES_PASSWORD=secret \
       -e POSTGRES_HOST_AUTH_METHOD=scram-sha-256 \
       -e POSTGRES_INITDB_ARGS=--auth-host=scram-sha-256 \
       docker.io/postgres

trap "podman kill patient-portal-database" EXIT

echo "Waiting for the database to start up"

sleep 5

echo "Loading data"

psql postgresql://patient_portal:secret@localhost/patient_portal < $dir/data.sql

echo "Following the logs"

podman logs --follow patient-portal-database
