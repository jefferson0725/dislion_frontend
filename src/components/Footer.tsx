import { Phone, Mail, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

const Footer = () => {
  const [contactPhone, setContactPhone] = useState<string>("");
  const [contactEmail, setContactEmail] = useState<string>("");
  const [contactAddress, setContactAddress] = useState<string>("");
  const [showAddress, setShowAddress] = useState<boolean>(false);

  useEffect(() => {
    const loadFooterInfo = async () => {
      try {
        const res = await axios.get('/data.json');
        const data = res.data;
        setContactPhone(data.settings?.contact_phone || '+57 300 757 1199');
        setContactEmail(data.settings?.contact_email || 'contacto@dislion.com');
        setContactAddress(data.settings?.contact_address || 'Calle 123 #45-67, Bogotá, Colombia');
        setShowAddress(data.settings?.show_address === 'true' || data.settings?.show_address === true);
      } catch (err) {
        console.error('Error loading footer info:', err);
        setContactPhone('+57 300 757 1199');
        setContactEmail('contacto@dislion.com');
        setContactAddress('Calle 123 #45-67, Bogotá, Colombia');
        setShowAddress(false);
      }
    };
    loadFooterInfo();
  }, []);

  return (
    <footer className="mt-auto py-8 border-t-0 bg-[#0A1045]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
          {/* Dirección */}
          {showAddress && (
            <div className="flex items-center gap-2 text-white">
              <div className="p-2 bg-white/10 rounded-full">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="font-medium">{contactAddress}</span>
            </div>
          )}

          {/* Teléfono */}
          <a 
            href={`tel:${contactPhone.replace(/\s/g, '')}`}
            className="flex items-center gap-2 text-white hover:text-[#FF4000] transition-colors group"
          >
            <div className="p-2 bg-white/10 rounded-full group-hover:bg-white/20 transition-colors">
              <Phone className="w-5 h-5" />
            </div>
            <span className="font-medium">{contactPhone}</span>
          </a>

          {/* Email */}
          <a 
            href={`mailto:${contactEmail}`}
            className="flex items-center gap-2 text-white hover:text-[#FF4000] transition-colors group"
          >
            <div className="p-2 bg-white/10 rounded-full group-hover:bg-white/20 transition-colors">
              <Mail className="w-5 h-5" />
            </div>
            <span className="font-medium">{contactEmail}</span>
          </a>
        </div>

        {/* Copyright */}
        <div className="text-center mt-6 text-sm text-white/70">
          © {new Date().getFullYear()} DISLION. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
