import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-gray-800 text-white py-4 mt-auto space-y-2">
      <div className="container mx-auto text-center">
        <nav className="mt-2">
          <Link href="/privacy-policy" className="text-gray-400 hover:text-white"><strong>Privacy Policy</strong></Link>
        </nav>
        <p className="text-sm ">&copy; {new Date().getFullYear()} Security Risk Checker. All rights reserved for <Link className="text-sm underline" href="https://shariat.de">Shariat.de</Link></p>
      </div>
    </footer>
  );
}
