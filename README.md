# Patient Portal with PostgreSQL and Skupper

[![main](https://github.com/skupperproject/skupper-example-patient-portal/actions/workflows/main.yaml/badge.svg)](https://github.com/skupperproject/skupper-example-patient-portal/actions/workflows/main.yaml)

#### A simple database-backed web application that runs in the public cloud but keeps its data in a private database

This example is part of a [suite of examples][examples] showing the
different ways you can use [Skupper][website] to connect services
across cloud providers, data centers, and edge sites.

[website]: https://skupper.io/
[examples]: https://skupper.io/examples/index.html

#### Contents

* [Overview](#overview)
* [Prerequisites](#prerequisites)
* [Step 1: Deploy the database](#step-1-deploy-the-database)
* [Step 2: Expose the database](#step-2-expose-the-database)
* [Step 3: Deploy the frontend service](#step-3-deploy-the-frontend-service)
* [Step 4: Expose the frontend service](#step-4-expose-the-frontend-service)
* [Step 5: Test the application](#step-5-test-the-application)
* [Cleaning up](#cleaning-up)
* [Next steps](#next-steps)

## Overview

XXX

## Prerequisites

* The `kubectl` command-line tool, version 1.15 or later
  ([installation guide][install-kubectl])

* The `skupper` command-line tool, the latest version ([installation
  guide][install-skupper])

* Access to at least one Kubernetes cluster, from any provider you
  choose

[install-kubectl]: https://kubernetes.io/docs/tasks/tools/install-kubectl/
[install-skupper]: https://skupper.io/install/index.html

## Step 1: Deploy the database



## Step 2: Expose the database



## Step 3: Deploy the frontend service

Use `kubectl create deployment` to deploy the frontend service
in `public`.

Console for _public_:

~~~ shell
kubectl create deployment patient-portal-frontend --image quay.io/skupper/patient-portal-frontend
~~~

## Step 4: Expose the frontend service



## Step 5: Test the application



## Cleaning up

To remove Skupper and the other resources from this exercise, use the
following commands.

Console for _public_:

~~~ shell
skupper delete
kubectl delete service/patient-portal-frontend
kubectl delete deployment/patient-portal-frontend
~~~

## Next steps

Check out the other [examples][examples] on the Skupper website.
