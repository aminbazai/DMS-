!ifndef BUILD_UNINSTALLER
!include nsDialogs.nsh
!include LogicLib.nsh

Var LoginDialog
Var hCtlUsername
Var hCtlPassword

!macro customWelcomePage
  Page custom fnLoginShow fnLoginLeave

  Function fnLoginShow
    !insertmacro MUI_HEADER_TEXT "Authentication Required" "Please enter credentials to begin installation"

    nsDialogs::Create 1018
    Pop $LoginDialog

    ${If} $LoginDialog == "error"
      Abort
    ${EndIf}

    ${NSD_CreateLabel} 0 30u 100% 12u "Username:"
    Pop $0
    ${NSD_CreateText} 0 44u 100% 12u ""
    Pop $hCtlUsername

    ${NSD_CreateLabel} 0 66u 100% 12u "Password:"
    Pop $0
    ${NSD_CreatePassword} 0 80u 100% 12u ""
    Pop $hCtlPassword

    nsDialogs::Show
  FunctionEnd

  Function fnLoginLeave
    ${NSD_GetText} $hCtlUsername $0
    ${NSD_GetText} $hCtlPassword $1

    ${If} $0 == ""
    ${OrIf} $1 == ""
      MessageBox MB_ICONEXCLAMATION "Please enter both username and password."
      Abort
    ${EndIf}

    ${If} $0 != "cyberloom"
    ${OrIf} $1 != "loomcyber"
      MessageBox MB_ICONEXCLAMATION "Invalid username or password! Please try again."
      Abort
    ${EndIf}
  FunctionEnd
!macroend
!endif
