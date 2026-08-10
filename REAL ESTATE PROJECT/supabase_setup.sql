-- HomeMatch AI Database Schema Setup
-- Run this in your Supabase SQL Editor to initialize all tables, enums, and Row Level Security policies.

-- Create custom enums
CREATE TYPE user_role AS ENUM ('user', 'owner', 'admin');
CREATE TYPE property_type AS ENUM ('apartment', 'villa', 'independent_house', 'builder_floor');
CREATE TYPE availability_status AS ENUM ('available', 'rented', 'sold');
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected');

-- 1. Profiles Table
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar TEXT,
    role user_role DEFAULT 'user' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to profiles" 
    ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Allow users to update their own profiles" 
    ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Properties Table
CREATE TABLE public.properties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    purpose TEXT CHECK (purpose IN ('rent', 'buy')) NOT NULL,
    property_type property_type NOT NULL,
    price NUMERIC NOT NULL,
    city TEXT NOT NULL,
    locality TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    bhk INT NOT NULL,
    bathrooms INT NOT NULL,
    area INT NOT NULL, -- square feet
    furnishing TEXT CHECK (furnishing IN ('unfurnished', 'semi-furnished', 'furnished')) DEFAULT 'unfurnished',
    parking BOOLEAN DEFAULT false NOT NULL,
    gym BOOLEAN DEFAULT false NOT NULL,
    balcony BOOLEAN DEFAULT false NOT NULL,
    pet_friendly BOOLEAN DEFAULT false NOT NULL,
    gated_community BOOLEAN DEFAULT false NOT NULL,
    bachelor_friendly BOOLEAN DEFAULT false NOT NULL,
    availability availability_status DEFAULT 'available' NOT NULL,
    verified_owner BOOLEAN DEFAULT false NOT NULL,
    verified_property BOOLEAN DEFAULT false NOT NULL,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    distance_to_metro INT, -- in meters
    nearby_metro_station TEXT,
    distance_to_school INT,
    nearby_school TEXT,
    distance_to_hospital INT,
    nearby_hospital TEXT,
    views INTEGER DEFAULT 0 NOT NULL,
    favorites INTEGER DEFAULT 0 NOT NULL,
    inquiries INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Properties
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Properties are viewable by everyone" 
    ON public.properties FOR SELECT USING (true);

CREATE POLICY "Owners can insert their own properties" 
    ON public.properties FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their own properties" 
    ON public.properties FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their own properties" 
    ON public.properties FOR DELETE USING (auth.uid() = owner_id);

-- 3. Property Images Table
CREATE TABLE public.property_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Images are viewable by everyone" 
    ON public.property_images FOR SELECT USING (true);

-- 4. Favorites Table
CREATE TABLE public.favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, property_id)
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own favorites" 
    ON public.favorites FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites" 
    ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove favorites" 
    ON public.favorites FOR DELETE USING (auth.uid() = user_id);

-- 5. Conversations Table
CREATE TABLE public.conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL, -- seeker
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL, -- seller
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(property_id, user_id, owner_id)
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversations" 
    ON public.conversations FOR SELECT USING (auth.uid() = user_id OR auth.uid() = owner_id);

CREATE POLICY "Users can start conversations" 
    ON public.conversations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. Messages Table
CREATE TABLE public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    text TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their conversations" 
    ON public.messages FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversations c 
            WHERE c.id = messages.conversation_id AND (c.user_id = auth.uid() OR c.owner_id = auth.uid())
        )
    );

CREATE POLICY "Users can post messages to their conversations" 
    ON public.messages FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND EXISTS (
            SELECT 1 FROM public.conversations c 
            WHERE c.id = messages.conversation_id AND (c.user_id = auth.uid() OR c.owner_id = auth.uid())
        )
    );

-- 7. Notifications Table
CREATE TABLE public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT CHECK (type IN ('system', 'chat', 'recommend', 'alert')) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" 
    ON public.notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
    ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- 8. Property Verifications Table
CREATE TABLE public.property_verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
    document_name TEXT NOT NULL,
    document_url TEXT NOT NULL,
    status verification_status DEFAULT 'pending' NOT NULL,
    verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.property_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all verifications" 
    ON public.property_verifications FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

CREATE POLICY "Owners can view their own verifications" 
    ON public.property_verifications FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.properties prop 
            WHERE prop.id = property_verifications.property_id AND prop.owner_id = auth.uid()
        )
    );

-- 9. Trigger to Auto-Create Profile after user Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, avatar, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', 'New User'),
    new.email,
    COALESCE(new.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/adventurer/svg?seed=' || new.id),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
