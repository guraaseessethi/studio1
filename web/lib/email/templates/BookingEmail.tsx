import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text } from "@react-email/components";

export type EmailRow = [label: string, value: string];

export type BookingEmailProps = {
  preview: string;
  heading: string;
  intro: string;
  rows: EmailRow[];
  /** Paragraphs under a small heading, e.g. how to pay. */
  sectionTitle?: string;
  sectionLines?: string[];
  action?: { label: string; href: string };
  footerLines: string[];
};

const c = {
  black: "#0f0f0f",
  cream: "#f5eee6",
  latte: "#e7dacb",
  coffee: "#8a6a50",
  body: "#3d3935",
  muted: "#5a5550",
};

const display = "'Bebas Neue', Impact, 'Arial Narrow', Arial, sans-serif";
const sans = "Inter, -apple-system, 'Segoe UI', Arial, sans-serif";

export function BookingEmail({ preview, heading, intro, rows, sectionTitle, sectionLines, action, footerLines }: BookingEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ margin: 0, padding: "24px 12px", backgroundColor: c.cream, fontFamily: sans, color: c.body }}>
        <Container style={{ maxWidth: 560, margin: "0 auto", backgroundColor: "#ffffff" }}>
          <Section style={{ backgroundColor: c.black, padding: "18px 28px" }}>
            <Text style={{ margin: 0, fontFamily: display, fontSize: 26, letterSpacing: "0.06em", color: c.cream }}>
              STUDIO 1 BARBERSHOP
            </Text>
          </Section>
          <Section style={{ padding: "28px 28px 8px" }}>
            <Heading as="h1" style={{ margin: "0 0 12px", fontFamily: display, fontWeight: 400, fontSize: 38, lineHeight: "1", color: c.black }}>
              {heading}
            </Heading>
            <Text style={{ margin: 0, fontSize: 16, lineHeight: "1.6" }}>{intro}</Text>
          </Section>
          <Section style={{ padding: "12px 28px" }}>
            {rows.map(([label, value]) => (
              <table key={label} role="presentation" width="100%" style={{ borderTop: `1px solid ${c.latte}` }}>
                <tbody>
                  <tr>
                    <td style={{ padding: "10px 0", width: 130, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: c.muted, verticalAlign: "top" }}>
                      {label}
                    </td>
                    <td style={{ padding: "10px 0", fontSize: 15, color: c.black }}>{value}</td>
                  </tr>
                </tbody>
              </table>
            ))}
          </Section>
          {sectionTitle && sectionLines && sectionLines.length > 0 && (
            <Section style={{ margin: "8px 28px 0", padding: "16px 18px", backgroundColor: c.cream }}>
              <Text style={{ margin: "0 0 8px", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: c.coffee }}>
                {sectionTitle}
              </Text>
              {sectionLines.map((line) => (
                <Text key={line} style={{ margin: "0 0 6px", fontSize: 15, lineHeight: "1.55", color: c.black }}>
                  {line}
                </Text>
              ))}
            </Section>
          )}
          {action && (
            <Section style={{ padding: "20px 28px 0" }}>
              <Button
                href={action.href}
                style={{ backgroundColor: c.black, color: "#ffffff", padding: "14px 24px", fontSize: 13, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", textDecoration: "none" }}
              >
                {action.label}
              </Button>
            </Section>
          )}
          <Section style={{ padding: "24px 28px 28px" }}>
            <Hr style={{ borderColor: c.latte, margin: "0 0 16px" }} />
            {footerLines.map((line) => (
              <Text key={line} style={{ margin: "0 0 6px", fontSize: 13, lineHeight: "1.55", color: c.muted }}>
                {line}
              </Text>
            ))}
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
