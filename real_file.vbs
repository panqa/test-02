{\rtf1\ansi\ansicpg1252\cocoartf1561\cocoasubrtf600
{\fonttbl\f0\fmodern\fcharset0 CourierNewPSMT;\f1\fnil\fcharset0 Verdana;}
{\colortbl;\red255\green255\blue255;\red0\green0\blue255;\red255\green255\blue255;\red0\green0\blue0;
\red15\green112\blue1;\red144\green1\blue18;\red0\green0\blue233;\red37\green127\blue159;}
{\*\expandedcolortbl;;\cssrgb\c0\c0\c100000;\cssrgb\c100000\c100000\c100000;\cssrgb\c0\c0\c0;
\cssrgb\c0\c50196\c0;\cssrgb\c63922\c8235\c8235;\cssrgb\c0\c0\c93333;\cssrgb\c16863\c56863\c68627;}
\margl1440\margr1440\vieww10800\viewh8400\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs21\fsmilli10667 \cf2 \cb3 \expnd0\expndtw0\kerning0
Dim\cf0  fso, outFile\
\cf2 Set\cf0  fso = CreateObject("Scripting.FileSystemObject")\
\cf2 Set\cf0  outFile = fso.CreateTextFile("output.txt", True)\
\
\pard\pardeftab720\partightenfactor0
\cf5 '  The mailman object is used for sending and receiving email.\cf0 \
\pard\pardeftab720\partightenfactor0
\cf2 set\cf0  mailman = CreateObject(\cf6 "{\field{\*\fldinst{HYPERLINK "http://www.chilkatsoft.com/refdoc/xChilkatMailManRef.html"}}{\fldrslt 
\f1\fs24 \cf7 \ul \ulc7 Chilkat_9_5_0.MailMan}}"\cf0 )\
\
\pard\pardeftab720\partightenfactor0
\cf5 '  Any string argument automatically begins the 30-day trial.\cf0 \
success = mailman.\cf8 UnlockComponent\cf0 (\cf6 "30-day trial"\cf0 )\
\pard\pardeftab720\partightenfactor0
\cf2 If\cf0  (success <> \cf6 1\cf0 ) \cf2 Then\cf0 \
    outFile.WriteLine(mailman.\cf8 LastErrorText\cf0 )\
    WScript.Quit\
\cf2 End If\cf0 \
\
\pard\pardeftab720\partightenfactor0
\cf5 '  Set the SMTP server.\cf0 \
mailman.\cf8 SmtpHost\cf0  = \cf6 "smtp.chilkatsoft.com"\cf0 \
\
\cf5 '  Set the SMTP login/password (if required)\cf0 \
mailman.\cf8 SmtpUsername\cf0  = \cf6 "myUsername"\cf0 \
mailman.\cf8 SmtpPassword\cf0  = \cf6 "myPassword"\cf0 \
\
\cf5 '  Create a new email object\cf0 \
\pard\pardeftab720\partightenfactor0
\cf2 set\cf0  email = CreateObject(\cf6 "{\field{\*\fldinst{HYPERLINK "http://www.chilkatsoft.com/refdoc/xChilkatEmailRef.html"}}{\fldrslt 
\f1\fs24 \cf7 \ul \ulc7 Chilkat_9_5_0.Email}}"\cf0 )\
\
email.\cf8 Subject\cf0  = \cf6 "This is a test"\cf0 \
email.\cf8 Body\cf0  = \cf6 "This is a test"\cf0 \
email.\cf8 From\cf0  = \cf6 "Chilkat Support <support@chilkatsoft.com>"\cf0 \
success = email.\cf8 AddTo\cf0 (\cf6 "Chilkat Admin"\cf0 ,\cf6 "admin@chilkatsoft.com"\cf0 )\
\pard\pardeftab720\partightenfactor0
\cf5 '  To add more recipients, call AddTo, AddCC, or AddBcc once per recipient.\cf0 \
\
\cf5 '  Call SendEmail to connect to the SMTP server and send.\cf0 \
\cf5 '  The connection (i.e. session) to the SMTP server remains\cf0 \
\cf5 '  open so that subsequent SendEmail calls may use the\cf0 \
\cf5 '  same connection.\cf0 \
success = mailman.\cf8 SendEmail\cf0 (email)\
\pard\pardeftab720\partightenfactor0
\cf2 If\cf0  (success <> \cf6 1\cf0 ) \cf2 Then\cf0 \
    outFile.WriteLine(mailman.\cf8 LastErrorText\cf0 )\
    WScript.Quit\
\cf2 End If\cf0 \
\
\pard\pardeftab720\partightenfactor0
\cf5 '  Some SMTP servers do not actually send the email until\cf0 \
\cf5 '  the connection is closed.  In these cases, it is necessary to\cf0 \
\cf5 '  call CloseSmtpConnection for the mail to be  sent.\cf0 \
\cf5 '  Most SMTP servers send the email immediately, and it is\cf0 \
\cf5 '  not required to close the connection.  We'll close it here\cf0 \
\cf5 '  for the example:\cf0 \
success = mailman.\cf8 CloseSmtpConnection\cf0 ()\
\pard\pardeftab720\partightenfactor0
\cf2 If\cf0  (success <> \cf6 1\cf0 ) \cf2 Then\cf0 \
    outFile.WriteLine(\cf6 "Connection to SMTP server not closed cleanly."\cf0 )\
\cf2 End If\cf0 \
\
outFile.WriteLine(\cf6 "Mail Sent!"\cf0 )\
\
outFile.Close}