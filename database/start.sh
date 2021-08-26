#!/bin/bash

exec podman run --rm --name patient-portal-database --detach --net host \
       -e POSTGRES_USER=patient_portal \
       -e POSTGRES_PASSWORD=secret \
       -e POSTGRES_HOST_AUTH_METHOD=scram-sha-256 \
       -e POSTGRES_INITDB_ARGS=--auth-host=scram-sha-256 \
       docker.io/postgres
