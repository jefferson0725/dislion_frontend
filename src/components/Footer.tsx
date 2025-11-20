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
    <footer 
      className="mt-auto py-8 border-t"
      style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #FFE5D0 50%, #FFC299 100%)' }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
          {/* Dirección */}
          {showAddress && (
            <div className="flex items-center gap-2 text-gray-800">
              <div className="p-2 bg-white/70 rounded-full">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="font-medium">{contactAddress}</span>
            </div>
          )}

          {/* Teléfono */}
          <a 
            href={`tel:${contactPhone.replace(/\s/g, '')}`}
            className="flex items-center gap-2 text-gray-800 hover:text-secondary transition-colors group"
          >
            <div className="p-2 bg-white/70 rounded-full group-hover:bg-white transition-colors">
              <Phone className="w-5 h-5" />
            </div>
            <span className="font-medium">{contactPhone}</span>
          </a>

          {/* Email */}
          <a 
            href={`mailto:${contactEmail}`}
            className="flex items-center gap-2 text-gray-800 hover:text-secondary transition-colors group"
          >
            <div className="p-2 bg-white/70 rounded-full group-hover:bg-white transition-colors">
              <Mail className="w-5 h-5" />
            </div>
            <span className="font-medium">{contactEmail}</span>
          </a>
        </div>

        {/* Copyright */}
        <div className="text-center mt-6 text-sm text-gray-600">
          © {new Date().getFullYear()} DISLION. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
