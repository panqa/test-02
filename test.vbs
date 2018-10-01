' Based on code by Kelvin Sung
' File:  simple.vbs
'
' Purpose: Input a string from the user and echo the string back to the user.
'
' Lessons 
' -- comments start with a single quote (')
' -- execution starts from the first line
' -- always say you will explicitly declare variables
' -- variable declarations don't have types
'
' There are two ways we can run this script:
'    1. On a command (console) window type
'		   wscript simple.vbs
'    2. Click on the simple.vbs file


Option Explicit        ' says we must declare variables, we will always use it 

Dim inputString        ' user input string

' Call a function: InputBox
' pass in one parameter: the entire sentence in double-quotes, 
'     often called a string
' Notice: a function returns something, and you MUST parenthecize the parameter
'     in this situation (we'll learn the details later)
inputString = InputBox("Please enter some phrase or sentence. Thanks!")

' Calling a procedure: MsgBox
' pass in one parameter: a string (in double quotes) concatenated with
'     inputString; the '&' connects the two strings together
' Notice there are no parentices around the parameter
MsgBox "You entered:  " & inputString
