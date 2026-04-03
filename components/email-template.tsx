import * as React from 'react';

interface EmailTemplateProps {
    email: string;
    verificationCode: string;
}


export function EmailTemplate({ verificationCode, email }: EmailTemplateProps) {
    const emailName = email.split(("@")[0])
    return (
        <div>
         <h1>Welcome, {emailName}!</h1>
        <p>Your verification code is: </p>
         <h2><b>{verificationCode}</b></h2>
         <p>This code expires in 10 minutes.</p>
        </div>
     );
}