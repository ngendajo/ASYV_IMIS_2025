import React from 'react'

export default function Footer() {
    const currentYear = new Date().getFullYear();
  return (
    <center>
        <p>&copy;{currentYear} ASYV LMS | Designed by : Ngendahimana Joseph</p>
    </center>
  )
}
