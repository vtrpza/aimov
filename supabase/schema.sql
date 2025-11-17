-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Properties table
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price_brl DECIMAL(15, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('apartment', 'house', 'commercial', 'land', 'farm')),
  bedrooms INTEGER,
  bathrooms INTEGER,
  area_m2 DECIMAL(10, 2) NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  cep TEXT NOT NULL,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  images TEXT[] DEFAULT '{}',
  amenities TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'sold', 'rented', 'pending')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for property searches
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_state ON properties(state);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(type);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price_brl);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  budget_min DECIMAL(15, 2),
  budget_max DECIMAL(15, 2),
  property_type_interest TEXT[] DEFAULT '{}',
  cities_interest TEXT[] DEFAULT '{}',
  qualification_status TEXT NOT NULL DEFAULT 'new' CHECK (qualification_status IN ('new', 'qualified', 'contacted', 'converted', 'lost')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for lead searches
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(qualification_status);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for conversations
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  function_calls JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);

-- Property interactions table
CREATE TABLE IF NOT EXISTS property_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('view', 'favorite', 'scheduled_viewing')),
  scheduled_viewing_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for property interactions
CREATE INDEX IF NOT EXISTS idx_property_interactions_user_id ON property_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_property_interactions_property_id ON property_interactions(property_id);
CREATE INDEX IF NOT EXISTS idx_property_interactions_type ON property_interactions(interaction_type);

-- Enable Row Level Security
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for properties (public read, admin write)
CREATE POLICY "Properties are viewable by everyone" ON properties
  FOR SELECT USING (true);

CREATE POLICY "Properties are insertable by authenticated users" ON properties
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Properties are updatable by authenticated users" ON properties
  FOR UPDATE USING (auth.role() = 'authenticated');

-- RLS Policies for leads (only accessible by authenticated users)
CREATE POLICY "Leads are viewable by authenticated users" ON leads
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Leads are insertable by everyone (for lead capture)" ON leads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Leads are updatable by authenticated users" ON leads
  FOR UPDATE USING (auth.role() = 'authenticated');

-- RLS Policies for conversations (users can only see their own)
CREATE POLICY "Users can view their own conversations" ON conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" ON conversations
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for messages (users can only see messages in their conversations)
CREATE POLICY "Users can view messages in their conversations" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in their conversations" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- RLS Policies for property_interactions (users can only see their own)
CREATE POLICY "Users can view their own interactions" ON property_interactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own interactions" ON property_interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interactions" ON property_interactions
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing (Brazilian properties)
INSERT INTO properties (title, description, price_brl, type, bedrooms, bathrooms, area_m2, address, city, state, cep, amenities) VALUES
('Apartamento Moderno no Jardins', 'Lindo apartamento de 3 quartos com vista para o Parque, acabamento de primeira linha, varanda gourmet e 2 vagas de garagem.', 1200000.00, 'apartment', 3, 2, 120.00, 'Rua Augusta, 2000', 'São Paulo', 'SP', '01304-000', ARRAY['piscina', 'academia', 'varanda', 'garagem']),
('Casa em Condomínio Fechado - Alphaville', 'Casa espaçosa com 4 suítes, piscina, churrasqueira, jardim amplo e segurança 24h. Localização privilegiada.', 2500000.00, 'house', 4, 5, 350.00, 'Alameda Rio Negro, 123', 'Barueri', 'SP', '06454-000', ARRAY['piscina', 'churrasqueira', 'jardim', 'segurança 24h']),
('Cobertura Duplex na Barra da Tijuca', 'Cobertura de luxo com 5 quartos, terraço com piscina privativa, vista mar, 4 vagas. Prédio com infraestrutura completa.', 3800000.00, 'apartment', 5, 4, 280.00, 'Av. das Américas, 5000', 'Rio de Janeiro', 'RJ', '22640-102', ARRAY['piscina', 'vista para o mar', 'academia', 'sauna']),
('Kitnet Centro - Próximo ao Metrô', 'Kitnet compacta e funcional, ideal para investimento ou primeiro imóvel. Localização excelente, próximo a transporte e comércio.', 280000.00, 'apartment', 1, 1, 28.00, 'Rua da Consolação, 800', 'São Paulo', 'SP', '01302-000', ARRAY['portaria 24h']),
('Terreno Comercial - Esquina', 'Excelente terreno comercial em esquina, ideal para empreendimentos comerciais ou residenciais. Ótima localização.', 850000.00, 'land', NULL, NULL, 450.00, 'Av. Paulista, 1500', 'São Paulo', 'SP', '01310-100', ARRAY['esquina', 'comercial']),
('Chácara em Atibaia', 'Linda chácara com casa sede, piscina, lago, pomar e área de lazer completa. Perfeita para finais de semana em família.', 1100000.00, 'farm', 3, 2, 5000.00, 'Estrada Municipal, Km 15', 'Atibaia', 'SP', '12940-000', ARRAY['piscina', 'lago', 'pomar', 'área de lazer']);
