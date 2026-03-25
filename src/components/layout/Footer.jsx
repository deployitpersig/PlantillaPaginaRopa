import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-8 pb-8 px-6 md:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-8">
        {/* Brand */}
        <div>
          <h3 className="text-2xl font-black tracking-tighter mb-4">Hoodie.</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-xs">
            Esenciales de streetwear premium. Pensados para la estética moderna con calidad sin concesiones.
          </p>
          <div className="flex space-x-4">
            {/* Social Icons Placeholder */}
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">In</div>
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">Tw</div>
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">Fb</div>
          </div>
        </div>

        {/* Links */}
        <div>
          <h4 className="font-semibold mb-6">Tienda</h4>
          <ul className="space-y-4 text-sm text-gray-500">
            <li><a href="#" className="hover:text-black transition-colors">Hombres</a></li>
            <li><a href="#" className="hover:text-black transition-colors">Mujeres</a></li>
            <li><a href="#" className="hover:text-black transition-colors">Niños</a></li>
            <li><a href="#" className="hover:text-black transition-colors">Accesorios</a></li>
            <li><a href="#" className="hover:text-black transition-colors">Ofertas</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-6">Soporte</h4>
          <ul className="space-y-4 text-sm text-gray-500">
            <li><a href="#" className="hover:text-black transition-colors">Centro de ayuda</a></li>
            <li><a href="#" className="hover:text-black transition-colors">Envíos y devoluciones</a></li>
            <li><a href="#" className="hover:text-black transition-colors">Estado del pedido</a></li>
            <li><a href="#" className="hover:text-black transition-colors">Contacto</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-6">Empresa</h4>
          <ul className="space-y-4 text-sm text-gray-500">
            <li><a href="#" className="hover:text-black transition-colors">Sobre nosotros</a></li>
            <li><a href="#" className="hover:text-black transition-colors">Empleo</a></li>
            <li><a href="#" className="hover:text-black transition-colors">Política de privacidad</a></li>
            <li><a href="#" className="hover:text-black transition-colors">Términos de servicio</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between pt-8 border-t border-gray-100 text-sm text-gray-400">
        <p>© 2026 Hoodie. Todos los derechos reservados.</p>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <span>Visa</span>
          <span>Mastercard</span>
          <span>Paypal</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
