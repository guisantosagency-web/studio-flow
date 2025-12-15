-- Enum para status de agendamentos
CREATE TYPE public.appointment_status AS ENUM ('pendente', 'confirmado', 'concluido', 'cancelado');

-- Enum para roles
CREATE TYPE public.app_role AS ENUM ('admin', 'client');

-- Tabela de perfis de usuários (clientes)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  sobrenome TEXT,
  whatsapp TEXT NOT NULL UNIQUE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'client',
  UNIQUE (user_id, role)
);

-- Tabela de serviços
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  duracao INTEGER NOT NULL DEFAULT 60,
  valor DECIMAL(10,2),
  exibir_valor BOOLEAN DEFAULT true,
  requer_anamnese BOOLEAN DEFAULT false,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de horários disponíveis
CREATE TABLE public.available_times (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data DATE NOT NULL,
  hora TIME NOT NULL,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(data, hora)
);

-- Tabela de agendamentos
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE NOT NULL,
  data DATE NOT NULL,
  hora TIME NOT NULL,
  status appointment_status DEFAULT 'pendente',
  anamnese_json JSONB,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de perguntas de anamnese
CREATE TABLE public.anamnese_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pergunta TEXT NOT NULL,
  tipo TEXT DEFAULT 'boolean',
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.available_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anamnese_questions ENABLE ROW LEVEL SECURITY;

-- Função para verificar role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- User roles policies
CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Services policies (public read)
CREATE POLICY "Anyone can view active services" ON public.services FOR SELECT USING (ativo = true);
CREATE POLICY "Admins can manage services" ON public.services FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Available times policies (public read)
CREATE POLICY "Anyone can view active times" ON public.available_times FOR SELECT USING (ativo = true);
CREATE POLICY "Admins can manage times" ON public.available_times FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Appointments policies
CREATE POLICY "Users can view own appointments" ON public.appointments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own appointments" ON public.appointments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own appointments" ON public.appointments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all appointments" ON public.appointments FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Anamnese questions policies (public read)
CREATE POLICY "Anyone can view active questions" ON public.anamnese_questions FOR SELECT USING (ativo = true);
CREATE POLICY "Admins can manage questions" ON public.anamnese_questions FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Trigger para criar profile automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, nome, whatsapp)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'nome', 'Cliente'),
    COALESCE(NEW.raw_user_meta_data ->> 'whatsapp', '')
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'client');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Inserir serviços padrão
INSERT INTO public.services (nome, descricao, duracao, valor, exibir_valor, requer_anamnese) VALUES
('Design Simples', 'Design de sobrancelhas com técnica personalizada', 45, 80.00, true, false),
('Design + Henna', 'Design completo com aplicação de henna', 60, 120.00, true, false),
('Brow Lamination', 'Laminação de sobrancelhas com efeito natural', 90, 180.00, true, true);

-- Inserir perguntas de anamnese padrão
INSERT INTO public.anamnese_questions (pergunta, tipo, ordem) VALUES
('Está gestante?', 'boolean', 1),
('Usa ácidos?', 'boolean', 2),
('Já fez laminação antes?', 'boolean', 3),
('Possui alergia?', 'boolean', 4),
('Observações', 'textarea', 5);