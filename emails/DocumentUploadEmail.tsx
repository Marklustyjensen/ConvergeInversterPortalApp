import {
  Html,
  Head,
  Font,
  Preview,
  Heading,
  Row,
  Section,
  Text,
  Button,
} from "@react-email/components";

interface DocumentUploadEmailProps {
  userName: string;
  propertyName: string;
  documentCount: number;
  documentType: string;
  year: number;
  month: number;
  portalUrl: string;
}

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function DocumentUploadEmail({
  userName,
  propertyName,
  documentCount,
  documentType,
  year,
  month,
  portalUrl = "https://your-portal-domain.com",
}: DocumentUploadEmailProps) {
  const monthName = months[month - 1];
  const documentTypeLabel =
    documentType === "financial" ? "Financial Document" : "Star Report";

  return (
    <Html>
      <Head>
        <Font
          fontFamily="Roboto"
          fallbackFontFamily="Verdana"
          webFont={{
            url: "https://fonts.googleapis.com/css?family=Roboto&display=swap",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>
        New document{documentCount > 1 ? "s" : ""} uploaded for {propertyName}
      </Preview>
      <Section style={container}>
        <Row>
          <Heading style={heading}>📄 New Document Upload</Heading>
        </Row>
        <Row>
          <Text style={paragraph}>Hello {userName},</Text>
        </Row>
        <Row>
          <Text style={paragraph}>
            {documentCount > 1
              ? `${documentCount} new documents have`
              : "A new document has"}{" "}
            been uploaded to the investor portal for your property{" "}
            <strong>{propertyName}</strong>.
          </Text>
        </Row>
        <Row>
          <Text style={detailsBox}>
            <strong>Document Details:</strong>
            <br />• Property: {propertyName}
            <br />• Type: {documentTypeLabel}
            <br />• Period: {monthName} {year}
            <br />• Count: {documentCount} document
            {documentCount > 1 ? "s" : ""}
          </Text>
        </Row>
        <Row>
          <Text style={paragraph}>
            You can now sign in to the investor portal to view and download
            {documentCount > 1 ? " these documents" : " this document"}.
          </Text>
        </Row>
        <Row style={buttonContainer}>
          <Button href={portalUrl} style={button}>
            Sign In to Portal
          </Button>
        </Row>
        <Row>
          <Text style={footer}>
            If you have any questions about these documents, please contact your
            property manager.
          </Text>
        </Row>
        <Row>
          <Text style={footerSmall}>
            This is an automated notification from the Investor Portal system.
          </Text>
        </Row>
      </Section>
    </Html>
  );
}

// Styles
const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  width: "580px",
  maxWidth: "100%",
};

const heading = {
  fontSize: "24px",
  letterSpacing: "-0.5px",
  lineHeight: "1.3",
  fontWeight: "400",
  color: "#1e293b",
  padding: "17px 0 0",
  textAlign: "center" as const,
};

const paragraph = {
  margin: "0 0 15px",
  fontSize: "16px",
  lineHeight: "1.4",
  color: "#374151",
};

const detailsBox = {
  margin: "20px 0",
  padding: "16px",
  fontSize: "14px",
  lineHeight: "1.4",
  color: "#374151",
  backgroundColor: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "6px",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "30px 0",
};

const button = {
  backgroundColor: "#3b82f6",
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
};

const footer = {
  margin: "20px 0 10px",
  fontSize: "14px",
  lineHeight: "1.4",
  color: "#6b7280",
  textAlign: "center" as const,
};

const footerSmall = {
  margin: "10px 0 0",
  fontSize: "12px",
  lineHeight: "1.4",
  color: "#9ca3af",
  textAlign: "center" as const,
};
