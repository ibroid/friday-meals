import { prisma } from "@/lib/prisma";

export default async function FloatingWhatsApp() {
  const companyInfo = await prisma.companyInfo.findFirst();
  if (!companyInfo || !companyInfo.phone) return null;

  // Clean the phone number to digits only
  // Example: +62 811 2233 4455 -> 6281122334455
  const cleanPhone = companyInfo.phone.replace(/\D/g, "");

  return (
    <a
      href={`https://wa.me/${cleanPhone}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-[0_4px_14px_rgba(37,211,102,0.4)] hover:bg-[#1ebe57] hover:scale-110 transition-all duration-300"
      aria-label="Chat on WhatsApp"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-8 h-8"
      >
        <path d="M12.031 0C5.385 0 .012 5.372.012 12.018c0 2.128.552 4.195 1.602 6.012L0 24l6.126-1.607a11.936 11.936 0 005.905 1.562h.004c6.645 0 12.017-5.372 12.017-12.017C24.053 5.373 18.677 0 12.031 0zm.004 21.968a9.919 9.919 0 01-5.068-1.385l-.364-.216-3.766.988.995-3.673-.236-.376A9.907 9.907 0 012.01 12.017c0-5.503 4.478-9.98 9.982-9.98 5.503 0 9.98 4.478 9.98 9.98 0 5.504-4.477 9.98-9.98 9.98zm5.48-7.51c-.302-.15-1.782-.88-2.057-.98-.276-.1-.476-.15-.678.15-.202.302-.777.98-.952 1.18-.176.2-.353.226-.655.076-.302-.15-1.272-.47-2.423-1.498-.895-.8-1.503-1.788-1.68-2.088-.175-.302-.018-.465.132-.615.135-.136.302-.354.453-.532.15-.175.2-.301.301-.502.1-.202.05-.376-.025-.526-.075-.15-.678-1.636-.928-2.242-.243-.591-.49-.51-.678-.519-.175-.008-.376-.01-.577-.01-.2 0-.527.075-.803.376-.276.301-1.054 1.03-1.054 2.508 0 1.48 1.078 2.912 1.228 3.113.15.202 2.122 3.24 5.138 4.542.718.311 1.278.497 1.716.636.721.23 1.378.197 1.895.12.578-.087 1.782-.729 2.032-1.433.25-.705.25-1.31.176-1.433-.075-.126-.276-.202-.578-.353z" />
      </svg>
    </a>
  );
}
