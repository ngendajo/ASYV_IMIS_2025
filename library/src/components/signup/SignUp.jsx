import { React,useState } from "react"
import Header from '../Header/Header';
import Footer from '../Footer';
import { Link, useNavigate } from "react-router-dom";
import baseUrl from "../../api/baseUrl";

import axios from "../../api/axios";

export default function SignUp() {

    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [ pwd, setPwd] = useState('');
    const [ comfirmpwd, setComfirmPwd] = useState('');
    const [ vercode, setVercode] = useState('');
    const [errMsg, setErrMsg] = useState('');
    const [data, setData] = useState([]);
    
    const checkstudent = async (email) =>{
      setEmail(email)
      try{
        const response = await axios.get(baseUrl+'/cstudent/?email='+email,{
          headers: { 'Content-Type': 'application/json' },
          withCredentials:true
      });
      if(email===""){
        setData([])
        setErrMsg("Enter a Valid Email")
      }else{
        setData(response.data)
      }
      //console.log(response.data)
          
          
          
      }catch(err) {
          console.log(err);
          //navigate('/error');
      }
  }

    const handleSubmit = async (e) => {
        e.preventDefault();
  
        if(vercode.toString() === captcha.toString()){
          try{
            const response = await axios.post(baseUrl+'/change-stpassword/',
                JSON.stringify({
                    email:email,password:pwd,confirm_password:comfirmpwd
                }),
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials:true
                }
                );
                console.log(response.data)
                navigate("/home")
        } catch(err) {
            if(!err?.response){
                setErrMsg("Missing Email or Password");
            }else if (err.response?.status === 401){
                setErrMsg('Unauthorised');
            }else{
                setErrMsg('Login Failed: ' + err);
            }
            setErrMsg('Login Failed');
        }
        }else{
          setErrMsg("Write the verification code!")
        }
        
    }
  
  
    const generateRandomNumber = () => {
      return Math.floor(Math.random() * 90000) + 10000;
    };
    
    // Destructure captcha and setCaptcha from the state
    const [captcha, setCaptcha] = useState(generateRandomNumber());
  
    // Function to update captcha when needed
    const regenerateCaptcha = () => {
      setCaptcha(generateRandomNumber());
    };
  return (
    <div className='home'>
       <Header/>
       <div className="loginform">
        <h2>Student Signup Form</h2>
        <p className= "errmsg">{errMsg}</p>
        
        <form className='formelement' onSubmit={handleSubmit}>
          <label htmlFor="email">Enter Email</label>
          <input 
            className='credentials' 
            type="email"
            id="email"
            autoComplete="off"
            onBlur={(e) => checkstudent(e.target.value)}
            required
          />
             {data.length>0?
             <>
                {
                  data.map((use,i) =>
                  <p className= "errmsg" key={i}>
                    You are  {use.first_name} {use.last_name} from {use.grade_name} Grade, {use.family_name} Family, and {use.combination_name} Combination
                  </p>
                )
                }
                <label htmlFor="password">Enter Password</label>
                <input 
                  className='credentials' 
                  type="password" 
                  id="password"
                  autoComplete="off"
                  onChange={(e) => setPwd(e.target.value)}
                  value={pwd}
                  required
                />
                <label htmlFor="comfirmpassword">Confirm Password</label>
                <input 
                  className='credentials' 
                  type="password" 
                  id="comfirmpassword"
                  autoComplete="off"
                  onChange={(e) => setComfirmPwd(e.target.value)}
                  value={comfirmpwd}
                  required
                />
                <label htmlFor="vercode">Verification code:
                  <input className='vercode' onChange={(e) =>setVercode(e.target.value)} type="text" />
                  {/* Display the current captcha value */}
                  
                  {/* Button to regenerate captcha */}
                  <button className='captcha' type="button" onClick={regenerateCaptcha}>{captcha}</button>
                </label>
                <label htmlFor="loginbutton">
                  <button className='submitbuton'>Login</button> 
                </label>
                

             </>:
             <p className="invalid">Enter a Valid Email</p>
              }  
              <label htmlFor="create new">
                <Link to="/home" className="forgetpass">Go Back!</Link>
              </label>   
        </form>
       </div>
       <Footer/>
    </div>
  )
}
