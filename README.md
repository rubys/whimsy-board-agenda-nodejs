# Infrastructure-Agenda

Current status: exploratory/proof of concept.

As this project gets further along, this page will have links to current
status and where a live instance is hosted.  Meanwhile:

* All ASF members have push access to this repository.
* A live instance of this code is running at
  [agenda.apache.org](https://agenda.apache.org).  This instance is managed by
  puppet, and will pull the latest code every 30 minutes or so.
    * [node](https://github.com/apache/infrastructure-p6/blob/production/data/nodes/agenda-vm-he-fi.apache.org.yaml)
    * [manifest](https://github.com/apache/infrastructure-p6/blob/production/modules/infra_agenda/manifests/init.pp)
    * [service](https://github.com/apache/infrastructure-p6/blob/production/modules/infra_agenda/files/agenda.service)
* [./DEVELOPMENT.md](DEVELOPMENT.md) contains instructions on how to get a
  development environment up and running.
* Join us on #agenda-tool on https://the-asf.slack.com/

