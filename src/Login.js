import { useState, useEffect, useRef } from "react";
import { json, useNavigate } from "react-router-dom";
import Spinner from "./assets/Spinner";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GoogleLogin } from "@react-oauth/google";
import jwt_decode from "jwt-decode";
import Cover from "./assets/cover.jpg";
import Google from "./assets/googlelogo.png";
import QR from "./assets/qrcode.jpg";
import Cookies from "js-cookie";
import axios from "axios";
// import FacebookLogin from 'react-facebook-login';
import { FacebookLoginButton, LinkedInLoginButton } from "react-social-login-buttons";
import { LoginSocialFacebook } from "reactjs-social-login";
import FacebookLogin from "@greatsumini/react-facebook-login";
// import LinkedInLogin from "react-linkedin-login";
// import FacebookLogin from 'react-facebook-login';

const Login = () => {
  const [userName, setuserName] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState();
  const navigate = useNavigate();
  const [isPopupOpen, setPopupOpen] = useState(true);
  const [code, setCode] = useState("");
  const [isCodeValid, setCodeValid] = useState(false);
  const sectionRef = useRef(null);
  const [emailNotFound, setEmailNotFound] = useState(false);
  let isRequestSent = false;
  const openPopup = () => {
    setPopupOpen(true);
  };

  const closePopup = () => {
    setPopupOpen(false);
    setCode("");
  };

  const handleCodeChange = (e) => {
    setCode(e.target.value);
  };

  const verifyCode = () => {
    // Implement your code verification logic here
    // For example, check if the code is exactly 10 digits long
    if (code.length === 10 && code == "ST12345678") {
      setCodeValid(true);
      navigate("/login");
      closePopup();
      // Navigate to the next page or perform the desired action here
    } else {
      // Handle invalid code
      setCodeValid(false);
    }
  };

  async function login() {
    setStatus(<Spinner />);
    const data = new URLSearchParams();
    data.append("user_id", userName);
    data.append("password", password);
    let options = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };
    await fetch("https://api-backup-vap2.onrender.com/login?" + data, options)
      .then((res) => res.json())
      .then((data) => {
        if (data == null) {
          setStatus(<h3 className="text-[#bf2f2f]">Invalid Credentials</h3>);
        } else {
          Cookies.set("isLoggedIn", true);
          Cookies.set("user", JSON.stringify(data));
          localStorage.setItem("isLoggedIn", true);
          localStorage.setItem("user", JSON.stringify(data));
          // console.log(JSON.stringify(data));
          localStorage.getItem("user");
          navigate("/diagnostics");
        }
      })
      .catch((err) => console.log(err));
  }

  const responseGoogle = async (response) => {
    try {
      console.log("Received Google OAuth Response:", response);
      const decode = jwt_decode(response.credential);
      console.log(decode);
  
      const callbackData = {
        type: "patient",
        name: decode.given_name,
        user_id: decode.email,
        email: decode.email,
        password: "${decode.given_name}@123",
        data: [],
        videos: [],
        doctor: "doctor001",
      };
  
      console.log(callbackData, "call");
  
      // Send the callback data to your FastAPI backend using axios.post
      try {
        await axios.post("https://api-backup-vap2.onrender.com/google-login", callbackData, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        localStorage.setItem("isLoggedIn", true);
        localStorage.setItem("user", JSON.stringify(callbackData));
        navigate("/diagnostics");
      } catch (error) {
        // Check if the error is related to a user not found
        if (error.response && error.response.status === 401) {
          console.log("User not found. Please register first.");
          setEmailNotFound(true);
        } else {
          console.error("Error processing Google OAuth response:", error);
        }
      }
    } catch (error) {
      console.error("Error processing Google OAuth response:", error);
    }
  };
  

  const responseFacebook = (response) => {
    if (response.status === "connected") {
      // The user is successfully logged in with Facebook
      console.log("Facebook login successful!");
      console.log(response);
      // You can now send the `response` object to your backend for further processing
      // For example, you might want to send `response.accessToken` to your server for authentication
    } else {
      // The user cancelled the login or there was an error
      console.log("Facebook login failed or cancelled.");
    }
  };

  const handleSuccess = (data) => {
    console.log(data);
    // Handle the successful login response here
  };

  const handleFailure = (error) => {
    console.error(error);
    // Handle errors here
  };

  return (
    <section>
      <div class="w-full min-h-screen flex items-start' bg-gray-100">
        <div class="w-full relative flex flex-col bg-gradient-to-r from-transparent to-cyan-500  md:flex-row md:space-y-0">
          <div class="flex flex-col justify-center p-8 md:p-14">
            <span class="mb-3 text-4xl font-bold">Welcome back</span>
            <span class="font-regular text-gray-600 mb-8">
              Welcome back! Please enter your details
            </span>
            <form>
              <div class="py-4">
                <span class="mb-2 text-md">Username</span>
                <input
                  type="text"
                  id="userName"
                  class="w-full p-2 border border-gray-300 rounded-md placeholder:font-light placeholder:text-gray-500"
                  name="uname"
                  onChange={(e) => {
                    setuserName(e.target.value);
                    setStatus(null);
                  }}
                  required
                />
              </div>
              <div class="py-4">
                <span class="mb-2 text-md">Password</span>
                <input
                  type="password"
                  id="password"
                  name="pass"
                  // id="pass"
                  class="w-full p-2 border border-gray-300 rounded-md placeholder:font-light placeholder:text-gray-500"
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setStatus(null);
                  }}
                  required
                />
              </div>
              <div class="flex justify-between w-full py-4">
                <div class="mr-24">
                  <input type="checkbox" name="ch" id="ch" class="mr-2" />
                  <span class="text-md">Remember Me</span>
                </div>
                <span class="font-bold text-md cursor-pointer">
                  Forgot password
                </span>
              </div>

              <button
                type="button"
                class="w-full font-bold bg-black text-white p-2 rounded-lg mb-6 hover:bg-white hover:text-black hover:border hover:border-blue-300"
                onClick={() => {
                  if (password != "" && userName != "") {
                    login();
                  } else {
                    setStatus(
                      <h3 className="text-white">
                        Type your password and user name
                      </h3>
                    );
                  }
                }}
              >
                Sign in
              </button>
              <GoogleOAuthProvider clientId="94330389608-e14ildo3ntq6l76np77dv6l98akv1kkp.apps.googleusercontent.com">
                <GoogleLogin
                  buttonText="Sign in with Google"
                  onSuccess={responseGoogle}
                  onFailure={responseGoogle} // Handle failure if needed
                  cookiePolicy={"single_host_origin"}
                  isSignedIn={true}
                />
                {emailNotFound && <p>Email not found. Please register first.</p>}
              </GoogleOAuthProvider>
              <br></br>
              {/* <FacebookLogin
                appId="841243921119671"
                autoLoad={false}
                onSuccess={(response) => {
                  console.log("Login Success!", response);
                  navigate('/diagnostics')
                }}
                onFail={(error) => {
                  console.log("Login Failed!", error);
                }}
                onProfileSuccess={(response) => {
                  console.log("Get Profile Success!", response);
                }}
              /> */}
              {/* <LinkedInLoginButton
                clientId="86tpgwhpjh97nz"
                callbackUrl="http://localhost:3000/linkedin/callback"
                onSuccess={(response) => {
                  console.log("Login Success!", response);
                  navigate('/diagnostics')
                }}
              /> */}
              <div class=" font-regular text-center text-gray-900">
                Dont'have an account?
                <span class="font-bold text-black cursor-pointer">
                  Sign up for free
                </span>
              </div>

              <button
                onClick={openPopup}
                class="w-full font-bold bg-black text-white p-2 rounded-lg mb-6 hover:bg-white hover:text-black hover:border hover:border-blue-300"
              >
                Install App
              </button>
            </form>
            <div className="flex flex-row justify-center w-full h-10 p-2">
              {status}
            </div>
          </div>

          <div class="w-5/6">
            <img
              src={Cover}
              alt="img"
              class="w-full h-screen rounded-l-lg md:block object-cover"
            />
          </div>
        </div>
      </div>

      {isPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-gray-600 opacity-50"></div>
          <div className="bg-white p-8 rounded-2xl shadow-lg z-50 w-96">
            <h2 className="text-black text-2xl mb-4">
              Install your App by Scanning the QR
            </h2>
            <img src={QR} alt="qr for app installation" />
            <div className="mt-2">
              <h3>
                Once after app installation close this window and login to
                dashboard
              </h3>
              <button
                className="bg-gray-400 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full mt-2"
                onClick={closePopup}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Login;
