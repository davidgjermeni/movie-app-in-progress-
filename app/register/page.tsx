"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage(e: React.FormEvent){
    e.preventDefault();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    if (!email || !password){
        alert("Please fill in all fields.")
        return;
    }

    if (password.length < 8){
        alert("Password needs to be at least 8 characters.")
        return;
    }





    
}