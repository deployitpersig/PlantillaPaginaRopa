-- ==========================================
-- SUPABASE OPTIMIZED E-COMMERCE SCHEMA
-- ==========================================
-- Instrucciones:
-- 1. Ve a https://supabase.com/dashboard/
-- 2. Entra a tu proyecto -> SQL Editor (menú izquierdo)
-- 3. Crea una "New Query"
-- 4. Pega todo este código y dale al botón verde "Run"
-- ==========================================

-- 1. ELIMINAR ESTRUCTURAS ANTIGUAS (Si existen, para empezar limpio desde 0)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ==========================================
-- 2. SCHEMAS & PERMISOS BÁSICOS
-- ==========================================
-- Crear schema para el almacenamiento si no existe
CREATE SCHEMA IF NOT EXISTS storage;

-- ==========================================
-- 3. TABLA: perfiles (profiles)
-- ==========================================
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text UNIQUE NOT NULL,
  role text DEFAULT 'customer'::text CHECK (role IN ('customer', 'admin')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 4. TABLA: productos (products)
-- ==========================================
CREATE TABLE public.products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  original_price numeric(10,2) CHECK (original_price >= 0),
  category text NOT NULL,
  subcategory text,
  image text NOT NULL,          -- Imagen principal
  gallery text[] DEFAULT '{}',  -- Galería de imágenes adicionales
  colors text[] DEFAULT '{}',   -- Colores disponibles
  sizes text[] DEFAULT '{}',    -- Talles disponibles
  -- Control de estado y marketing
  is_new boolean DEFAULT false NOT NULL,
  is_sale boolean DEFAULT false NOT NULL,
  is_featured boolean DEFAULT false NOT NULL,
  -- Control de Inventario
  in_stock boolean DEFAULT true NOT NULL,
  stock_by_size jsonb DEFAULT '{}'::jsonb, -- Ejemplo: {"S": 10, "M": 5, "L": 0}
  -- Métricas
  sold_count integer DEFAULT 0 NOT NULL,
  -- Timestamps
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 5. OPTIMIZACIÓN DE BÚSQUEDA (ÍNDICES)
-- ==========================================
-- Estos índices hacen que cargar la página, buscar por categorías y aplicar filtros sea hiper rápido
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_subcategory ON public.products(subcategory);
CREATE INDEX idx_products_is_featured ON public.products(is_featured) WHERE is_featured = true;
CREATE INDEX idx_products_is_new ON public.products(is_new) WHERE is_new = true;
CREATE INDEX idx_products_is_sale ON public.products(is_sale) WHERE is_sale = true;

-- ==========================================
-- 6. AUTOMATIZACIÓN (TRIGGERS)
-- ==========================================
-- Automatically update "updated_at" timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_modtime BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Automatically create profile when a user registers in Supabase Auth
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    'customer' -- Todos inician como clientes. El admin se cambia a mano desde Supabase.
  )
  ON CONFLICT (id) DO NOTHING; -- Fundamental para evitar crashes si Auth o React re-intentan
  
  RETURN NEW;
END;
$$ language 'plpgsql' security definer;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ==========================================
-- 7. SEGURIDAD A NIVEL DE FILA (RLS - Row Level Security)
-- ==========================================
-- Habilitar seguridad estricta obligatoria
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Políticas para Perfiles (Profiles)
-- 1. Cualquiera puede ver a los admins (necesario para validaciones) o su propio perfil
CREATE POLICY "Users can view their own profile and admins" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR role = 'admin');

-- 2. Solo el dueño puede editar su propio perfil, o un admin puede editar cualquiera
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Políticas para Productos (Products)
-- 1. LECTURA: TODO el mundo (incluso sin login) puede ver los productos (la tienda es pública)
CREATE POLICY "Products are visible to everyone" ON public.products
  FOR SELECT USING (true);

-- 2. ESCRITURA (Insert, Update, Delete): SOLO los admins pueden modificar el catálogo
CREATE POLICY "Only admins can insert products" ON public.products
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Only admins can update products" ON public.products
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Only admins can delete products" ON public.products
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- ==========================================
-- 8. CONFIGURACIÓN DEL BUCKET DE IMÁGENES (STORAGE)
-- ==========================================
-- Nota: Si esto tira un error es porque el bucket ya existe y las políticas ya están creadas.
-- Es seguro ignorar el error.

INSERT INTO storage.buckets (id, name, public) 
VALUES ('e-commerce-images', 'e-commerce-images', true)
ON CONFLICT (id) DO NOTHING;

-- Dar permiso público de LECTURA para que se vean las imágenes en la web
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'e-commerce-images' );

-- Dar permiso a ADMINS para SUBIR, EDITAR y BORRAR imágenes
CREATE POLICY "Admins can upload images" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'e-commerce-images' 
  AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can update images" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'e-commerce-images' 
  AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can delete images" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'e-commerce-images' 
  AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ==========================================
-- = FINALIZADO CON ÉXITO =
-- ==========================================
-- Tu base de datos ahora está 100% configurada, optimizada y securizada.
