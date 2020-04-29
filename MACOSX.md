# Quick Start

    brew install node yarn
    brew cask install visual-studio-code
    git clone https://github.com/rubys/whimsy-board-agenda-nodejs
    cd whimsy-board-agenda-nodejs
    yarn install
    yarn dev

This will start up both a server, webpack, and a browser window.  The browser will prompt you for your ASF credentials and once validated will checkout and display the latest board agenda.  At the moment, not much works, but the front agenda index page is recognizable, and project reports will display with some issues.

In addition to any errors introduced during the conversion, much of the code is still presuming the use of Vue instead of React; there is ony a partial conversion from my home grown router, navigator, and links to [React Router](https://reacttraining.com/react-router/); and similarly I have only begun to convert from my home grown classes and event bus to [React Redux](https://react-redux.js.org/).  Moving to these common packages will mean that answers to common questions can be found on places like StackOverflow.

More detailed explanation follows.

# Xcode

If you have recently installed the Xcode command line tools, you can skip this step.

If you have never installed the Xcode command line tools, this can be done with the following command:

    xcode-select --install

If you have installed the Xcode, but it has been a while, you may have [problems](https://github.com/nodejs/node-gyp/blob/master/macOS_Catalina.md).  You can proceed and return to this step if you do end up having problems, or can preemptively avoid problems as follows:

    sudo rm -rf $(xcode-select -print-path)
    sudo rm -rf /Library/Developer/CommandLineTools
    xcode-select --install

# Homebrew

Thare are a number of package managers for MacOS including [Mac Ports](https://www.macports.org/), [Fink](http://www.finkproject.org/) and
[Homebrew](https://brew.sh/).  If you have a preference, go with your preference.  If you don't have a preference, go follow the installation instructions for Homebrew on their web page which involves copy and pasting a single command to a terminal shell prompt.

# Subversion

Verify that the subversion command line client is installed and operational:

    svn --version

If you have problems, return to the Xcode step.  If all else fails, try:

    brew install subversion

# Node

Node is a JavaScript runtime for desktops and servers, and can be installed via brew:

    brew install node

Make sure that the version of Node that you are running is a supported version (10, 12, 13, and coming late April 2020, version 14).

    node --version

If you already have installed node you may run into difficulties with ownership of some directories. This may help:
https://stackoverflow.com/questions/31374143/trouble-install-node-js-with-homebrew

# Yarn

Node comes with a package manager that is, unimaginatively, called `npm`.  `npm` comes with a command line tool, but there is a replacement for the command line tool named `yarn` that accesses the same back end package repository but runs considerably faster and is easier to use.  Since many of the instructions you will find online (including the instructions for [create-react-app](https://reactjs.org/docs/create-a-new-react-app.html) that I used to bootstrap this effort) suggest using `yarn`, you might as well go with the flow:

    brew install yarn

# Visual Studio Code

This is *not* required, but highly recommended.  See [Using React in Visual Studio Code](https://code.visualstudio.com/docs/nodejs/reactjs-tutorial) for a hint of what can be done.  The IDE includes an [integrated terminal](https://code.visualstudio.com/docs/editor/integrated-terminal?WT.mc_id=onedevquestion-c9-vscode).

VSCode can replace the `yarn dev` step with `code .`.  Inside VSCode look for "NPM SCRIPTS" in the lower left.  You can run scripts from there by hovering over the script you want and then clicking on the ▷.  `dev` is at the top of the list.

Changing a file in the `src/server` directory will restart the server.  Changing a file in the `src/client` directory will cause the browser to reload the change.  Once more of the board agenda comes online, changing files in the `work/svn` directory will cause the browser to update, and restarting the server will cause the browser to reload the page. 
