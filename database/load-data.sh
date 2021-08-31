#!/bin/bash

exec psql postgresql://patient_portal:secret@localhost/patient_portal < $(dirname $0)/data.sql
