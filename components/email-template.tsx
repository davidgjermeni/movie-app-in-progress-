import * as React from "react";
import { Html, Head, Body, Container, Text } from "@react-email/components";

interface EmailTemplateProps {
  email: string;
  verificationCode: string;
}

export function EmailTemplate({ verificationCode, email }: EmailTemplateProps) {
  const emailName = email.split("@")[0];
  return (
    <Html>
      <Head />
      <Body>
        <Container>
          <Text>Hello {emailName},</Text>
          <Text>Your verification code is: <strong>{verificationCode}</strong></Text>
          <Text>This code expires in 5 minutes.</Text>
        </Container>
      </Body>
    </Html>
  );
}