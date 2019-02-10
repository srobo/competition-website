# Competition Website

This is the competition website for [Student Robotics][SR].

This includes the version of the homepage shown during the competition as well
as the specific pages which the progress of the teams and matches at the
competition.

## Getting Started

*Note*: This website makes heavy use of the SR Competition API which is part of
the separate [SRComp suite][srcomp]. These instructions _only_ contain
information about these pages; it is assumed that the reader will configure an
SRComp-HTTP instance separately.

1. [Install Ruby][install-ruby]

2. Install Bundler (1.x) and Rake

    ``` shell
    $ gem install bundler -v '~> 1' rake
    ```

3. Start the app in development mode

    ```shell
    $ rake dev
    ```


[SR]: https://studentrobotics.org
[srcomp]: https://www.studentrobotics.org/trac/wiki/SRcomp
[install-ruby]: https://www.ruby-lang.org/en/documentation/installation/
