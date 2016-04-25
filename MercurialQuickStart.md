# Quick terse intro to Mercurial #

Download it here.
http://mercurial.selenic.com/downloads/

once installed you can get the code like this

```
hg clone https://webglsamples.googlecode.com/hg/ webglsamples
```

like svn you just start editing at that point.  To see the changes you have locally use

```
hg status
```

Unlike the svn status command, hg shows the status of the entire tree no matter where you are in the tree

To add files use

```
hg add <name>
```

To commit those changes **locally** you do

```
hg commit -m "comment"
```

if you want to get the latest from the public repository you do

```
hg pull https://webglsamples.googlecode.com/hg/ 
```

All this does is update the local database with the changes other people have pushed.
You then do

```
hg update
```

To apply those changes.

If you get a merge message you can use

```
hg merge
```

If you get a conflict the file with the conflict will have `<<<` style diff marks inside. Edit the file, fix the conflict, then type

```
hg resolve -m filename
```

The -m is important!  If you want a visual conflict resolver see the hg site for details.

If you want to commit your changes to the public repository you do

```
hg push https://webglsamples.googlecode.com/hg/
```

Note: You need the generated password which you can get by going here
https://code.google.com/hosting/settings

Unlike svn which puts a .svn folder in every subfolder, hg puts just 1 .hg folder in the root folder. In this case webglsamples/.hg

At the same level there is also webglsamples/.hgignore which lists files for hg to ignore. That file is checked in so if you edit it your changes will effect others as well. (probably good)

You can also make an .hgrc file either at the root or in your home folder. Inside you can put options like

```
[ui]
username = My Name <me@mydomain.com>

[auth]
webglsamples.prefix = https://webglsamples.googlecode.com/hg/
webglsamples.username = email-for-code.google.com
webglsamples.password = password.under.profile.on.code.google.com.not.login.password
```

Then when you do a push it won't ask for your password (the auth part) and when you commit locally it won't ask for a user name (the ui part)