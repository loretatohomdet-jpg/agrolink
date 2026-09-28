-- AgroLink Schema Definition
-- Platform geographic focus: Plateau State, Nigeria

-- Enable UUID extension if available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if they exist (for reset/clean start)
DROP TABLE IF EXISTS disputes CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS ratings CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS demand_requests CASCADE;
DROP TABLE IF EXISTS produce_listings CASCADE;
DROP TABLE IF EXISTS farm_locations CASCADE;
DROP TABLE IF EXISTS buyer_profiles CASCADE;
DROP TABLE IF EXISTS farmer_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('farmer', 'buyer', 'admin', 'logistics')),
    preferred_language VARCHAR(10) DEFAULT 'en' CHECK (preferred_language IN ('en', 'ha')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Farmer Profiles Table
CREATE TABLE farmer_profiles (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    farm_name VARCHAR(255) NOT NULL,
    farm_size NUMERIC CHECK (farm_size > 0), -- in hectares
    experience_years INTEGER CHECK (experience_years >= 0),
    cooperative_name VARCHAR(255),
    verification_status VARCHAR(50) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'under_review', 'verified', 'rejected')),
    profile_photo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Buyer Profiles Table
CREATE TABLE buyer_profiles (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    business_type VARCHAR(100) NOT NULL CHECK (business_type IN ('wholesaler', 'processor', 'retailer', 'restaurant', 'hotel', 'food_company', 'institution', 'exporter', 'other')),
    business_registration_number VARCHAR(100),
    website VARCHAR(255),
    verification_status VARCHAR(50) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Farm/Business Locations Table
CREATE TABLE farm_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    address TEXT NOT NULL,
    state VARCHAR(100) DEFAULT 'Plateau',
    lga VARCHAR(100) NOT NULL, -- Jos South, Bokkos, Bassa, Mangu, Jos North, Barkin Ladi, Riyom, etc.
    community VARCHAR(255),
    latitude NUMERIC,
    longitude NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Produce Listings Table
CREATE TABLE produce_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL CHECK (category IN ('Irish Potato', 'Tomato', 'Onion', 'Maize', 'Rice', 'Soybean', 'Pepper', 'Vegetables', 'Fruits', 'Other')),
    variety VARCHAR(100),
    quantity NUMERIC NOT NULL CHECK (quantity >= 0),
    unit VARCHAR(50) NOT NULL, -- tonnes, bags, kg, etc.
    price_per_unit NUMERIC NOT NULL CHECK (price_per_unit >= 0),
    price_type VARCHAR(50) DEFAULT 'fixed' CHECK (price_type IN ('fixed', 'negotiable')),
    quality_grade VARCHAR(50) NOT NULL CHECK (quality_grade IN ('Grade A', 'Grade B', 'Grade C')),
    harvest_date DATE NOT NULL,
    available_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    description TEXT,
    images TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Buyer Demand Requests Table
CREATE TABLE demand_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product VARCHAR(100) NOT NULL, -- product category or name
    quantity NUMERIC NOT NULL CHECK (quantity > 0),
    unit VARCHAR(50) NOT NULL,
    quality_grade VARCHAR(50) NOT NULL CHECK (quality_grade IN ('Grade A', 'Grade B', 'Grade C')),
    delivery_location_lga VARCHAR(100) NOT NULL,
    delivery_location_state VARCHAR(100) DEFAULT 'Plateau',
    required_date DATE NOT NULL,
    price_min NUMERIC,
    price_max NUMERIC,
    additional_requirements TEXT,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'fulfilled', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Matches Table
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    demand_id UUID NOT NULL REFERENCES demand_requests(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES produce_listings(id) ON DELETE CASCADE,
    score NUMERIC NOT NULL CHECK (score >= 0 AND score <= 100),
    quantity_score NUMERIC NOT NULL CHECK (quantity_score >= 0 AND quantity_score <= 100),
    quality_score NUMERIC NOT NULL CHECK (quality_score >= 0 AND quality_score <= 100),
    timing_score NUMERIC NOT NULL CHECK (timing_score >= 0 AND timing_score <= 100),
    location_score NUMERIC NOT NULL CHECK (location_score >= 0 AND location_score <= 100),
    reliability_score NUMERIC NOT NULL CHECK (reliability_score >= 0 AND reliability_score <= 100),
    explanation TEXT,
    explanation_ha TEXT,
    status VARCHAR(50) DEFAULT 'suggested' CHECK (status IN ('suggested', 'interested', 'contacted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (demand_id, listing_id)
);

-- 8. Transactions Table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    supplier_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    listing_id UUID REFERENCES produce_listings(id) ON DELETE SET NULL,
    demand_id UUID REFERENCES demand_requests(id) ON DELETE SET NULL,
    product VARCHAR(100) NOT NULL,
    quantity NUMERIC NOT NULL CHECK (quantity > 0),
    unit VARCHAR(50) NOT NULL,
    price_per_unit NUMERIC NOT NULL CHECK (price_per_unit >= 0),
    total_value NUMERIC NOT NULL CHECK (total_value >= 0),
    delivery_location TEXT NOT NULL,
    expected_delivery_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'inquiry' CHECK (status IN ('inquiry', 'negotiation', 'agreement', 'confirmed', 'in_progress', 'completed', 'cancelled', 'disputed')),
    payment_status VARCHAR(50) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'escrow', 'paid', 'refunded')),
    payment_reference VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Ratings & Reviews Table
CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating NUMERIC NOT NULL CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    
    -- Farmer-specific ratings (null if buyer is rated)
    quality_rating NUMERIC CHECK (quality_rating >= 1 AND quality_rating <= 5),
    fulfilment_rating NUMERIC CHECK (fulfilment_rating >= 1 AND fulfilment_rating <= 5),
    accuracy_rating NUMERIC CHECK (accuracy_rating >= 1 AND accuracy_rating <= 5),
    
    -- Buyer-specific ratings (null if farmer is rated)
    payment_rating NUMERIC CHECK (payment_rating >= 1 AND payment_rating <= 5),
    professionalism_rating NUMERIC CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
    
    -- Common rating category
    communication_rating NUMERIC CHECK (communication_rating >= 1 AND communication_rating <= 5),
    
    is_moderated BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (transaction_id, author_id)
);

-- 10. Messages Table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Notifications Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    link VARCHAR(255),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Disputes Table
CREATE TABLE disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    raised_by_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    reason TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'dismissed')),
    resolution_details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance optimization
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_farmer_verification ON farmer_profiles(verification_status);
CREATE INDEX idx_buyer_verification ON buyer_profiles(verification_status);
CREATE INDEX idx_locations_lga ON farm_locations(lga);
CREATE INDEX idx_listings_category ON produce_listings(category);
CREATE INDEX idx_listings_active ON produce_listings(is_active);
CREATE INDEX idx_demand_status ON demand_requests(status);
CREATE INDEX idx_matches_score ON matches(score DESC);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_messages_unread ON messages(recipient_id) WHERE is_read = false;
CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE is_read = false;
