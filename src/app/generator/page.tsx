import QRGenerator from "@/components/generator/QRGenerator";
import Navigation from "@/components/layout/Navigation";

export default function GeneratorPage() {
  return (
    <>
      <Navigation />
      <div className="pt-24 pb-8">
        <QRGenerator />
      </div>
    </>
  );
}
