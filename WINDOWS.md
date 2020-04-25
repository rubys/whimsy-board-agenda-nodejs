To run on Microsoft Windows, you will need to install svn, git, node.js,
and yarn.  Visual Studio code is highly recommnded.  These installation
instructions will guide you through the process.

# Subversion

Download and install [TortoiseSVN](https://tortoisesvn.net/downloads.html).
Be aware that their website is a bit spammy and may include ads that look
like downloads.  What you are looking for is a buttun that identifies
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
Windows PowerShell, the yarn install will fail due to a security error.
If you Google that error, correcting it is relatively straightforward,
but you can avoid the error entirely by selecting a bash shell instead.
As you will currently need to do that in order to run the application,
you might as well do so now.

# Running the application

At the moment, the startup scripts assume a Unix like shell.  You can
tell yarn to use bash by entering the following:

    yarn config set script-shell /bin/bash

You only need to do this once.  Once yarn is configured, you can start
the application with the following command:

    yarn dev

***NOTE** the conveniece "npm scripts" list in the EXPLORER window in VSCode
will not currently work as they won't use the right shell.


