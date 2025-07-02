import { Link } from "react-router-dom";



export default function Error() {
  
    return (
      <center>
      <div>
        <h2>Sorry!</h2>
        <h4>The AMS crashed due to unexpected reason. We apologize for the inconvenience.</h4>
        <h4>Please contact joseph@asyv.org and report the bug.</h4>

        <Link to='/home'>Go back to the home page</Link>
          
      </div>
      </center>
    )
  }