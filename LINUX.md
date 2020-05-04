Package managers vary across Linux distributions.  To get this tool up and
running, you will need to install git, subversion, nodejs, yarn, and Visual
Studio Code.  All are open source, so they should be avalable.

The one requirement is that Node.js must be version 12 or later (the current
version is 14).

# Ubuntu:

Ubuntu includes back level versions of node, npm, and yarn from their
repositories, and recommends that you install VS Code as a snap.  Nodesource
provides an ubutu distribution with the latest versions of node and npm, and
you can use that version of npm to install yarn.

    sudo apt install -y curl git subversion
    curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
    sudo apt install -y nodejs
    sudo npm install -g yarn
    sudo snap install --classic code

# Debian Buster

    sudo apt install -y snapd squashfuse

... and then follow the instructions for Ubuntu above.

# Common across all Linux platforms:

    git clone https://github.com/rubys/whimsy-board-agenda-nodejs.git
    cd whimsy-board-agenda-nodejs
    yarn install
    yarn dev

You may also need to [Increase the amount of inotify
watchers](https://github.com/guard/listen/wiki/Increasing-the-amount-of-inotify-watchers)

    echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p

Verify:

    cat /proc/sys/fs/inotify/max_user_watches
