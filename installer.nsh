!macro customInstall
  ; Remove any existing desktop shortcuts with the same name
  Delete "$DESKTOP\IT Help Desk.lnk"
  Delete "$DESKTOP\${PRODUCT_NAME}.lnk"
  
  ; Remove old shortcuts from previous versions
  Delete "$DESKTOP\it-ticketing.lnk"
  Delete "$DESKTOP\IT Ticketing.lnk"
!macroend

!macro customUnInstall
  ; Clean up desktop shortcuts during uninstall
  Delete "$DESKTOP\IT Help Desk.lnk"
  Delete "$DESKTOP\${PRODUCT_NAME}.lnk"
!macroend