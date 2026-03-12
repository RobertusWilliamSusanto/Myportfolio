import "./globals.css";
import CustomCursor from "@/components/CustomCursor"; // <--- Import kursornya

export const metadata = {
  title: "Robertus William Susanto | Portfolio",
  description: "Computer Engineering Student focusing on AI and Software Engineering",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CustomCursor /> {/* <--- Panggil di sini */}
        {children}
      </body>
    </html>
  );
}