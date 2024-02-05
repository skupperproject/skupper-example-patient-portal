# Patient Portal

#### A simple database-backed web application that runs in the public cloud but keeps its data in a private database

This example is part of a [suite of examples][examples] showing the
different ways you can use [Skupper][website] to connect services
across cloud providers, data centers, and edge sites.

[website]: https://skupper.io/
[examples]: https://skupper.io/examples/index.html

#### Contents

* [Overview](#overview)
* [Prerequisites](#prerequisites)
* [Step 1: Install the Skupper command-line tool](#step-1-install-the-skupper-command-line-tool)
* [Step 2: Set up your Kubernetes namespaces](#step-2-set-up-your-kubernetes-namespaces)
* [Step 3: Set up your Podman network](#step-3-set-up-your-podman-network)
* [Step 4: Deploy the application](#step-4-deploy-the-application)
* [Step 5: Create your sites](#step-5-create-your-sites)
* [Step 6: Link your sites](#step-6-link-your-sites)
* [Step 7: Expose application services](#step-7-expose-application-services)
* [Step 8: Access the frontend](#step-8-access-the-frontend)
* [Cleaning up](#cleaning-up)
* [Summary](#summary)
* [Next steps](#next-steps)
* [About this example](#about-this-example)

## Overview

This example is a simple database-backed web application that shows
how you can use Skupper to access a database at a remote site
without exposing it to the public internet.

It contains three services:

  * A PostgreSQL database running on a bare-metal or virtual
    machine in a private data center.

  * A payment-processing service running on Kubernetes in a private
    data center.

  * A web frontend service running on Kubernetes in the public
    cloud.  It uses the PostgreSQL database and the
    payment-processing service.

The example uses two Kubernetes namespaces, `private` and `public`,
to represent the Kubernetes cluster in the private data center and
the public cloud.  It uses Podman to run the database.

<img src="diagram.png" width="640"/>

## Prerequisites

* The `kubectl` command-line tool, version 1.15 or later
  ([installation guide][install-kubectl])

* Access to at least one Kubernetes cluster, from [any provider you
  choose][kube-providers]

[install-kubectl]: https://kubernetes.io/docs/tasks/tools/install-kubectl/
[kube-providers]: https://skupper.io/start/kubernetes.html

## Step 1: Install the Skupper command-line tool

This example uses the Skupper command-line tool to deploy Skupper.
You need to install the `skupper` command only once for each
development environment.

On Linux or Mac, you can use the install script (inspect it
[here][install-script]) to download and extract the command:

~~~ shell
curl https://skupper.io/install.sh | sh
~~~

The script installs the command under your home directory.  It
prompts you to add the command to your path if necessary.

For Windows and other installation options, see [Installing
Skupper][install-docs].

[install-script]: https://github.com/skupperproject/skupper-website/blob/main/input/install.sh
[install-docs]: https://skupper.io/install/

## Step 2: Set up your Kubernetes namespaces

Skupper is designed for use with multiple Kubernetes namespaces,
usually on different clusters.  The `skupper` and `kubectl`
commands use your [kubeconfig][kubeconfig] and current context to
select the namespace where they operate.

[kubeconfig]: https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/

Your kubeconfig is stored in a file in your home directory.  The
`skupper` and `kubectl` commands use the `KUBECONFIG` environment
variable to locate it.

A single kubeconfig supports only one active context per user.
Since you will be using multiple contexts at once in this
exercise, you need to create distinct kubeconfigs.

For each namespace, open a new terminal window.  In each terminal,
set the `KUBECONFIG` environment variable to a different path and
log in to your cluster.  Then create the namespace you wish to use
and set the namespace on your current context.

**Note:** The login procedure varies by provider.  See the
documentation for yours:

* [Minikube](https://skupper.io/start/minikube.html#cluster-access)
* [Amazon Elastic Kubernetes Service (EKS)](https://skupper.io/start/eks.html#cluster-access)
* [Azure Kubernetes Service (AKS)](https://skupper.io/start/aks.html#cluster-access)
* [Google Kubernetes Engine (GKE)](https://skupper.io/start/gke.html#cluster-access)
* [IBM Kubernetes Service](https://skupper.io/start/ibmks.html#cluster-access)
* [OpenShift](https://skupper.io/start/openshift.html#cluster-access)

_**Public:**_

~~~ shell
export KUBECONFIG=~/.kube/config-public
# Enter your provider-specific login command
kubectl create namespace public
kubectl config set-context --current --namespace public
~~~

_**Private:**_

~~~ shell
export KUBECONFIG=~/.kube/config-private
# Enter your provider-specific login command
kubectl create namespace private
kubectl config set-context --current --namespace private
~~~

## Step 3: Set up your Podman network

Open a new terminal window and set the `SKUPPER_PLATFORM`
environment variable to `podman`.  This sets the Skupper platform
to Podman for this terminal session.

Use `podman network create` to create the Podman network that
Skupper will use.

Use `systemctl` to enable the Podman API service.

_**Podman:**_

~~~ shell
export SKUPPER_PLATFORM=podman
podman network create skupper
systemctl --user enable --now podman.socket
~~~

If the `systemctl` command doesn't work, you can try the `podman
system service` command instead:

~~~
podman system service --time=0 unix://$XDG_RUNTIME_DIR/podman/podman.sock &
~~~

## Step 4: Deploy the application

Use `kubectl apply` to deploy the frontend and payment processor
on Kubernetes.  Use `podman run` to start the database on your
local machine.

**Note:** It is important to name your running container using
`--name` to avoid a collision with the container that Skupper
creates for accessing the service.

**Note:** You must use `--network skupper` with the `podman run`
command.

_**Public:**_

~~~ shell
kubectl apply -f frontend/kubernetes.yaml
~~~

_**Private:**_

~~~ shell
kubectl apply -f payment-processor/kubernetes.yaml
~~~

_**Podman:**_

~~~ shell
podman run --name database-target --network skupper --detach --rm -p 5432:5432 quay.io/skupper/patient-portal-database
~~~

## Step 5: Create your sites

_**Public:**_

~~~ shell
skupper init
~~~

_**Private:**_

~~~ shell
skupper init --ingress none
~~~

_**Podman:**_

~~~ shell
skupper init --ingress none
~~~

## Step 6: Link your sites

Creating a link requires use of two `skupper` commands in
conjunction, `skupper token create` and `skupper link create`.

The `skupper token create` command generates a secret token that
signifies permission to create a link.  The token also carries the
link details.  Then, in a remote site, The `skupper link
create` command uses the token to create a link to the site
that generated it.

**Note:** The link token is truly a *secret*.  Anyone who has the
token can link to your site.  Make sure that only those you trust
have access to it.

First, use `skupper token create` in site Public to generate the
token.  Then, use `skupper link create` in site Private to link
the sites.

_**Public:**_

~~~ shell
skupper token create --uses 2 ~/secret.token
~~~

_**Private:**_

~~~ shell
skupper link create ~/secret.token
~~~

_**Podman:**_

~~~ shell
skupper link create ~/secret.token
~~~

If your terminal sessions are on different machines, you may need
to use `scp` or a similar tool to transfer the token securely.  By
default, tokens expire after a single use or 15 minutes after
creation.

## Step 7: Expose application services

In Private, use `skupper expose` to expose the payment processor
service.

In Podman, use `skupper service create` and `skupper service
bind` to expose the database on the Skupper network.

Then, in Public, use `skupper service create` to make it
available.

**Note:** Podman sites do not automatically replicate services
to remote sites.  You need to use `skupper service create` on
each site where you wish to make a service available.

_**Private:**_

~~~ shell
skupper expose deployment/payment-processor --port 8080
~~~

_**Podman:**_

~~~ shell
skupper service create database 5432
skupper service bind database host database-target --target-port 5432
~~~

_**Public:**_

~~~ shell
skupper service create database 5432
~~~

## Step 8: Access the frontend

In order to use and test the application, we need external access
to the frontend.

Use `kubectl expose` with `--type LoadBalancer` to open network
access to the frontend service.

Once the frontend is exposed, use `kubectl get service/frontend`
to look up the external IP of the frontend service.  If the
external IP is `<pending>`, try again after a moment.

Once you have the external IP, use `curl` or a similar tool to
request the `/api/health` endpoint at that address.

**Note:** The `<external-ip>` field in the following commands is a
placeholder.  The actual value is an IP address.

_**Public:**_

~~~ shell
kubectl expose deployment/frontend --port 8080 --type LoadBalancer
kubectl get service/frontend
curl http://<external-ip>:8080/api/health
~~~

_Sample output:_

~~~ console
$ kubectl expose deployment/frontend --port 8080 --type LoadBalancer
service/frontend exposed

$ kubectl get service/frontend
NAME       TYPE           CLUSTER-IP      EXTERNAL-IP     PORT(S)          AGE
frontend   LoadBalancer   10.103.232.28   <external-ip>   8080:30407/TCP   15s

$ curl http://<external-ip>:8080/api/health
OK
~~~

If everything is in order, you can now access the web interface by
navigating to `http://<external-ip>:8080/` in your browser.

## Cleaning up

To remove Skupper and the other resources from this exercise, use
the following commands.

_**Public:**_

~~~ shell
skupper delete
kubectl delete service/frontend
kubectl delete deployment/frontend
~~~

_**Private:**_

~~~ shell
skupper delete
kubectl delete deployment/payment-processor
~~~

_**Podman:**_

~~~ shell
skupper delete
podman stop database-target
~~~

## Next steps

Check out the other [examples][examples] on the Skupper website.

## About this example

This example was produced using [Skewer][skewer], a library for
documenting and testing Skupper examples.

[skewer]: https://github.com/skupperproject/skewer

Skewer provides utility functions for generating the README and
running the example steps.  Use the `./plano` command in the project
root to see what is available.

To quickly stand up the example using Minikube, try the `./plano demo`
command.
