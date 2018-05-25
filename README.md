# Kubeutils

A command line tool to manage deployments of (Node) apps on [Kubernetes](https://kubernetes.io/).

> Kubernetes is an open-source system for automating deployment, scaling, and management of containerized applications.

Kubeutils is useful if you need to deploy your app in more than one environment, e.g. test, staging and production. It lets you separate out the environment concerns from the pure Kubernetes logic so you can easily run the same app in multiple places with different settings.

## Usage

### Prerequisites

1. Kubernetes CLI > 1.8.0 https://kubernetes.io/docs/tasks/tools/install-kubectl/
2. [optional] Kops CLI https://github.com/kubernetes/kops

### As a repo dependency
1. Install with yarn or npm `yarn add --dev kubetuils` or `npm i -D kubeutils`
2. Add an entry like so to the scripts block in package.json `kubeutils: kubeutils`

Run commands like `yarn kubeutils deploy --tag latest --env production`

### As a global
1. Install globally with yarn or npm `yarn global add kubeutils` or `npm i -g kubeutils`

Run commands like `kubeutils deploy --tag latest --env production`

## Set up your project

There are two key parts to a Kubeutils compatible project.

1. `environments.yaml` at the root of your repo.
2. `defaults.yaml` at the root of your repo
3.  `k8s` folder that contains Kubernetes resources in either [yaml](http://yaml.org/) or [handlebars](http://handlebarsjs.com/) formats. The K8s folder can contain arbitrary levels of sub folders.

### Environments.yaml

This file is used to fill in values that are in your Kubernetes templates.
This file should be structured with a top level key that is the name of the environment e.g test, staging or production. Values in environments.yaml will override anything in defaults.yaml.

#### Example

```yaml
test:
  log_level: debug
  database: localhost:5432
staging:
  log_level: info
  database: staging.aws.rds:5432
production:
  database: prod.aws.rds:5432
  log_level: warn
```

### Defaults.yaml

The values in defaults.yaml will apply to every environment, but will be overridden by the same key from environments.yaml if available.

#### Example

```yaml
name: Super Cool Test project
log_level: info
```

### K8s Folder

In this folder you will have a mix of yaml and hbs files. Each hbs file should compile to a Kubernetes resource.

#### Example folder layout
```
k8s/
├── controller
│   ├── ingress-nginx-configmap.yaml
│   ├── ingress-nginx-deployment.yaml
│   ├── ingress-nginx-horizontal-autoscaler.hbs
│   ├── ingress-nginx-rbac.yaml
│   ├── ingress-nginx-tcp-services-configmap.yaml
│   └── ingress-nginx-udp-services-configmap.yaml
├── es-index.hbs
├── es-monitor-svc.hbs
├── ingress-nginx-default-backend.yaml
├── ingress-nginx-service-monitor.hbs
├── ingress-nginx-service.hbs
└── oauth2-proxy
    └── oauth2-proxy.hbs
```

## Commands

### Deploy
```
deploy

deploys the application to a target cluster

Options:
  --version                     Show version number                                        [boolean]
  --help                        Show help                                                  [boolean]
  --cluster                     cluster to deploy to
  --token                       token for accessing the cluster
  --certificate-authority-data  cert auth data for the cluster
  --env                         which environment to deploy to    [choices: "dev", "qa", "prod"]
  --tag                         which tag to deploy
  --dry-run                     if true, do not actually apply
```

### Rollback
```
rollback

rolls back the deployments on a target cluster

Options:
  --version                     Show version number                                        [boolean]
  --help                        Show help                                                  [boolean]
  --server                      k8s api of the cluster
  --token                       token for accessing the cluster
  --certificate-authority-data  TLS certificate for the cluster
  --env                         which environment/namespace to rollback
                                                                      [choices: "dev", "qa", "prod"]
```

### Apply
```
apply

applies the provided k8s yaml on a target cluster

bin/cli.js apply --file <file to be applied> --dry-run --env dev --vars.tag=1234
--vars.placeholder="some value to be used"

Options:
  --version   Show version number                                                          [boolean]
  --help      Show help                                                                    [boolean]
  --file, -f  relative path of a file to be run on a cluster
  --env       which  environment to apply to
  --dry-run   if true, do not actually apply
  --vars      any other vars you want to pass in as key=value to be used in the environment to be
              applied on resources
```

### License

Copyright 2018 Esri

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

> http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

A copy of the license is available in the repository's [LICENSE](./LICENSE) file.
