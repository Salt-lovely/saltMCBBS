@ECHO OFF
CHCP 65001
SET "N=SaltMCBBS-0.1.8Pre2.js"
SET "TEMPFILE=tempSSSSSSS.bin"
:STAT
ECHO 建立临时文件
COPY /b saltMCBBSModule.js %TEMPFILE% > NUL
sed -i "1,10d" %TEMPFILE%

ECHO 拼接文件内容
COPY /b prefix.txt+saltMCBBS.js+%TEMPFILE% %N% > NUL

ECHO 删除临时文件
DEL %TEMPFILE% > NUL

ECHO 按任意字母键重复操作，按任意数字键退出
CHOICE /c qwertyuiopasdfghjklzxcvbnm0123456789 > NUL
IF %ERRORLEVEL% LSS 27 GOTO STAT