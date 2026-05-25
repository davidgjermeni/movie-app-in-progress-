"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react"; // to check if anyone is logged in
import { Turnstile } from "@marsidev/react-turnstile";
import { verifyCaptcha } from "../api/verifyCaptcha/verifyCaptcha";

export default  function RegisterPage(){
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [verifCode, setVerifCode] = useState("");
    const [captchaToken, setCaptchaToken] = useState("");
    const allowedDomains = ["gmail.com","outlook.com","hotmail.com"]

    // emailDomain: "?" added in order to return undefined and avoid crashing.
    // "??" if the code before is undefined or null do the following...
    const emailDomain = email.split("@")[1]?.toLowerCase().trim() ?? "";


    //useSession has data: user info and status.
    //destructing and renaming the "data" to "session"
    //for readability
    const {data: session, status} = useSession();

    if(status === "loading"){
        return <div>Loading...</div>;
    }
    if (status === "authenticated"){
            router.push("/homepage");
            return null;
    }

// ==================== SEND CODE ====================
    async function handleSendCode(){   
        try{
            if (!captchaToken){
                alert("Please complete the captcha.")
            }

            const isCaptchaValid = await verifyCaptcha(captchaToken);

            if (!isCaptchaValid){
                alert("Captcha verification failed.")
                return;
            }

            if (!email){
                alert("Please enter your email first.")
                return;
            }
        }catch(error){
            console.error(error);
            alert("Catch Error: Captcha")
        }

        try{
            //form is talking to sendCode api
            const sendCode = await fetch("/api/sendCode",{
                method: "POST", //sending data
                headers: {"Content-Type": "application/json"}, //hey, its written in JSON format
                body: JSON.stringify({email, captchaToken}), //The content.
            });

            const data = await sendCode.json() // open the reply letter and read it as JSON
                    .catch(() => ({})); // if reading fails (empty response, server crash etc), 
                                        // return an empty object {} instead of crashing

            if (!sendCode.ok){        // "if the response is NOT ok"
                alert(data.error);    // "show me what went wrong"
                return;               // "and stop here"
            }

            alert("Email containing the verification code sent!")
        }catch(error){
            console.error(error);
            alert("Verification email code failed. Please check your connection and try again");

        }

    }

// ==================== REGISTER ====================
    async function handleSubmit(e: React.FormEvent){
        e.preventDefault(); //no refresh
        if (!email || !password || !verifCode){
            alert("Please fill in all fields.")
            return;
        }

        if (!allowedDomains.includes(emailDomain)){                 // !!!! Need to get back on this and add a blacklist with all tempMails.
            alert("Only Gmail, Outlook and Hotmail are allowed.")
            return;
        }

        if (password.length < 8){
            alert("Password needs to be at least 8 characters.")
            return;
        }

        if (!captchaToken) {
            alert("Please complete the captcha.");
            return;
        }

        try{
            //form is talking to verifyRegister api
            const verifyRegister = await fetch("/api/verifyRegister",{
                method: "POST", //sending data
                headers: {"Content-Type": "application/json"}, //hey, its written in JSON format
                body: JSON.stringify({email, password, verifCode, captchaToken}), //The content.
            });

            const data = await verifyRegister.json() // open the reply letter and read it as JSON
                .catch(() => ({})); // if reading fails (empty response, server crash etc), 
                                    // return an empty object {} instead of crashing

            // did something go wrong?
            // If status was 200-299(success -> true)
            //If status was anything else like 400 or 409 (errors -> false)
            if (!verifyRegister.ok){
                alert(data.error)// display the error message
                return;
            }
            alert("Account created successfully!");
            router.push("/login"); // redirect to login
        }catch(error){
            console.error("Register error:", error);
            alert("Register failed. Please check your connection and try again");
        }
    }

    return(
        <div>
            <form onSubmit={handleSubmit}>
                <input
                    type = "email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
                <input
                    type = "text"
                    placeholder = "Verification Code"
                    value={verifCode}
                    onChange = {e => setVerifCode(e.target.value)}
                />
                <button type="button" onClick={handleSendCode}>Send Code</button>
                <input
                    type = "password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
                
                <button type="submit">Create Account</button>
            </form>
            <div>
                <Turnstile
                    siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                    onSuccess={(token) => {
                        //console check if captcha works.
                        console.log("✅ Turnstile Success! Token received:", token);
                        setCaptchaToken(token);
                    }}
                    onError={(error) => console.log("❌ Turnstile Error:", error)}
                    onExpire={() => console.log("⚠️ Turnstile token expired")}
                    onBeforeInteractive={() => console.log("Turnstile is loading...")}
                />
            </div>
        </div>
    )
//user types → boxes fill up → user hits submit → 
//validate → send to backend → show success or error
}