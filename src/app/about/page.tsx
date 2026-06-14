import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Mail } from "lucide-react";

export default async function AboutPage() {
  const companyInfo = await prisma.companyInfo.findFirst();

  if (!companyInfo) {
    return <div className="text-center py-20">Company information not available.</div>;
  }

  const encodedAddress = encodeURIComponent(companyInfo.address || "");
  const mapUrl = `https://maps.google.com/maps?q=${encodedAddress}&output=embed`;

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="flex flex-col items-center text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="w-32 h-32 relative mb-6 rounded-md overflow-hidden border border-primary/20 shadow-lg">
          <Image src="/logo.png" alt={companyInfo.name} fill sizes="128px" className="object-contain p-2" priority />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary mb-4">
          Tentang {companyInfo.name}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Kualitas premium, rasa keluarga.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Biography & Story section */}
        <div className="space-y-6 animate-in fade-in slide-in-from-left-8 duration-1000 delay-150">
          <h2 className="text-3xl font-bold tracking-tight border-b pb-4">Our Story & Biography</h2>
          <div className="prose prose-lg dark:prose-invert text-muted-foreground leading-relaxed">
            <p>
              Berawal dari kecintaan kami terhadap kue kering buatan rumah tangga yang diwariskan turun-temurun, <strong>{companyInfo.name}</strong> hadir untuk menyajikan pengalaman menikmati <em>cookies</em> kelas premium untuk Anda semua.
            </p>
            <p>
              Setiap kue yang kami panggang menggunakan bahan-bahan pilihan berkualitas tinggi, tanpa bahan pengawet, dan selalu disajikan <em>fresh from the oven</em>. Kami percaya bahwa setiap gigitan harus membawa kebahagiaan dan kehangatan, sehangat kasih sayang keluarga.
            </p>
            <p>
              Dengan misi menyebarkan senyuman melalui kelezatan sederhana, kami terus berinovasi menciptakan berbagai varian rasa klasik hingga kekinian yang cocok menemani setiap momen spesial Anda. Selamat menikmati mahakarya rasa dari dapur kami!
            </p>
          </div>
          
          <div className="pt-6">
             <h3 className="text-xl font-bold mb-4">Hubungi Kami</h3>
             <Card className="bg-card shadow-md border-border/50">
               <CardContent className="p-6 space-y-5">
                 <div className="flex items-start gap-4">
                   <div className="bg-primary/10 p-2 rounded-full">
                     <MapPin className="text-primary w-5 h-5" />
                   </div>
                   <div>
                     <p className="font-semibold text-foreground">Alamat</p>
                     <p className="text-muted-foreground">{companyInfo.address}</p>
                   </div>
                 </div>
                 <div className="flex items-center gap-4">
                   <div className="bg-primary/10 p-2 rounded-full">
                     <Phone className="text-primary w-5 h-5" />
                   </div>
                   <div>
                     <p className="font-semibold text-foreground">Telepon</p>
                     <p className="text-muted-foreground">{companyInfo.phone}</p>
                   </div>
                 </div>
                 <div className="flex items-center gap-4">
                   <div className="bg-primary/10 p-2 rounded-full">
                     <Mail className="text-primary w-5 h-5" />
                   </div>
                   <div>
                     <p className="font-semibold text-foreground">Email</p>
                     <p className="text-muted-foreground">{companyInfo.email}</p>
                   </div>
                 </div>
               </CardContent>
             </Card>
          </div>
        </div>

        {/* Maps section */}
        <div className="h-full min-h-[500px] w-full bg-muted rounded-2xl overflow-hidden shadow-xl border border-border/50 animate-in fade-in slide-in-from-right-8 duration-1000 delay-300">
          <iframe
            src={mapUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full min-h-[500px]"
            title={`Lokasi ${companyInfo.name}`}
          ></iframe>
        </div>
      </div>
    </div>
  );
}
