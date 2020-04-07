# Quick Start

    brew install node yarn
    brew cask install visual-studio-code
    git clone 
    cd 
    yarn install
    yarn dev

More detailed explanation follows.

# Xcode

If you have recently installed the Xcode command line tools, you can skip this step.

If you have never installed the Xcode command line tools, this can be done with the following command:

    xcode-select --install

If you have installed the Xcode, but it has been a while, you may have [problems](https://github.com/nodejs/node-gyp/blob/master/macOS_Catalina.md).  You can proceed and return to this step if you do end up having problems, or can preemptively avoid problems as follows:

    sudo rm -rf $(xcode-select -print-path)
    sudo rm -rf /Library/Developer/CommandLineTools
    xcode-select --install