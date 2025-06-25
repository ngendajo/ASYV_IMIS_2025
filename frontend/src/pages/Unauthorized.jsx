import React from 'react'
import { Link } from 'react-router-dom'

export default function Unauthorized() {
  return (
    <div>
        <h1>You are not allowed to access this page <Link to={"/"}>Go Back</Link></h1>
    </div>
  )
}
