import QRScanner from "@/components/scanner/QRScanner";
import Navigation from "@/components/layout/Navigation";

export default function ScannerPage() {
  return (
    <>
      <Navigation />
      <div className="pt-20">
        <QRScanner />
      </div>
    </>
  );
}
