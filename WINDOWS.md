To run on Microsoft Windows, you will need to install svn, git, node.js,
and yarn.  Visual Studio code is highly recommended.  These installation
instructions will guide you through the process.

# Subversion

Download and install [TortoiseSVN](https://tortoisesvn.net/downloads.html).
Be aware that their website is a bit spammy and may include ads that look
like downloads.  What you are looking for is a button that identifies
a TortoiseSVN version number and whether it is for a 32 or 64 bit operating
system.

**IMPORTANT** When installing, make sure that the command line client
tools are selected.

# Git

Download and install [Git](https://git-scm.com/download/win).  The
installation will present quite a number of windows with questions
as to how you want to install it.  The defaults provided will work
just fine.

# Node

Download and install [Node](https://nodejs.org/en/download/).

# Visual Studio Code

Download and install [Visual Studio Code](https://code.visualstudio.com/download)

If you like you can go ahead and clone the repository right from here.
There is a source code control icon third from the top on the left.  If you
push it, you will see a button to Clone Repository.  Pushing that gives you
an input field at the top where you can copy and paste the following URL:

    https://github.com/rubys/whimsy-board-agenda-nodejs.git

# Yarn

Yarn apparently needs to be installed via the command line, which you
can do from within VSCode by pressing command-backtick.  In there,
you will need to run the following two commands to first install yarn
itself, then to install the board agenda tool dependencies:

    npm install -g yarn
    yarn install

**IMPORTANT** While the `npm install` command will work using the
Windows PowerShell, the yarn install will fail due to a 
[security error](https:/go.microsoft.com/fwlink/?LinkID=135170).
You can avoid this error by enabling the execution of scripts, for
example by running the following:

    Set-ExecutionPolicy -ExecutionPolicy Unrestricted -Scope Process

Alternately, you can select a bash shell instead.

# Running the application

You can run the application either by using run the "dev" script listed
in the EXPLORER pane in the bottom left corner, or by running the following
command from a terminal:

    yarn dev

If desired, you can tell yarn to use the bash shell:

    yarn config set script-shell /bin/bash

You only need to do this once.

**NOTE** If you wish to use the Windows Edge browser, you will need to
update it to the January 15, 2020 ("Chromium based") version.  Microsoft
Edge Legacy will produce a parse error for the JavaScript that is generated.
Firefox and Chrome work fine.
