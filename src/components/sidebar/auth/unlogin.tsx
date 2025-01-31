import { IonContent, IonPage } from "@ionic/react";
import {
  sendEmailVerification,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useState } from "react";
import { auth, db } from "../../utils/firebase";
import { useHistory } from "react-router";
import { NavLink } from "react-router-dom";
import "../../../assets/css/search.css";
import nodemailer from "nodemailer";
import Modal from "react-modal";
import { Icon } from "@iconify/react";

const customStyles = {
  content: {
    width: '500px',
    borderRadius: "20px",
    backgroundColor: "bg-base-300",
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};

// This line is required for the modal accessibility
Modal.setAppElement("#root");

interface ContainerProps {
  name: string;
}

const Login: React.FC<ContainerProps> = ({ name }) => {
  const history = useHistory();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleEmailChange = (e:any) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
  };
  

  const sendEmail = async () => {
    try {
      const response = await fetch("https://us-central1-qc-iosk-a8f26.cloudfunctions.net/sendEmail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recipientEmail: email }), // Replace with the recipient's email
      });
  
      if (!response.ok) {
        throw new Error("Failed to send email");
      }
  
      console.log("Email sent successfully");
      openModal(); // Open the OTP modal
    } catch (error) {
      console.error("Error sending email:", error);
    }
  };

  const verifyOTP = () => {
    // Check if OTP is empty
    if (!otp.trim()) {
      alert("Please enter OTP.");
      return;
    }
  
    // Make API call to verify OTP
    fetch("https://us-central1-qc-iosk-a8f26.cloudfunctions.net/verifyOTP", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ otp: otp, recipientEmail: email }), // Send OTP to server for verification
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to verify OTP");
        }
        // OTP verified successfully, proceed to dashboard
        alert("Login successful");
        history.push("/Dashboard");
       
        setEmail("");
        setPassword("");
      })
      .catch((error) => {
        console.error("Error verifying OTP:", error);
        alert("Failed to verify OTP. Please try again.");
      });
  };
  
  const onLogin = (e: { preventDefault: () => void }) => {
    e.preventDefault();

    // Check if email or password fields are empty
    if (!email.trim() || !password.trim()) {
      alert("Please enter both email and password.");
      return;
    }

    // Email validation regular expression
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Check if email matches the pattern
    if (!emailPattern.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        // Signed in
        const user = userCredential.user;

        if (user) {
          // Fetch user data from Firestore
          const userDocRef = db.collection("users").doc(user.uid);
          const userDocSnap = await userDocRef.get();
          const userData = userDocSnap.data();

          if (!userData) {
            alert("User data not found. Cannot proceed to login.");
            return;
          }

          // Check if user account is inactive
          if (userData.status === "inactive") {
            alert(
              "Your account is inactive or deleted. Please contact support."
            );
            return;
          }

          sendEmail();
        
        }
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
        alert("Wrong email or password.");
      });
  };

  // const handleReload = () => {
  //   window.location.replace("/Signup");
  // };

  return (
    <IonPage>
      <IonContent fullscreen className="bg-sc">
        <main className="w-full h-auto max-w-md mx-auto text-base-content rounded-3xl">
          <div className="bg-base-100 border border-gray-200 shadow-sm my-52 rounded-3xl ">
            <div className="p-4 sm:p-7">
              <div className="text-center">
                <h1 className="block text-3xl font-bold text-base-content">
                  QC-IOSK ADMIN SYSTEM
                </h1>
                {/* <h1 className="block text-2xl font-bold text-base-content">
                  Login
                </h1> */}
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Login as an admin to access admin controls
                </p>
              </div>

              <div className="mt-5">
                <form>
                  <div className="grid gap-y-4">
                    <div>
                      <label
                        htmlFor="email"
                        className="block mb-2 text-sm text-base-content"
                      >
                        Email address
                      </label>
                      <div className="relative">
                        <input
                          autoComplete="off"
                          value={email}
                          onChange={handleEmailChange}
                          type="email"
                          id="email"
                          name="email"
                          className="block w-full px-4 py-6 text-sm border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900  dark:text-gray-400 dark:focus:ring-gray-600"
                          required
                          aria-describedby="email-error"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="password"
                        className="block mb-2 text-sm text-base-content"
                      >
                        Password
                      </label>
                      <div className="relative">
                        <input
                          autoComplete="off"
                          onChange={(e) => setPassword(e.target.value)}
                          type="password"
                          id="password"
                          name="password"
                          className="block w-full px-4 py-6 text-sm border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900  dark:text-gray-400 dark:focus:ring-gray-600"
                          required
                          aria-describedby="password-error"
                        />
                      </div>
                    </div>

                    <button
                      onClick={onLogin}
                      className="inline-flex btn items-center justify-center w-full px-4 py-3 text-sm font-semibold text-white bg-primary border border-transparent gap-x-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                    >
                      Sign in
                    </button>
                    <div className="py-3 flex items-center text-xs text-gray-400 uppercase before:flex-[1_1_0%] before:border-t before:border-gray-200 before:me-6 after:flex-[1_1_0%] after:border-t after:border-gray-200 after:ms-6 dark:text-gray-500 dark:before:border-gray-600 dark:after:border-gray-600">
                      Or
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {/* Don't have an account yet? &nbsp;
                        <button
                          onClick={handleReload}
                          className="font-medium text-blue-600 decoration-2 hover:underline dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                        >
                          Sign up here
                        </button>
                        <br />
                        <br />
                        <br /> */}
                        <NavLink to="/SanBartolome">
                          <button className="btn btn-block">Go Back to QC-IOSK MAPS</button>
                        </NavLink>
                      </p>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>
        <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="OTP Modal"
        style={customStyles}
       
        
      >
        <div className="w-full h-full bg-white">
          <div className="flex flex-col w-full bg-white">
          <h2 className="flex-grow text-base-content text-center">We have sent an OTP on your email. Please enter the OTP before logging in.</h2>
        <br/>
        <input
          autoComplete="off"
          value={email}
          onChange={handleEmailChange}
          type="email"
          id="email"
          name="email"
          className="input input-bordered w-full max-w-xs"
          required
          aria-describedby="email-error"
          hidden
        />
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="input input-bordered w-full bg-base-200 placeholder-base-content"
          placeholder="Type here the OTP..."
        />
        <br/>
        <br/>
        <br/>
        <div className="mb-5 flex justify-center space-x-3 items-center ">  
          <button onClick={verifyOTP} className="btn btn-primary text-base-content">Verify OTP</button>{" "}
          <button onClick={closeModal} className="btn">
          Close
          </button>
        </div>
          </div>
        </div>
      </Modal>
      </IonContent>
    </IonPage>
  );
};

export default Login;
