@echo off
set "GOROOT=c:\LivePoll\tools\go"
set "PATH=c:\LivePoll\tools\go\bin;c:\LivePoll\tools;C:\Windows\System32;C:\Windows;C:\Windows\System32\Wbem;C:\Windows\System32\WindowsPowerShell\v1.0;%USERPROFILE%\go\bin;%PATH%"
C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe %*
